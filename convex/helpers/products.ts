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
  const storageIds: Array<Id<"_storage">> = [
    ...(product.imageIds ?? []),
    ...(product.imageId ? [product.imageId] : []),
  ];

  const uniqueIds = Array.from(new Set(storageIds.map((id) => id)));
  const imageUrls = await resolveImageUrls(ctx, uniqueIds);
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

  return attachImageToProduct(ctx, product);
};
