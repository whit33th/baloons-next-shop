import { v } from "convex/values";

export const sizeValidator = v.union(
  v.literal("small"),
  v.literal("medium"),
  v.literal("large"),
);

export const shapeValidator = v.union(
  v.literal("round"),
  v.literal("heart"),
  v.literal("star"),
  v.literal("animal"),
);

export const productDocumentFields = {
  _id: v.id("products"),
  _creationTime: v.number(),
  name: v.string(),
  description: v.string(),
  price: v.number(),
  color: v.string(),
  size: sizeValidator,
  shape: shapeValidator,
  imageIds: v.optional(v.array(v.id("_storage"))),
  imageId: v.optional(v.id("_storage")),
  inStock: v.number(),
};

export const productWithImageValidator = v.object({
  ...productDocumentFields,
  imageUrls: v.array(v.string()),
  primaryImageUrl: v.union(v.string(), v.null()),
});
