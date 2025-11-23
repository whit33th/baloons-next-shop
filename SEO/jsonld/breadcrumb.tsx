import type { BreadcrumbList, ListItem, WithContext } from "schema-dts";
import { getBaseUrl } from "../utils";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
  locale?: string;
}

export function BreadcrumbJsonLd({ items, locale }: BreadcrumbJsonLdProps) {
  const baseUrl = getBaseUrl(locale);

  const itemListElement: ListItem[] = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
  }));

  const breadcrumbSchema: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  );
}
