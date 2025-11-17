import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import type { DataModel, Doc } from "./_generated/dataModel";

const PERSONALIZATION_NONE = "__none__";

type CartItemDoc = Doc<"cartItems">;

const normalizePersonalization = (
  personalization: CartItemDoc["personalization"],
): CartItemDoc["personalization"] => {
  if (!personalization) {
    return undefined;
  }

  const normalized = {
    text: personalization.text?.trim() || undefined,
    color: personalization.color?.trim() || undefined,
    number: personalization.number?.trim() || undefined,
  } as const;

  if (!normalized.text && !normalized.color && !normalized.number) {
    return undefined;
  }

  return normalized;
};

const buildPersonalizationSignature = (
  personalization: CartItemDoc["personalization"],
) => {
  if (!personalization) {
    return PERSONALIZATION_NONE;
  }

  return JSON.stringify({
    text: personalization.text ?? null,
    color: personalization.color ?? null,
    number: personalization.number ?? null,
  });
};

export const migrations = new Migrations<DataModel>(components.migrations);

export const backfillCartPersonalizationSignature = migrations.define({
  table: "cartItems",
  migrateOne: async (_ctx, item) => {
    if (item.personalizationSignature) {
      return undefined;
    }

    const normalized = normalizePersonalization(item.personalization);

    return {
      personalization: normalized,
      personalizationSignature: buildPersonalizationSignature(normalized),
    };
  },
});

export const runBackfillCartPersonalizationSignature = migrations.runner(
  internal.migrations.backfillCartPersonalizationSignature,
);
