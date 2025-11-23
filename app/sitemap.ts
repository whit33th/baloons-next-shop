import { fetchQuery } from "convex/nextjs";
import type { MetadataRoute } from "next";
import { PRODUCT_CATEGORY_GROUPS } from "@/constants/categories";
import { STORE_INFO } from "@/constants/config";
import { api } from "@/convex/_generated/api";
import { routing } from "@/i18n/routing";

const baseUrl = STORE_INFO.website.replace(/\/$/, "");
const locales = routing.locales;
const PRODUCTS_PER_SITEMAP = 50000; // Google's limit

// Static pages that should be in sitemap
const staticPages = [
  { path: "", priority: 1.0, changeFrequency: "daily" as const },
  { path: "catalog", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "legal/terms", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "legal/privacy", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "legal/imprint", priority: 0.5, changeFrequency: "yearly" as const },
];

/**
 * Generate sitemaps for products
 * Split products into multiple sitemaps if needed (max 50,000 per sitemap)
 */
export async function generateSitemaps() {
  try {
    // Get all products to calculate how many sitemaps we need
    const _allProducts = await fetchQuery(api.products.list, {
      paginationOpts: { numItems: 1, cursor: "" },
      available: true,
    });

    // We need to get the total count, but the API returns paginated results
    // So we'll fetch all products in chunks to count them
    let totalProducts = 0;
    let cursor = "";
    let hasMore = true;

    while (hasMore) {
      const result = await fetchQuery(api.products.list, {
        paginationOpts: { numItems: 1000, cursor },
        available: true,
      });
      totalProducts += result.page.length;
      cursor = result.continueCursor;
      hasMore = !result.isDone && cursor !== "";
    }

    const numSitemaps = Math.ceil(totalProducts / PRODUCTS_PER_SITEMAP);
    return Array.from({ length: numSitemaps }, (_, i) => ({ id: i }));
  } catch {
    // If there's an error, return at least one sitemap
    return [{ id: 0 }];
  }
}

/**
 * Generate sitemap entries for products
 */
export default async function sitemap(props?: {
  id: Promise<number>;
}): Promise<MetadataRoute.Sitemap> {
  const sitemapId = props?.id ? await props.id : 0;

  const entries: MetadataRoute.Sitemap = [];

  // Add static pages and categories only to the first sitemap (id: 0)
  if (sitemapId === 0) {
    // Add static pages with localization
    for (const page of staticPages) {
      for (const locale of locales) {
        const url = `${baseUrl}/${locale}${page.path ? `/${page.path}` : ""}`;
        const alternates: Record<string, string> = {};

        // Add alternate language URLs
        for (const altLocale of locales) {
          if (altLocale !== locale) {
            alternates[altLocale] =
              `${baseUrl}/${altLocale}${page.path ? `/${page.path}` : ""}`;
          }
        }

        entries.push({
          url,
          lastModified: new Date(),
          changeFrequency: page.changeFrequency,
          priority: page.priority,
          alternates: {
            languages: alternates,
          },
        });
      }
    }

    // Add category pages with localization
    for (const categoryGroup of PRODUCT_CATEGORY_GROUPS) {
      for (const locale of locales) {
        const url = `${baseUrl}/${locale}/${categoryGroup.value}`;
        const alternates: Record<string, string> = {};

        for (const altLocale of locales) {
          if (altLocale !== locale) {
            alternates[altLocale] =
              `${baseUrl}/${altLocale}/${categoryGroup.value}`;
          }
        }

        entries.push({
          url,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
          alternates: {
            languages: alternates,
          },
        });
      }
    }
  }

  // Add product pages with images and localization
  try {
    const startIdx = sitemapId * PRODUCTS_PER_SITEMAP;
    const endIdx = startIdx + PRODUCTS_PER_SITEMAP;

    // Fetch products in chunks
    let cursor = "";
    let hasMore = true;
    let fetchedCount = 0;
    const products: Array<{
      _id: string;
      name: string;
      imageUrls?: string[];
      _creationTime: number;
    }> = [];

    while (hasMore && fetchedCount < endIdx) {
      const result = await fetchQuery(api.products.list, {
        paginationOpts: { numItems: 1000, cursor },
        available: true,
      });

      for (const product of result.page) {
        if (fetchedCount >= startIdx && fetchedCount < endIdx) {
          products.push({
            _id: product._id,
            name: product.name,
            imageUrls: product.imageUrls,
            _creationTime: product._creationTime,
          });
        }
        fetchedCount++;
        if (fetchedCount >= endIdx) break;
      }

      cursor = result.continueCursor;
      hasMore = !result.isDone && cursor !== "";
    }

    // Add product entries with images and localization
    for (const product of products) {
      // Get product images - up to 1000 per URL according to Google
      const images =
        product.imageUrls && product.imageUrls.length > 0
          ? product.imageUrls.slice(0, 1000).map((imageUrl) => {
              // Ensure absolute URL
              if (imageUrl.startsWith("http")) {
                return imageUrl;
              }
              return imageUrl.startsWith("/")
                ? `${baseUrl}${imageUrl}`
                : `${baseUrl}/${imageUrl}`;
            })
          : [];

      for (const locale of locales) {
        const url = `${baseUrl}/${locale}/catalog/${product._id}`;
        const alternates: Record<string, string> = {};

        for (const altLocale of locales) {
          if (altLocale !== locale) {
            alternates[altLocale] =
              `${baseUrl}/${altLocale}/catalog/${product._id}`;
          }
        }

        entries.push({
          url,
          lastModified: new Date(product._creationTime),
          changeFrequency: "weekly" as const,
          priority: 0.7,
          alternates: {
            languages: alternates,
          },
          images: images.length > 0 ? images : undefined,
        });
      }
    }
  } catch (error) {
    // If there's an error fetching products, continue with static pages
    console.error("Error fetching products for sitemap:", error);
  }

  return entries;
}
