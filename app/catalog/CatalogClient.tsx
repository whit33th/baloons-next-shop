"use client";

import { ProductFilters } from "@/components/Containers/ProductFilters/ProductFilters";
import { ProductGrid } from "@/components/ProductGrid";
import { useSearchParams } from "next/navigation";

export default function CatalogClient({ preloaded }: { preloaded: any }) {
  const searchParams = useSearchParams();

  const filters = {
    search: searchParams.get("search") || "",
    color: searchParams.get("color") || "",
    size: searchParams.get("size") || "",
    shape: searchParams.get("shape") || "",
    material: searchParams.get("material") || "",
    occasion: searchParams.get("occasion") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    available: searchParams.get("available") || "",
    sale: searchParams.get("sale") || "",
  };

  return (
    <main className="w-full">
      <div className="w-full">
        <ProductFilters />
        <ProductGrid filters={filters} />
      </div>
    </main>
  );
}
