import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

const paymentIntentArgs = {
  paymentIntentId: v.string(),
  userId: v.id("users"),
  amount: v.number(),
  currency: v.string(),
  status: v.string(),
  orderData: v.object({
    customerName: v.string(),
    customerEmail: v.string(),
    shippingAddress: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        productName: v.string(),
        quantity: v.number(),
        price: v.number(),
      }),
    ),
  }),
  stripeClientSecret: v.optional(v.string()),
} as const;

export const storePaymentIntent = internalMutation({
  args: paymentIntentArgs,
  returns: v.id("paymentIntents"),
  handler: async (ctx, args) => {
    return ctx.db.insert("paymentIntents", args);
  },
});

export const getPaymentIntent = internalQuery({
  args: { paymentIntentId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("paymentIntents"),
      _creationTime: v.number(),
      ...paymentIntentArgs,
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return ctx.db
      .query("paymentIntents")
      .withIndex("by_payment_intent_id", (q) =>
        q.eq("paymentIntentId", args.paymentIntentId),
      )
      .unique();
  },
});

export const updatePaymentStatus = internalMutation({
  args: {
    paymentIntentId: v.string(),
    status: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const paymentIntent = await ctx.db
      .query("paymentIntents")
      .withIndex("by_payment_intent_id", (q) =>
        q.eq("paymentIntentId", args.paymentIntentId),
      )
      .unique();

    if (!paymentIntent) {
      throw new Error("Payment intent not found");
    }

    await ctx.db.patch(paymentIntent._id, { status: args.status });
    return null;
  },
});

export const processSuccessfulPayment = internalMutation({
  args: {
    paymentIntentId: v.string(),
    paymentType: v.optional(v.union(v.literal("full"), v.literal("partial"))),
  },
  returns: v.id("orders"),
  handler: async (ctx, args) => {
    const paymentIntent = await ctx.db
      .query("paymentIntents")
      .withIndex("by_payment_intent_id", (q) =>
        q.eq("paymentIntentId", args.paymentIntentId),
      )
      .unique();

    if (!paymentIntent) {
      throw new Error("Payment intent not found");
    }

    await ctx.db.patch(paymentIntent._id, { status: "succeeded" });

    for (const item of paymentIntent.orderData.items) {
      const product = await ctx.db.get(item.productId);
      if (!product) {
        continue;
      }

      if (!product.inStock) {
        throw new Error(`${product.name} is out of stock`);
      }

      await ctx.db.patch(product._id, {
        soldCount: (product.soldCount ?? 0) + item.quantity,
      });
    }

    const paymentMethod =
      args.paymentType === "partial" ? "partial_online" : "full_online";

    const orderId = await ctx.db.insert("orders", {
      userId: paymentIntent.userId,
      items: paymentIntent.orderData.items,
      totalAmount: paymentIntent.amount,
      status: "confirmed",
      customerName: paymentIntent.orderData.customerName,
      customerEmail: paymentIntent.orderData.customerEmail,
      shippingAddress: paymentIntent.orderData.shippingAddress,
      paymentIntentId: args.paymentIntentId,
      deliveryType: "pickup",
      paymentMethod: paymentMethod as "full_online" | "partial_online",
    });

    const cartQuery = ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", paymentIntent.userId));

    for await (const cartItem of cartQuery) {
      await ctx.db.delete(cartItem._id);
    }

    return orderId;
  },
});
