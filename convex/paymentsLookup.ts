import { v } from "convex/values";
import { query } from "./_generated/server";
import { paymentStatusValidator } from "./paymentMutations";

export const lookupByIntent = query({
  args: {
    paymentIntentId: v.string(),
  },
  returns: v.union(
    v.object({
      paymentId: v.id("payments"),
      paymentIntentId: v.string(),
      orderId: v.optional(v.id("orders")),
      status: paymentStatusValidator,
      lastError: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_payment_intent_id", (q) =>
        q.eq("paymentIntentId", args.paymentIntentId),
      )
      .unique();

    if (!payment) {
      return null;
    }

    return {
      paymentId: payment._id,
      paymentIntentId: payment.paymentIntentId ?? args.paymentIntentId,
      orderId: payment.orderId,
      status: payment.status,
      lastError: payment.lastError,
    };
  },
});
