import {
  type CategoryGroupValue,
  PRODUCT_CATEGORY_GROUPS,
} from "@/constants/categories";
import type { Id } from "@/convex/_generated/dataModel";

export function normalizeGroup(
  value?: string | null,
): CategoryGroupValue | null {
  if (!value) return null;
  let normalized = value;
  try {
    normalized = decodeURIComponent(value);
  } catch {
    normalized = value;
  }
  normalized = normalized
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

  const byValue = PRODUCT_CATEGORY_GROUPS.find((c) => c.value === normalized);
  if (byValue) return byValue.value;

  const byLabel = PRODUCT_CATEGORY_GROUPS.find(
    (c) => c.label.toLowerCase().replace(/[_\s]+/g, "-") === normalized,
  );
  if (byLabel) return byLabel.value;

  const byCategoryValue = PRODUCT_CATEGORY_GROUPS.find(
    (c) =>
      (c.categoryValue ?? "").toLowerCase().replace(/[_\s]+/g, "-") ===
      normalized,
  );
  if (byCategoryValue) return byCategoryValue.value;

  const partial = PRODUCT_CATEGORY_GROUPS.find((c) =>
    normalized.includes(c.value),
  );
  if (partial) return partial.value;

  return null;
}

/**
 * Генерирует slug для продукта из названия и ID
 * Формат: name-with-dashes-id
 */
export function generateProductSlug(name: string, id: Id<"products">): string {
  // Нормализация названия: lowercase, замена пробелов на тире, удаление спецсимволов
  const normalizedName = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // пробелы в тире
    .replace(/[^\w\-а-яё]/gi, "") // удаление спецсимволов, оставляем только буквы, цифры, тире и кириллицу
    .replace(/-+/g, "-") // множественные тире в одно
    .replace(/^-+|-+$/g, ""); // удаление тире в начале и конце

  return `${normalizedName}-${id}`;
}

/**
 * Извлекает ID продукта из slug
 * Использует split('-').pop() для получения последней части (ID)
 */
export function extractProductIdFromSlug(slug: string): Id<"products"> | null {
  if (!slug) return null;

  const parts = slug.split("-");
  const id = parts.pop();

  if (!id) return null;

  // Проверяем, что это валидный Convex ID (начинается с буквы и содержит только буквы/цифры)
  if (/^[a-z][a-z0-9]*$/i.test(id)) {
    return id as Id<"products">;
  }

  return null;
}
