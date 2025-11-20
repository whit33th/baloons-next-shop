import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { HomePageClient } from "./HomePageClient";

export default async function HomePage() {
  // Prefetch bestsellers data on the server
  const preloadedBestsellers = await preloadQuery(api.products.list, {
    // API expects `sort` (one of price-low, price-high, name-asc, name-desc, default).
    // Use `default` to get the repository's default ordering (popularity/bestsellers).
    sort: "default",
    paginationOpts: {
      cursor: null,
      numItems: 8,
    },
  });
  const preloadedNewArrivals = await preloadQuery(api.products.getNewProducts, {
    paginationOpts: {
      cursor: null,
      numItems: 8,
    },
  });

  return (
    <HomePageClient
      preloadedBestsellers={preloadedBestsellers}
      preloadedNewArrivals={preloadedNewArrivals}
    />
  );
}
