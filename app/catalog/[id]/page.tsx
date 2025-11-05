import { preloadQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: Id<"products"> }>;
}) {
  const { id } = await params;
  if (!id) return notFound();
  const preloaded = await preloadQuery(api.products.get, { id });
  return <ProductDetailClient preloaded={preloaded} />;
}
