import { fetchQuery, preloadQuery } from "convex/nextjs";
import type { Preloaded } from "convex/react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  BreadcrumbJsonLd,
  generateProductMetadata,
  ProductJsonLd,
} from "@/SEO";
import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: Id<"products"> }>;
}) {
  const { id, locale } = await params;
  if (!id) return {};

  try {
    const product = await fetchQuery(api.products.get, { id });
    if (!product) return {};

    return generateProductMetadata(locale, product);
  } catch {
    return {};
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: Id<"products"> }>;
}) {
  const { id, locale } = await params;
  if (!id) return notFound();
  let preloaded: Preloaded<typeof api.products.get>;
  try {
    preloaded = await preloadQuery(api.products.get, { id });
  } catch (_err) {
    return notFound();
  }

  // Fetch product for JsonLd
  let product = null;
  try {
    product = await fetchQuery(api.products.get, { id });
  } catch {
    // If fetch fails, continue without JsonLd
  }

  const t = await getTranslations({ locale, namespace: "catalog" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  const breadcrumbItems = [
    { name: tCommon("home", { default: "Home" }), url: `/${locale}` },
    { name: t("title", { default: "Catalog" }), url: `/${locale}/catalog` },
  ];

  if (product) {
    breadcrumbItems.push({
      name: product.name,
      url: `/${locale}/catalog/${product._id}`,
    });
  }

  return (
    <>
      {product && <ProductJsonLd product={product} locale={locale} />}
      <BreadcrumbJsonLd locale={locale} items={breadcrumbItems} />
      <ProductDetailClient preloaded={preloaded} />
    </>
  );
}
