import { preloadQuery } from "convex/nextjs";
import { ProductCarousels } from "@/components/Containers/ProductCarousels";
import { api } from "@/convex/_generated/api";

export async function ProductCarouselsWrapper() {
  // Preload data on the server using preloadQuery
  // This will be called during request time (dynamic rendering)
  const preloadedBestsellers = await preloadQuery(api.products.list, {
    order: "orderCount-desc",
    paginationOpts: {
      cursor: null,
      numItems: 8,
    },
  });

  const preloadedNewArrivals = await preloadQuery(api.products.list, {
    order: "createdAt-desc",
    paginationOpts: {
      cursor: null,
      numItems: 8,
    },
  });

  return (
    <ProductCarousels
      preloadedBestsellers={preloadedBestsellers}
      preloadedNewArrivals={preloadedNewArrivals}
    />
  );
}

