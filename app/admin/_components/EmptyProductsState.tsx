import Image from "next/image";
import { Button } from "@/components/ui/button";

interface EmptyProductsStateProps {
  onCreateProduct: () => void;
}

export function EmptyProductsState({
  onCreateProduct,
}: EmptyProductsStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center shadow-sm">
      <Image
        src="/imgs/cat.png"
        alt="No products"
        width={90}
        height={90}
        className="mx-auto"
      />
      <h2 className="text-lg font-semibold text-slate-900">
        Добавьте первый товар
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Нажмите на кнопку «+ Товар», чтобы открыть расширенную форму с
        изображениями и характеристиками.
      </p>
      <Button className="mt-5" onClick={onCreateProduct}>
        + Товар
      </Button>
    </div>
  );
}
