"use client";

import { useTranslations } from "next-intl";
import { memo } from "react";
import { useRouter } from "@/i18n/routing";

export const ProductHeader = memo(function ProductHeader() {
  const router = useRouter();
  const t = useTranslations("product");
  return (
    <div className="border-border text-deep/60 flex items-center justify-between border-b px-6 py-5 text-xs font-semibold tracking-wider uppercase">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-deep hover:text-secondary flex items-center gap-2 transition-colors"
      >
        ← {t("back")}
      </button>
      <span className="text-deep/40">{t("premiumCollection")}</span>
    </div>
  );
});
