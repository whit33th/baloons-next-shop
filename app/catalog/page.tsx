import { preloadQuery } from "convex/nextjs";
import { Suspense } from "react";
import { api } from "@/convex/_generated/api";
import CatalogClient from "./CatalogClient";

type ProductFilters = Promise<{
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  available?: string;
  category?: string;
  sort?: string;
}>;

const SORT_OPTIONS = [
  "default",
  "price-low",
  "price-high",
  "name-asc",
  "name-desc",
] as const;

type SortOption = (typeof SORT_OPTIONS)[number];

export default async function CatalogPage(props: {
  searchParams: ProductFilters;
}) {
  const searchParams = await props.searchParams;

  const parsePrice = (value?: string) => {
    if (!value) {
      return undefined;
    }
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const parseBoolean = (value?: string) =>
    value === "true" ? true : undefined;

  const normalizeString = (value?: string) => {
    if (!value) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const allowedSorts = new Set<SortOption>(SORT_OPTIONS);

  const sortParam = normalizeString(searchParams.sort) as
    | SortOption
    | undefined;
  const sort = sortParam && allowedSorts.has(sortParam) ? sortParam : undefined;

  // Preload products with filters
  const preloaded = await preloadQuery(api.products.list, {
    search: normalizeString(searchParams.search),
    minPrice: parsePrice(searchParams.minPrice),
    maxPrice: parsePrice(searchParams.maxPrice),
    available: parseBoolean(searchParams.available),
    category: normalizeString(searchParams.category),
    sort,
    paginationOpts: { numItems: 10, cursor: null },
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CatalogClient preloaded={preloaded} />
    </Suspense>
  );
}
