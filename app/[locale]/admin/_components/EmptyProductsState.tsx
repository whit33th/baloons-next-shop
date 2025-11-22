"use client";

import Image from "next/image";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/ui/button";

interface EmptyProductsStateProps {
  onCreateProduct: () => void;
}

export function EmptyProductsState({
  onCreateProduct,
}: EmptyProductsStateProps) {
  const t = useTranslations('admin');
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center shadow-sm">
      <Image
        src="/imgs/cat.png"
        alt={t('noProducts')}
        width={90}
        height={90}
        className="mx-auto"
      />
      <h2 className="text-lg font-semibold text-slate-900">
        {t('addFirstProduct')}
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        {t('addFirstProductDescription')}
      </p>
      <Button className="mt-5" onClick={onCreateProduct}>
        {t('addProduct')}
      </Button>
    </div>
  );
}
