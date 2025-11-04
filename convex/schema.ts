import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    imageIds: v.optional(v.array(v.id("_storage"))),
    imageId: v.optional(v.id("_storage")),
    inStock: v.number(),
  }).searchIndex("search_products", {
    searchField: "name",
  }),

  cartItems: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"]),

  orders: defineTable({
    userId: v.id("users"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        productName: v.string(),
        quantity: v.number(),
        price: v.number(),
      }),
    ),
    totalAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("shipped"),
      v.literal("delivered"),
    ),
    customerEmail: v.string(),
    customerName: v.string(),
    shippingAddress: v.string(),
    paymentIntentId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  paymentIntents: defineTable({
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
  })
    .index("by_payment_intent_id", ["paymentIntentId"])
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
