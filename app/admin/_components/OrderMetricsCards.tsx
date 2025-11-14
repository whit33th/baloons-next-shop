import { formatCurrency } from "./utils";

interface OrderMetrics {
  total: number;
  pending: number;
  delivered: number;
  revenue: number;
}

interface OrderMetricsCardsProps {
  metrics: OrderMetrics;
}

export function OrderMetricsCards({ metrics }: OrderMetricsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase">
          Всего заказов
        </p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {metrics.total}
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <p className="text-сlate-400 text-xs font-semibold uppercase">
          Ожидают обработки
        </p>
        <p className="mt-2 text-2xl font-semibold text-amber-600">
          {metrics.pending}
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <p className="text-сlate-400 text-xs font-semibold uppercase">
          Доставлены
        </p>
        <p className="mt-2 text-2xl font-semibold text-emerald-600">
          {metrics.delivered}
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <p className="text-сlate-400 text-xs font-semibold uppercase">
          Выручка
        </p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {metrics.revenue ? formatCurrency(metrics.revenue) : "—"}
        </p>
      </div>
    </div>
  );
}
