import {
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  Truck,
} from "lucide-react";
import type { ReactNode } from "react";
import { formatCurrency } from "./utils";

interface OrderMetrics {
  total: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  revenue: number;
}

interface OrderMetricsCardsProps {
  metrics: OrderMetrics;
}

export function OrderMetricsCards({ metrics }: OrderMetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
      <SimpleCard
        label="Всего заказов"
        value={String(metrics.total)}
        icon={<ShoppingCart size={16} className="text-slate-700" />}
      />
      <SimpleCard
        label="Ожидают обработки"
        value={String(metrics.pending)}
        colorClass="text-amber-600"
        icon={<Clock size={16} className="text-amber-600" />}
      />
      <SimpleCard
        label="Подтверждены"
        value={String(metrics.confirmed)}
        colorClass="text-sky-600"
        icon={<CheckCircle size={16} className="text-sky-600" />}
      />
      <SimpleCard
        label="Отправлены"
        value={String(metrics.shipped)}
        colorClass="text-indigo-600"
        icon={<Truck size={16} className="text-indigo-600" />}
      />
      <SimpleCard
        label="Доставлены"
        value={String(metrics.delivered)}
        colorClass="text-emerald-600"
        icon={<Package size={16} className="text-emerald-600" />}
      />
      <SimpleCard
        label="Выручка"
        value={metrics.revenue ? formatCurrency(metrics.revenue) : "—"}
        icon={<DollarSign size={16} className="text-slate-700" />}
      />
    </div>
  );
}

function SimpleCard({
  label,
  value,
  colorClass,
  icon,
}: {
  label: string;
  value: string;
  colorClass?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white/70 p-2 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-slate-400">
            {label}
          </div>
          <div
            className={`mt-0.5 text-base font-semibold ${colorClass ?? "text-slate-900"} truncate`}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}
