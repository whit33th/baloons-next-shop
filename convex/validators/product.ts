import { v } from "convex/values";

export const productDocumentFields = {
  _id: v.id("products"),
  _creationTime: v.number(),
  name: v.string(),
  description: v.string(),
  price: v.number(),
  categoryGroup: v.string(),
  category: v.string(),
  imageUrls: v.array(v.string()),
  inStock: v.boolean(),
  soldCount: v.optional(v.number()),
  isPersonalizable: v.optional(v.boolean()),
  availableColors: v.optional(v.array(v.string())),
};

export const productWithImageValidator = v.object({
  ...productDocumentFields,
  imageUrls: v.array(v.string()),
  primaryImageUrl: v.union(v.string(), v.null()),
});
