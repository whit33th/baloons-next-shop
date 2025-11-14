import ImageKitPicture from "@/components/ui/ImageKitPicture";
import { ADMIN_PRODUCT_IMAGE_TRANSFORMATION } from "@/lib/imagekit";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "./types";
import { formatCurrency } from "./utils";

interface ProductCardProps {
  product: ProductCardData;
  onClick: (product: ProductCardData) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <button
      type="button"
      aria-label={`Редактировать ${product.name}`}
      onClick={() => onClick(product)}
      className="group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
    >
      <div className="relative mb-4 aspect-3/4 overflow-hidden rounded-xl bg-slate-100">
        {product.primaryImageUrl ? (
          <ImageKitPicture
            src={product.primaryImageUrl}
            alt={product.name}
            fill
            loading="lazy"
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 90vw"
            className="object-cover transition group-hover:scale-105"
            transformation={ADMIN_PRODUCT_IMAGE_TRANSFORMATION}
            placeholderOptions={{
              width: 40,
              quality: 10,
              blur: 35,
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            🎈
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <h4 className="line-clamp-2 text-base font-semibold wrap-break-word text-slate-900">
          {product.name}
        </h4>
        <span
          className={cn(
            "flex rounded-full px-2.5 py-1 text-xs font-semibold text-nowrap",
            product.inStock
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700",
          )}
        >
          {product.inStock ? "В наличии" : "Нет"}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm wrap-break-word text-slate-600">
        {product.description}
      </p>

      <div className="mt-4 flex items-center justify-start text-sm text-slate-500">
        <span>{product.category}</span>
      </div>

      {product.availableColors?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.availableColors?.map((color) => (
            <span
              key={`${product._id}-${color}`}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
            >
              {color}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-semibold text-slate-900">
          {formatCurrency(product.price)}
        </span>
        <span className="text-xs text-slate-400">#{product._id.slice(-6)}</span>
      </div>
    </button>
  );
}
