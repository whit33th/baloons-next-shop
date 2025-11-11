import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type ProductCtx = QueryCtx | MutationCtx;

export type ProductWithImage = Doc<"products"> & {
  imageUrls: string[];
  primaryImageUrl: string | null;
};

const resolveImageUrls = async (
  ctx: ProductCtx,
  ids: Array<Id<"_storage">>,
): Promise<string[]> => {
  const urls = await Promise.all(
    ids.map(async (storageId) => {
      const url = await ctx.storage.getUrl(storageId);
      return url ?? null;
    }),
  );

  return urls.filter((url): url is string => Boolean(url));
};

export const attachImageToProduct = async (
  ctx: ProductCtx,
  product: Doc<"products">,
): Promise<ProductWithImage> => {
  let imageUrls = product.imageUrls ?? [];

  if (imageUrls.length === 0) {
    const legacyIds = (product as { imageIds?: Array<Id<"_storage">> })
      .imageIds;
    if (legacyIds?.length) {
      imageUrls = await resolveImageUrls(ctx, legacyIds);
    }
  }

  const primaryImageUrl = imageUrls[0] ?? null;

  return { ...product, imageUrls, primaryImageUrl };
};

export const loadProductWithImage = async (
  ctx: ProductCtx,
  productId: Id<"products">,
): Promise<ProductWithImage | null> => {
  const product = await ctx.db.get(productId);
  if (!product) {
    return null;
  }

  return attachImageToProduct(ctx, product as Doc<"products">);
};
