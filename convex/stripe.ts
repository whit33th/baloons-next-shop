"use node";

import crypto from "node:crypto";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type Stripe from "stripe";
import { internal } from "./_generated/api.js";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { getStripeClient } from "./helpers/stripeClient";
import {
  customerValidator,
  orderItemInputValidator,
  type PaymentStatus,
  paymentSourceValidator,
  paymentStatusValidator,
  shippingValidator,
} from "./paymentMutations";

const paymentMetadataValidator = v.record(v.string(), v.string());

type StripeIntentSummary = {
  paymentIntentId: string;
  clientSecret: string;
  status: PaymentStatus;
  latestChargeId?: string;
  lastError?: string;
};

type PaymentIntentRecord = {
  _id: Id<"payments">;
  orderId?: Id<"orders">;
};

type SubmitPaymentResult = {
  paymentIntentId: string;
  status: PaymentStatus;
  clientSecret?: string;
  lastError?: string;
};

type SyncPaymentIntentStatusResult = {
  paymentIntentId: string;
  status: PaymentStatus;
  paymentId: Id<"payments">;
  orderId?: Id<"orders">;
  clientSecret?: string;
  lastError?: string;
};

const summarizeItems = (
  items: ReadonlyArray<{ productName: string; quantity: number }>,
) =>
  items
    .map((item) => `${item.quantity}x ${item.productName}`)
    .slice(0, 15)
    .join(", ");

const sanitizeForStripe = (value: string) => {
  // Stripe limits metadata values to 500 characters. Convert very long
  // values to a short sha256 fingerprint so we never exceed that limit.
  if (value.length <= 480) return value;
  return `sha256:${crypto.createHash("sha256").update(value).digest("hex")}`;
};

const derivePaymentStatus = (
  stripeStatus: Stripe.PaymentIntent.Status,
  lastError?: string,
): PaymentStatus => {
  if (stripeStatus === "requires_payment_method" && lastError) {
    return "failed";
  }

  switch (stripeStatus) {
    case "requires_payment_method":
    case "requires_confirmation":
    case "requires_action":
    case "processing":
    case "requires_capture":
    case "succeeded":
    case "canceled":
      return stripeStatus;
    default:
      return "requires_payment_method";
  }
};

const mapIntent = (
  intent: Stripe.PaymentIntent,
  options?: { expectClientSecret?: boolean },
): StripeIntentSummary => {
  const lastError = intent.last_payment_error?.message;
  const latestChargeId =
    typeof intent.latest_charge === "string"
      ? intent.latest_charge
      : intent.latest_charge?.id;

  if (options?.expectClientSecret !== false && !intent.client_secret) {
    throw new Error("Stripe did not return a client secret");
  }

  return {
    paymentIntentId: intent.id,
    clientSecret: intent.client_secret ?? "",
    status: derivePaymentStatus(intent.status, lastError),
    latestChargeId: latestChargeId ?? undefined,
    lastError: lastError ?? undefined,
  };
};

export const submitPayment = action({
  args: {
    items: v.array(orderItemInputValidator),
    customer: customerValidator,
    shipping: shippingValidator,
    paymentCurrency: v.string(),
    displayAmount: v.object({
      value: v.number(),
      currency: v.string(),
      conversionRate: v.optional(v.number()),
      conversionFeePct: v.optional(v.number()),
    }),
    paymentMethodId: v.string(),
    cartSignature: v.optional(v.string()),
    paymentSource: paymentSourceValidator,
    metadata: v.optional(paymentMetadataValidator),
  },
  returns: v.object({
    paymentIntentId: v.string(),
    status: paymentStatusValidator,
    clientSecret: v.optional(v.string()),
    lastError: v.optional(v.string()),
  }),
  handler: async (ctx, args): Promise<SubmitPaymentResult> => {
    const authUserId = await getAuthUserId(ctx);

    const draft = await ctx.runMutation(
      internal.paymentMutations.preparePaymentDraft,
      {
        items: args.items,
        customer: args.customer,
        shipping: args.shipping,
        userId: authUserId ?? undefined,
      },
    );

    const metadata: Record<string, string> = {
      customerEmail: args.customer.email,
      deliveryType: args.shipping.deliveryType,
      items: summarizeItems(draft.items),
      amountMinor: draft.amountMinor.toString(),
    };

    // Never send very long values to Stripe metadata. For the cart
    // signature we store a short sha256 fingerprint instead of the full
    // JSON payload which can exceed Stripe's 500 char limit.
    if (args.cartSignature) {
      const sigHash = `sha256:${crypto
        .createHash("sha256")
        .update(args.cartSignature)
        .digest("hex")}`;
      metadata.cartSignatureHash = sigHash;
    }

    if (args.metadata) {
      for (const [key, value] of Object.entries(args.metadata)) {
        metadata[key] = sanitizeForStripe(value);
      }
    }

    let intent: StripeIntentSummary;
    try {
      intent = await createStripePaymentIntent({
        amountMinor: draft.amountMinor,
        currency: args.paymentCurrency,
        receiptEmail: args.customer.email,
        customerName: args.customer.name,
        customerPhone: args.customer.phone,
        shippingAddress: (() => {
          const addr = args.shipping.address;
          if (typeof addr === "string") {
            return addr;
          }
          // Format address for Stripe: street, postalCode city, notes
          const streetLine = addr.streetAddress.trim();
          const cityLine = [addr.postalCode.trim(), addr.city.trim()]
            .filter(Boolean)
            .join(" ")
            .trim();
          const notesLine = addr.deliveryNotes.trim();
          return [streetLine, cityLine, notesLine]
            .filter(Boolean)
            .join("\n")
            .trim();
        })(),
        metadata,
        paymentMethodId: args.paymentMethodId,
        description: `${args.customer.name} order`,
      });
    } catch (error) {
      // Extract error message from Stripe error
      let errorMessage: string | undefined;

      if (error instanceof Error) {
        // Check if error message is JSON (structured Stripe error)
        try {
          const parsed = JSON.parse(error.message);
          if (parsed && typeof parsed === "object") {
            errorMessage = JSON.stringify({
              type: parsed.type,
              code: parsed.code,
              message: parsed.message,
              decline_code: parsed.decline_code,
              param: parsed.param,
            });
          }
        } catch {
          // Not JSON, use raw message
          errorMessage = error.message;
        }
      } else {
        errorMessage = String(error);
      }

      // Return error in lastError field
      return {
        paymentIntentId: "", // No payment intent created
        status: "failed" as PaymentStatus,
        lastError: errorMessage,
      };
    }

    await ctx.runMutation(internal.paymentMutations.createPaymentRecord, {
      userId: draft.userId,
      paymentIntentId: intent.paymentIntentId,
      status: intent.status,
      amountBase: draft.normalizedAmount,
      amountMinor: draft.amountMinor,
      currency: args.paymentCurrency,
      displayAmount: args.displayAmount,
      customer: args.customer,
      shipping: args.shipping,
      items: draft.items,
      cartSignature: args.cartSignature,
      paymentSource: args.paymentSource,
      clientSecret: intent.clientSecret,
      lastError: intent.lastError,
    });

    return {
      paymentIntentId: intent.paymentIntentId,
      status: intent.status,
      clientSecret: intent.clientSecret,
      lastError: intent.lastError,
    };
  },
});

export const syncPaymentIntentStatus = action({
  args: {
    paymentIntentId: v.string(),
  },
  returns: v.union(
    v.object({
      paymentIntentId: v.string(),
      status: paymentStatusValidator,
      orderId: v.optional(v.id("orders")),
      paymentId: v.id("payments"),
      clientSecret: v.optional(v.string()),
      lastError: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args): Promise<SyncPaymentIntentStatusResult | null> => {
    const paymentRecord: PaymentIntentRecord | null = await ctx.runQuery(
      internal.paymentMutations.getPaymentIntent,
      { paymentIntentId: args.paymentIntentId },
    );

    if (!paymentRecord) {
      return null;
    }

    let intent: StripeIntentSummary;
    try {
      intent = await retrieveStripePaymentIntent(args.paymentIntentId);
    } catch (error) {
      // Extract error message from Stripe error
      let errorMessage: string | undefined;

      if (error instanceof Error) {
        // Check if error message is JSON (structured Stripe error)
        try {
          const parsed = JSON.parse(error.message);
          if (parsed && typeof parsed === "object") {
            errorMessage = JSON.stringify({
              type: parsed.type,
              code: parsed.code,
              message: parsed.message,
              decline_code: parsed.decline_code,
              param: parsed.param,
            });
          }
        } catch {
          // Not JSON, use raw message
          errorMessage = error.message;
        }
      } else {
        errorMessage = String(error);
      }

      // Update payment with error status
      await ctx.runMutation(internal.paymentMutations.updatePaymentStatus, {
        paymentIntentId: args.paymentIntentId,
        status: "failed" as PaymentStatus,
        lastError: errorMessage,
      });

      return {
        paymentIntentId: args.paymentIntentId,
        status: "failed" as PaymentStatus,
        paymentId: paymentRecord._id,
        orderId: paymentRecord.orderId,
        lastError: errorMessage,
      };
    }

    await ctx.runMutation(internal.paymentMutations.updatePaymentStatus, {
      paymentIntentId: args.paymentIntentId,
      status: intent.status,
      lastError: intent.lastError,
    });

    return {
      paymentIntentId: intent.paymentIntentId,
      status: intent.status,
      orderId: paymentRecord.orderId,
      paymentId: paymentRecord._id,
      clientSecret: intent.clientSecret,
      lastError: intent.lastError,
    };
  },
});

type CreateStripePaymentIntentArgs = {
  amountMinor: number;
  currency: string;
  receiptEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: string;
  metadata?: Record<string, string>;
  description?: string;
  paymentMethodId: string;
};

const createStripePaymentIntent = async (
  args: CreateStripePaymentIntentArgs,
): Promise<StripeIntentSummary> => {
  const stripe = getStripeClient();

  try {
    const intent = await stripe.paymentIntents.create({
      amount: args.amountMinor,
      currency: args.currency,
      payment_method_types: ["card"],
      payment_method: args.paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: false,
      },
      receipt_email: args.receiptEmail,
      description: args.description,
      shipping: {
        name: args.customerName,
        phone: args.customerPhone,
        address: {
          line1: args.shippingAddress,
        },
      },
      metadata: args.metadata,
    });

    return mapIntent(intent);
  } catch (error) {
    // Handle Stripe errors according to official documentation
    if (error && typeof error === "object" && "type" in error) {
      const stripeError = error as Stripe.errors.StripeError;

      // For card errors, check charge outcome for fraud blocking
      if (stripeError.type === "StripeCardError") {
        const cardError = stripeError as Stripe.errors.StripeCardError;

        // If payment intent exists, check charge outcome
        if (cardError.payment_intent?.latest_charge) {
          try {
            const chargeId =
              typeof cardError.payment_intent.latest_charge === "string"
                ? cardError.payment_intent.latest_charge
                : cardError.payment_intent.latest_charge.id;

            const charge = await stripe.charges.retrieve(chargeId);

            // Check if payment was blocked for fraud
            if (charge.outcome?.type === "blocked") {
              throw new Error(
                JSON.stringify({
                  type: "card_error",
                  code: "fraud_detected",
                  message:
                    cardError.message ||
                    "Payment was blocked for suspected fraud. Please try a different payment method.",
                  decline_code: cardError.decline_code,
                }),
              );
            }
          } catch (_chargeError) {
            // If charge retrieval fails, continue with original error
            // This could happen if charge doesn't exist yet
          }
        }

        // Build structured error message for card errors
        const errorDetails: Record<string, string> = {
          type: "card_error",
          code: cardError.code || "card_declined",
          message:
            cardError.message ||
            "Your card was declined. Please try a different payment method.",
        };

        if (cardError.decline_code) {
          errorDetails.decline_code = cardError.decline_code;
        }
        if (cardError.param) {
          errorDetails.param = cardError.param;
        }

        throw new Error(JSON.stringify(errorDetails));
      }

      // Handle invalid request errors
      if (stripeError.type === "StripeInvalidRequestError") {
        const invalidError =
          stripeError as Stripe.errors.StripeInvalidRequestError;

        throw new Error(
          JSON.stringify({
            type: "invalid_request_error",
            code: invalidError.code || "invalid_request",
            message:
              invalidError.message ||
              "Invalid request. Please check your payment information and try again.",
            param: invalidError.param,
          }),
        );
      }

      // Handle connection errors
      if (stripeError.type === "StripeConnectionError") {
        throw new Error(
          JSON.stringify({
            type: "api_connection_error",
            code: "connection_error",
            message:
              "Network error. Please check your connection and try again.",
          }),
        );
      }

      // Handle API errors (rare)
      if (stripeError.type === "StripeAPIError") {
        throw new Error(
          JSON.stringify({
            type: "api_error",
            code: "api_error",
            message:
              "Payment service temporarily unavailable. Please try again later.",
          }),
        );
      }

      // Handle authentication errors
      if (stripeError.type === "StripeAuthenticationError") {
        throw new Error(
          JSON.stringify({
            type: "authentication_error",
            code: "authentication_error",
            message: "Authentication error. Please contact support.",
          }),
        );
      }

      // Handle rate limit errors
      if (stripeError.type === "StripeRateLimitError") {
        throw new Error(
          JSON.stringify({
            type: "rate_limit_error",
            code: "rate_limit_error",
            message: "Too many requests. Please wait a moment and try again.",
          }),
        );
      }

      // Handle idempotency errors
      if (stripeError.type === "StripeIdempotencyError") {
        throw new Error(
          JSON.stringify({
            type: "idempotency_error",
            code: "idempotency_error",
            message: "Duplicate request detected. Please try again.",
          }),
        );
      }

      // Generic Stripe error fallback
      throw new Error(
        JSON.stringify({
          type: stripeError.type || "stripe_error",
          code: (stripeError as { code?: string }).code || "unknown",
          message:
            stripeError.message ||
            "An error occurred while processing your payment. Please try again.",
        }),
      );
    }

    // Non-Stripe error
    throw error;
  }
};

const retrieveStripePaymentIntent = async (
  paymentIntentId: string,
): Promise<StripeIntentSummary> => {
  const stripe = getStripeClient();

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });

    return mapIntent(intent, { expectClientSecret: false });
  } catch (error) {
    // Handle Stripe errors for retrieve operations
    if (error && typeof error === "object" && "type" in error) {
      const stripeError = error as Stripe.errors.StripeError;

      // Build structured error message
      const errorDetails: Record<string, string> = {
        type: stripeError.type || "stripe_error",
        code: (stripeError as { code?: string }).code || "unknown",
        message:
          stripeError.message ||
          "Failed to retrieve payment information. Please try again.",
      };

      if ((stripeError as { param?: string }).param) {
        errorDetails.param = (stripeError as { param: string }).param;
      }

      throw new Error(JSON.stringify(errorDetails));
    }

    // Non-Stripe error
    throw error;
  }
};
