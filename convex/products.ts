import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import {
  internalMutation,
  mutation,
  query,
  type QueryCtx,
} from "./_generated/server";
import { requireUser } from "./helpers/auth";
import { attachImageToProduct } from "./helpers/products";
import {
  productWithImageValidator,
  shapeValidator,
  sizeValidator,
} from "./validators/product";

type ProductDoc = Doc<"products">;

type ProductFilters = {
  color?: string;
  size?: ProductDoc["size"];
  shape?: ProductDoc["shape"];
};

const productPageValidator = v.object({
  page: v.array(productWithImageValidator),
  isDone: v.boolean(),
  continueCursor: v.union(v.string(), v.null()),
});

const buildIndexedQuery = (ctx: QueryCtx, filters: ProductFilters) => {
  if (filters.color && filters.size && filters.shape) {
    return ctx.db
      .query("products")
      .withIndex("by_color_size_and_shape", (q) =>
        q
          .eq("color", filters.color!)
          .eq("size", filters.size!)
          .eq("shape", filters.shape!),
      );
  }

  if (filters.color && filters.size) {
    return ctx.db
      .query("products")
      .withIndex("by_color_and_size", (q) =>
        q.eq("color", filters.color!).eq("size", filters.size!),
      );
  }

  if (filters.color && filters.shape) {
    return ctx.db
      .query("products")
      .withIndex("by_color_and_shape", (q) =>
        q.eq("color", filters.color!).eq("shape", filters.shape!),
      );
  }

  if (filters.size && filters.shape) {
    return ctx.db
      .query("products")
      .withIndex("by_size_and_shape", (q) =>
        q.eq("size", filters.size!).eq("shape", filters.shape!),
      );
  }

  if (filters.color) {
    return ctx.db
      .query("products")
      .withIndex("by_color", (q) => q.eq("color", filters.color!));
  }

  if (filters.size) {
    return ctx.db
      .query("products")
      .withIndex("by_size", (q) => q.eq("size", filters.size!));
  }

  if (filters.shape) {
    return ctx.db
      .query("products")
      .withIndex("by_shape", (q) => q.eq("shape", filters.shape!));
  }

  return ctx.db.query("products");
};

export const list = query({
  args: {
    search: v.optional(v.string()),
    color: v.optional(v.string()),
    size: v.optional(sizeValidator),
    shape: v.optional(shapeValidator),
    paginationOpts: paginationOptsValidator,
  },
  returns: productPageValidator,
  handler: async (ctx, args) => {
    const filters: ProductFilters = {
      color: args.color,
      size: args.size,
      shape: args.shape,
    };

    const normalizedSearch = args.search?.trim();
    const useSearch = normalizedSearch && normalizedSearch.length >= 2;

    if (useSearch) {
      const { page, isDone, continueCursor } = await ctx.db
        .query("products")
        .withSearchIndex("search_products", (q) => {
          let builder = q.search("name", normalizedSearch!);
          if (filters.color) {
            builder = builder.eq("color", filters.color);
          }
          if (filters.size) {
            builder = builder.eq("size", filters.size);
          }
          if (filters.shape) {
            builder = builder.eq("shape", filters.shape);
          }
          return builder;
        })
        .paginate(args.paginationOpts);

      const pageWithImages = await Promise.all(
        page.map((product) => attachImageToProduct(ctx, product)),
      );

      return {
        page: pageWithImages,
        isDone,
        continueCursor,
      };
    }

    const baseQuery = buildIndexedQuery(ctx, filters).order("desc");
    const { page, isDone, continueCursor } = await baseQuery.paginate(
      args.paginationOpts,
    );

    const pageWithImages = await Promise.all(
      page.map((product) => attachImageToProduct(ctx, product)),
    );

    return {
      page: pageWithImages,
      isDone,
      continueCursor,
    };
  },
});

export const get = query({
  args: { id: v.id("products") },
  returns: v.union(productWithImageValidator, v.null()),
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {
      return null;
    }

    return attachImageToProduct(ctx, product);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    color: v.string(),
    size: sizeValidator,
    shape: shapeValidator,
    imageId: v.optional(v.id("_storage")),
    imageIds: v.optional(v.array(v.id("_storage"))),
    inStock: v.number(),
  },
  returns: v.id("products"),
  handler: async (ctx, args) => {
    await requireUser(ctx);

    if (args.price < 0) {
      throw new Error("Price must be non-negative");
    }

    if (!Number.isInteger(args.inStock) || args.inStock < 0) {
      throw new Error("Stock must be a non-negative integer");
    }

    const imageIds = args.imageIds ?? (args.imageId ? [args.imageId] : []);

    return ctx.db.insert("products", {
      ...args,
      imageIds,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireUser(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

export const seedProducts = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existingProducts = await ctx.db.query("products").take(1);
    if (existingProducts.length > 0) {
      return null;
    }

    const products: Array<
      Omit<ProductDoc, "_id" | "_creationTime" | "imageId" | "imageIds"> & {
        imageId?: ProductDoc["imageId"];
        imageIds?: ProductDoc["imageIds"];
      }
    > = [
      {
        name: "Classic Red Balloon",
        description:
          "Beautiful classic red balloon perfect for any celebration",
        price: 3,
        color: "red",
        size: "medium",
        shape: "round",
        inStock: 50,
        imageIds: [],
      },
      {
        name: "Blue Heart Balloon",
        description: "Romantic blue heart-shaped balloon for special occasions",
        price: 5,
        color: "blue",
        size: "large",
        shape: "heart",
        inStock: 30,
        imageIds: [],
      },
      {
        name: "Golden Star Balloon",
        description: "Shiny golden star balloon that sparkles in the light",
        price: 5,
        color: "gold",
        size: "large",
        shape: "star",
        inStock: 25,
        imageIds: [],
      },
      {
        name: "Pink Mini Balloons",
        description: "Set of small pink balloons perfect for decorations",
        price: 6,
        color: "pink",
        size: "small",
        shape: "round",
        inStock: 100,
        imageIds: [],
      },
      {
        name: "Green Animal Balloon",
        description: "Fun green animal-shaped balloon kids will love",
        price: 6,
        color: "green",
        size: "large",
        shape: "animal",
        inStock: 20,
        imageIds: [],
      },
      {
        name: "Purple Heart Balloon",
        description: "Elegant purple heart balloon for romantic moments",
        price: 4,
        color: "purple",
        size: "medium",
        shape: "heart",
        inStock: 35,
        imageIds: [],
      },
      {
        name: "Silver Star Balloon",
        description: "Metallic silver star balloon for celebrations",
        price: 5,
        color: "silver",
        size: "large",
        shape: "star",
        inStock: 40,
        imageIds: [],
      },
      {
        name: "Orange Round Balloon",
        description: "Bright orange balloon to add color to any party",
        price: 2,
        color: "orange",
        size: "medium",
        shape: "round",
        inStock: 60,
        imageIds: [],
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", {
        ...product,
        imageIds:
          product.imageIds ?? (product.imageId ? [product.imageId] : []),
      });
    }

    return null;
  },
});
