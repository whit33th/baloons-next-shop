import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import { requireUser } from "./helpers/auth";
import {
  attachImageToProduct,
  type ProductWithImage,
} from "./helpers/products";
import { productWithImageValidator } from "./validators/product";

type CartItemResponse = {
  _id: Id<"cartItems">;
  _creationTime: number;
  userId: Id<"users">;
  productId: Id<"products">;
  quantity: number;
  personalization?: {
    text?: string;
    color?: string;
    number?: string;
  };
  product: ProductWithImage;
};

const cartItemResponseValidator = v.object({
  _id: v.id("cartItems"),
  _creationTime: v.number(),
  userId: v.id("users"),
  productId: v.id("products"),
  quantity: v.number(),
  personalization: v.optional(
    v.object({
      text: v.optional(v.string()),
      color: v.optional(v.string()),
      number: v.optional(v.string()),
    }),
  ),
  product: productWithImageValidator,
});

const ensurePositiveInteger = (quantity: number) => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }
};

const incrementCartItem = async (
  ctx: MutationCtx,
  userId: Id<"users">,
  productId: Id<"products">,
  delta: number,
  personalization?: {
    text?: string;
    color?: string;
    number?: string;
  },
) => {
  ensurePositiveInteger(delta);

  const product = await ctx.db.get(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const existingItem = await ctx.db
    .query("cartItems")
    .withIndex("by_user_and_product", (q) =>
      q.eq("userId", userId).eq("productId", productId),
    )
    .unique();

  if (!product.inStock) {
    throw new Error("Product is out of stock");
  }

  const newQuantity = (existingItem?.quantity ?? 0) + delta;

  if (existingItem) {
    await ctx.db.patch(existingItem._id, {
      quantity: newQuantity,
      personalization,
    });
  } else {
    await ctx.db.insert("cartItems", {
      userId,
      productId,
      quantity: newQuantity,
      personalization,
    });
  }
};

export const list = query({
  args: {},
  returns: v.array(cartItemResponseValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const { userId } = await requireUser(ctx);

    const items: CartItemResponse[] = [];
    const cartQuery = ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc");

    for await (const item of cartQuery) {
      const product = await ctx.db.get(item.productId);
      if (!product) {
        continue;
      }

      const productWithImage = await attachImageToProduct(ctx, product);
      items.push({ ...item, product: productWithImage });
    }

    return items;
  },
});

export const add = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    personalization: v.optional(
      v.object({
        text: v.optional(v.string()),
        color: v.optional(v.string()),
        number: v.optional(v.string()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);
    await incrementCartItem(
      ctx,
      userId,
      args.productId,
      args.quantity,
      args.personalization,
    );
    return null;
  },
});

export const updateQuantity = mutation({
  args: {
    itemId: v.id("cartItems"),
    quantity: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);

    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found");
    }

    const product = await ctx.db.get(item.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (!product.inStock) {
      throw new Error("Product is out of stock");
    }

    if (args.quantity <= 0) {
      await ctx.db.delete(args.itemId);
    } else {
      ensurePositiveInteger(args.quantity);
      await ctx.db.patch(args.itemId, { quantity: args.quantity });
    }

    return null;
  },
});

export const remove = mutation({
  args: { itemId: v.id("cartItems") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId } = await requireUser(ctx);

    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found");
    }

    await ctx.db.delete(args.itemId);
    return null;
  },
});

export const clear = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const { userId } = await requireUser(ctx);

    const cartQuery = ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    for await (const item of cartQuery) {
      await ctx.db.delete(item._id);
    }

    return null;
  },
});

export const importGuestItems = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        personalization: v.optional(
          v.object({
            text: v.optional(v.string()),
            color: v.optional(v.string()),
            number: v.optional(v.string()),
          }),
        ),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.items.length === 0) {
      return null;
    }

    const { userId } = await requireUser(ctx);

    for (const item of args.items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        continue;
      }

      await incrementCartItem(
        ctx,
        userId,
        item.productId,
        item.quantity,
        item.personalization,
      );
    }

    return null;
  },
});

export const getTotal = query({
  args: {},
  returns: v.object({
    total: v.number(),
    itemCount: v.number(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { total: 0, itemCount: 0 };
    }

    const { userId } = await requireUser(ctx);

    let total = 0;
    let itemCount = 0;

    const cartQuery = ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    for await (const item of cartQuery) {
      const product = await ctx.db.get(item.productId);
      if (!product) {
        continue;
      }

      total += product.price * item.quantity;
      itemCount += item.quantity;
    }

    return { total, itemCount };
  },
});
