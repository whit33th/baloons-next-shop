import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import CatalogClient from "./CatalogClient";
import { Suspense } from "react";

type ProductFilters = Promise<{
  search?: string;
  color?: string;
  size?: "small" | "medium" | "large";
  shape?: "round" | "heart" | "star" | "animal";
  material?: string;
  occasion?: string;
  minPrice?: string;
  maxPrice?: string;
  available?: string;
  sale?: string;
}>;

export default async function CatalogPage(props: {
  searchParams: ProductFilters;
}) {
  const searchParams = await props.searchParams;
  const filters = {
    search: searchParams.search ?? "",
    color: searchParams.color ?? "",
    size: searchParams.size ?? "",
    shape: searchParams.shape ?? "",
    material: searchParams.material ?? "",
    occasion: searchParams.occasion ?? "",
    minPrice: searchParams.minPrice ?? "",
    maxPrice: searchParams.maxPrice ?? "",
    available: searchParams.available ?? "",
    sale: searchParams.sale ?? "",
  };

  // Preload products with filters
  const preloaded = await preloadQuery(api.products.list, {
    search: searchParams.search ? searchParams.search : undefined,
    color: searchParams.color ? searchParams.color : undefined,
    size: searchParams.size ? searchParams.size : undefined,
    shape: searchParams.shape ? searchParams.shape : undefined,
    paginationOpts: { numItems: 10, cursor: null },
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CatalogClient preloaded={preloaded} />
    </Suspense>
  );
}
