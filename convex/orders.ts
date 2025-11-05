import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./helpers/auth";

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
  deliveryType: v.optional(v.union(v.literal("pickup"), v.literal("delivery"))),
  paymentMethod: v.optional(
    v.union(
      v.literal("full_online"),
      v.literal("partial_online"),
      v.literal("cash"),
    ),
  ),
  paymentIntentId: v.optional(v.string()),
  whatsappConfirmed: v.optional(v.boolean()),
  pickupDateTime: v.optional(v.string()),
});

export const createGuest = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    shippingAddress: v.string(),
    deliveryType: v.union(v.literal("pickup"), v.literal("delivery")),
    paymentMethod: v.union(
      v.literal("full_online"),
      v.literal("partial_online"),
      v.literal("cash"),
    ),
    whatsappConfirmed: v.optional(v.boolean()),
    pickupDateTime: v.optional(v.string()),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      }),
    ),
  },
  returns: v.id("orders"),
  handler: async (ctx, args) => {
    // Validate cash payment requires WhatsApp confirmation
    if (args.paymentMethod === "cash" && !args.whatsappConfirmed) {
      throw new Error("Cash payment requires WhatsApp confirmation");
    }

    if (args.items.length === 0) {
      throw new Error("Cart is empty");
    }

    type OrderItem = Doc<"orders">["items"][number];
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product) {
        continue;
      }

      if (!product.inStock) {
        throw new Error(`${product.name} is out of stock`);
      }

      orderItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });

      totalAmount += product.price * item.quantity;

      await ctx.db.patch(product._id, {
        soldCount: (product.soldCount ?? 0) + item.quantity,
      });
    }

    // Find or create guest user by email
    let userId = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.customerEmail))
      .first()
      .then((user) => user?._id);

    if (!userId) {
      userId = await ctx.db.insert("users", {
        email: args.customerEmail,
        name: args.customerName,
        emailVerificationTime: undefined,
        phone: undefined,
        phoneVerificationTime: undefined,
        image: undefined,
      });
    }

    const orderId = await ctx.db.insert("orders", {
      userId,
      items: orderItems,
      totalAmount,
      status: args.paymentMethod === "cash" ? "confirmed" : "pending",
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      shippingAddress: args.shippingAddress,
      deliveryType: args.deliveryType,
      paymentMethod: args.paymentMethod,
      whatsappConfirmed: args.whatsappConfirmed,
      pickupDateTime: args.pickupDateTime,
    });

    return orderId;
  },
});

export const create = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    shippingAddress: v.string(),
    deliveryType: v.union(v.literal("pickup"), v.literal("delivery")),
    paymentMethod: v.union(
      v.literal("full_online"),
      v.literal("partial_online"),
      v.literal("cash"),
    ),
    whatsappConfirmed: v.optional(v.boolean()),
    pickupDateTime: v.optional(v.string()),
  },
  returns: v.id("orders"),
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);

    // Validate cash payment requires WhatsApp confirmation
    if (args.paymentMethod === "cash" && !args.whatsappConfirmed) {
      throw new Error("Cash payment requires WhatsApp confirmation");
    }

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

      if (!product.inStock) {
        throw new Error(`${product.name} is out of stock`);
      }

      orderItems.push({
        productId: cartItem.productId,
        productName: product.name,
        quantity: cartItem.quantity,
        price: product.price,
      });

      totalAmount += product.price * cartItem.quantity;

      await ctx.db.patch(product._id, {
        soldCount: (product.soldCount ?? 0) + cartItem.quantity,
      });
    }

    const orderId = await ctx.db.insert("orders", {
      userId,
      items: orderItems,
      totalAmount,
      status: args.paymentMethod === "cash" ? "confirmed" : "pending",
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      shippingAddress: args.shippingAddress,
      deliveryType: args.deliveryType,
      paymentMethod: args.paymentMethod,
      whatsappConfirmed: args.whatsappConfirmed,
      pickupDateTime: args.pickupDateTime,
    });

    // Only clear cart for cash payments
    if (args.paymentMethod === "cash") {
      for (const cartItem of cartItems) {
        await ctx.db.delete(cartItem._id);
      }
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

// Публичный query для получения заказа сразу после создания (для гостей и авторизованных)
export const getPublic = query({
  args: { id: v.id("orders") },
  returns: v.union(orderValidator, v.null()),
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    return order ?? null;
  },
});
