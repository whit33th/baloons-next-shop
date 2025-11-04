import { v } from "convex/values";

export const productDocumentFields = {
  _id: v.id("products"),
  _creationTime: v.number(),
  name: v.string(),
  description: v.string(),
  price: v.number(),
  imageIds: v.optional(v.array(v.id("_storage"))),
  imageId: v.optional(v.id("_storage")),
  inStock: v.number(),
};

export const productWithImageValidator = v.object({
  ...productDocumentFields,
  imageUrls: v.array(v.string()),
  primaryImageUrl: v.union(v.string(), v.null()),
});
