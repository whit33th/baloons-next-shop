"use client";

import { useMutation, usePaginatedQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "../convex/_generated/api";
import { Button } from "./ui/button";
import ProductCard from "./ui/productCard";

interface ProductGridProps {
  filters: {
    search: string;
    color: string;
    size: string;
    shape: string;
  };
  onProductClick?: (productId: string) => void;
}

// Balloon colors for colorful backgrounds
export const balloonColors = [
  // 9 mid-tones in the same family — intentionally NOT near-white so they
  // keep the palette rich while still contrasting with deep (dark) text.
  "#8EC7F6",
  "#EF476F",
  "#F66E52",
  "#A1D99B",
  "#91E5CF",
  "#FFB5A7",
  "#FFD93D",
];

export function ProductGrid({ filters, onProductClick }: ProductGridProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.products.list,
    {
      search: filters.search || undefined,
      color: filters.color || undefined,
      size: (filters.size as any) || undefined,
      shape: (filters.shape as any) || undefined,
    },
    { initialNumItems: 10 },
  );

  const addToCart = useMutation(api.cart.add);

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await addToCart({ productId: productId as any, quantity: 1 });
      toast.success("Added to cart!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add to cart",
      );
    }
  };

  const handleProductClick = (productId: string) => {
    if (onProductClick) {
      onProductClick(productId);
    }
  };

  if (status === "LoadingFirstPage") {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{ backgroundColor: balloonColors[i % balloonColors.length] }}
          >
            <div className="aspect-3/4" />
            <div className="bg-white px-4 py-6">
              <div className="mx-auto mb-2 h-6 w-3/4 bg-gray-200" />
              <div className="mx-auto h-8 w-20 bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-[#F8F5ED] py-16 text-center">
        <div className="mb-4 text-6xl">🎈</div>
        <h3 className="mb-2 text-xl font-semibold text-black">
          No balloons found
        </h3>
        <p className="text-black">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Seamless Product Grid - no gaps */}
      <div className="grid w-full grid-cols-2 border-t border-neutral-950 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {results.map((product, i) => (
          <ProductCard index={i} key={i} product={product} />
        ))}
      </div>

      {/* Load More Button */}
      {status === "CanLoadMore" && (
        <div className="bg-[#F8F5ED] px-8 py-12 text-center">
          <Button
            onClick={() => loadMore(10)}
            disabled={status !== "CanLoadMore"}
            className="h-12 rounded-none bg-black px-12 tracking-wide text-white uppercase transition-colors hover:bg-black/90 disabled:opacity-50"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
