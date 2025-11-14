import { formatCurrency } from "./utils";

interface ProductMetrics {
  total: number;
  available: number;
  outOfStock: number;
  personalizable: number;
  averagePrice: number;
}

interface ProductMetricsCardProps {
  metrics: ProductMetrics;
}

export function ProductMetricsCard({ metrics }: ProductMetricsCardProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase">
          Всего товаров
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {metrics.total}
        </p>
        <p className="text-xs text-slate-500">
          {metrics.available} в наличии · {metrics.outOfStock} нет на складе
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase">
          Средняя цена
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">
          {metrics.total ? formatCurrency(metrics.averagePrice) : "—"}
        </p>
        <p className="text-xs text-slate-500">
          {metrics.personalizable} персонализируемых позиций
        </p>
      </div>
    </div>
  );
}
