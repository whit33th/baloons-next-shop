import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { HomePageClient } from "./HomePageClient";

export default async function HomePage() {
  // Prefetch bestsellers data on the server
  const preloadedBestsellers = await preloadQuery(api.products.list, {
    paginationOpts: {
      cursor: null,
      numItems: 10,
    },
  });

  return <HomePageClient preloadedBestsellers={preloadedBestsellers} />;
}
