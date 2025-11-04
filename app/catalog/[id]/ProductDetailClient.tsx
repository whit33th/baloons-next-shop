"use client";

import {
  Preloaded,
  useMutation,
  usePreloadedQuery,
  useQuery,
} from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { snapshotFromProduct, useGuestCart } from "@/lib/guestCart";
import { toast } from "sonner";
import { ProductGallery } from "./_components/ProductGallery";
import { ProductSummary } from "./_components/ProductSummary";
import { ProductSkeleton } from "./_components/ProductSkeleton";
import { ProductNotFound } from "./_components/ProductNotFound";

interface Props {
  preloaded: Preloaded<typeof api.products.get>;
}

const FALLBACK_IMAGES = ["/baloons2.png", "/baloons2.png", "/baloons4.png"];

export default function ProductDetailClient({ preloaded }: Props) {
  const product = usePreloadedQuery(preloaded);
  const addToCart = useMutation(api.cart.add);
  const user = useQuery(api.auth.loggedInUser);
  const { addItem: addGuestItem } = useGuestCart();

  const handleAddToCart = async (desired: number) => {
    if (!product) {
      return;
    }

    const safeQuantity = Math.max(1, Math.floor(desired));
    const clampedQuantity = Math.min(safeQuantity, product.inStock);

    if (!user) {
      addGuestItem(snapshotFromProduct(product), clampedQuantity);
      if (clampedQuantity < safeQuantity) {
        toast.info(
          `Added only ${clampedQuantity} item(s) due to stock limits.`,
        );
      } else {
        toast.success(`Added ${clampedQuantity} item(s) to cart!`);
      }
      return;
    }

    try {
      await addToCart({
        productId: product._id as Id<"products">,
        quantity: clampedQuantity,
      });
      toast.success(`Added ${clampedQuantity} item(s) to cart!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add to cart",
      );
    }
  };

  if (product === undefined) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <div className="flex w-full flex-col lg:flex-row lg:items-start lg:gap-12">
      <ProductGallery
        images={
          product.imageUrls.length > 0 ? product.imageUrls : FALLBACK_IMAGES
        }
        productName={product.name}
      />
      <ProductSummary
        product={product}
        onAddToCart={async (quantity) => {
          await handleAddToCart(quantity);
        }}
      />
    </div>
  );
}
