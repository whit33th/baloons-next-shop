export const PRODUCT_CATEGORIES = [
  "For Kids",
  "For Her",
  "For Him",
  "Love",
  "Mom",
  "Baby Birth",
  "Surprise in a Balloon",
  "Anniversary",
  "Balloon Bouquets",
  "For Any Event",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
