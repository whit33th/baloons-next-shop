import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

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
