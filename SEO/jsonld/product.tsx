import Script from "next/script";
import type {
  AggregateRating,
  Brand,
  Offer,
  Organization,
  Product as SchemaProduct,
  WithContext,
} from "schema-dts";
import { STORE_INFO } from "@/constants/config";
import type { Doc } from "@/convex/_generated/dataModel";
import { getBaseUrl } from "../utils";

type Product = Doc<"products">;

interface ProductJsonLdProps {
  product: Product;
  locale: string;
  slug: string;
}

export function ProductJsonLd({ product, locale, slug }: ProductJsonLdProps) {
  const baseUrl = getBaseUrl();
  const productUrl = `${baseUrl}/${locale}/catalog/${slug}`;
  const _imageUrl =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls[0]
      : `${baseUrl}/logo.png`;

  const offer: Offer = {
    "@type": "Offer",
    url: productUrl,
    priceCurrency: "EUR",
    price: product.price.toString(),
    availability: product.inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: {
      "@type": "Organization",
      name: STORE_INFO.name,
    } as Organization,
  };

  const brand: Brand = {
    "@type": "Brand",
    name: STORE_INFO.name,
  };

  const aggregateRating: AggregateRating | undefined =
    product.soldCount && product.soldCount > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: "5",
          reviewCount: product.soldCount,
        }
      : undefined;

  const productSchema: WithContext<SchemaProduct> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image:
      product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls
        : [`${baseUrl}/logo.png`],
    sku: product._id,
    mpn: product._id,
    brand,
    offers: offer,
    category: product.categoryGroup,
    ...(aggregateRating && { aggregateRating }),
    ...(product.availableColors &&
      product.availableColors.length > 0 && {
        color: product.availableColors,
      }),
  };

  return (
    <Script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
}
