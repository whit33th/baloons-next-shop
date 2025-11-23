// GenerateMetadata functions

export { generateCatalogMetadata } from "./generateMetadata/catalog";
export { generateCategoryMetadata } from "./generateMetadata/category";
export { generateHomeMetadata } from "./generateMetadata/home";
export { generateLegalMetadata } from "./generateMetadata/legal";
export { generateProductMetadata } from "./generateMetadata/product";
export { BreadcrumbJsonLd } from "./jsonld/breadcrumb";
export { OrganizationJsonLd } from "./jsonld/organization";
// JsonLd components
export { ProductJsonLd } from "./jsonld/product";

// Keywords
export { getKeywords, SEO_KEYWORDS } from "./keywords";

// Utils
export {
  formatPrice,
  getBaseUrl,
  getCanonicalUrl,
  getDefaultDescription,
  getSiteName,
  truncateText,
} from "./utils";
