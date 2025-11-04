"use client";

import Link from "next/link";
import { memo } from "react";

export const ProductHeader = memo(function ProductHeader() {
  return (
    <div className="border-border text-deep/60 flex items-center justify-between border-b px-6 py-5 text-xs font-semibold tracking-wider uppercase">
      <Link
        href="/catalog"
        className="text-deep hover:text-secondary flex items-center gap-2 transition-colors"
      >
        ← Back to Catalog
      </Link>
      <span className="text-deep/40">Premium Collection</span>
    </div>
  );
});
