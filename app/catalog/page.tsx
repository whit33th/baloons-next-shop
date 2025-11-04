import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import CatalogClient from "./CatalogClient";
import { Suspense } from "react";

type ProductFilters = Promise<{
  search?: string;
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
    paginationOpts: { numItems: 10, cursor: null },
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CatalogClient preloaded={preloaded} />
    </Suspense>
  );
}
