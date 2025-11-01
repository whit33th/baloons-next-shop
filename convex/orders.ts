import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./helpers/auth";
import type { Doc } from "./_generated/dataModel";

const orderItemValidator = v.object({
  productId: v.id("products"),
  productName: v.string(),
  quantity: v.number(),
  price: v.number(),
});

const orderValidator = v.object({
  _id: v.id("orders"),
  _creationTime: v.number(),
  userId: v.id("users"),
  items: v.array(orderItemValidator),
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
});

export const create = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    shippingAddress: v.string(),
  },
  returns: v.id("orders"),
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);

    const cartItems = [];
    const cartQuery = ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    for await (const cartItem of cartQuery) {
      cartItems.push(cartItem);
    }

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    type OrderItem = Doc<"orders">["items"][number];
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const product = await ctx.db.get(cartItem.productId);
      if (!product) {
        continue;
      }

      if (cartItem.quantity > product.inStock) {
        throw new Error(`Not enough ${product.name} in stock`);
      }

      orderItems.push({
        productId: cartItem.productId,
        productName: product.name,
        quantity: cartItem.quantity,
        price: product.price,
      });

      totalAmount += product.price * cartItem.quantity;

      await ctx.db.patch(product._id, {
        inStock: product.inStock - cartItem.quantity,
      });
    }

    const orderId = await ctx.db.insert("orders", {
      userId,
      items: orderItems,
      totalAmount,
      status: "confirmed",
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      shippingAddress: args.shippingAddress,
    });

    for (const cartItem of cartItems) {
      await ctx.db.delete(cartItem._id);
    }

    return orderId;
  },
});

export const list = query({
  args: {},
  returns: v.array(orderValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const { userId } = await requireUser(ctx);

    const orders: Doc<"orders">[] = [];

    const orderQuery = ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc");

    for await (const order of orderQuery) {
      orders.push(order);
    }

    return orders;
  },
});

export const get = query({
  args: { id: v.id("orders") },
  returns: v.union(orderValidator, v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const { userId } = await requireUser(ctx);

    const order = await ctx.db.get(args.id);
    if (!order || order.userId !== userId) {
      return null;
    }

    return order;
  },
});
