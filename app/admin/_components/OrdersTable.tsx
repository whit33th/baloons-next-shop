import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_META } from "./types";
import { formatCurrency, formatDateTime } from "./utils";

interface OrdersTableProps {
  orders: Array<Doc<"orders">>;
  isLoading: boolean;
}

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
          <tr>
            <th className="px-6 py-3 text-left">Заказ</th>
            <th className="px-6 py-3 text-left">Клиент</th>
            <th className="px-6 py-3 text-left">Состав</th>
            <th className="px-6 py-3 text-left">Статус</th>
            <th className="px-6 py-3 text-right">Сумма</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
          {isLoading ? (
            <tr>
              <td colSpan={5} className="текст-center px-6 py-12">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                <p className="mt-3 text-sm text-slate-500">
                  Загружаем список заказов...
                </p>
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                Заказы пока не оформлены или доступ к ним ограничен.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order._id} className="hover:bg-slate-50/60">
                <td className="px-6 py-4 font-semibold whitespace-nowrap text-slate-900">
                  #{order._id.slice(-6)}
                  <div className="text-xs font-normal text-slate-400">
                    {formatDateTime(order._creationTime)}
                  </div>
                </td>
                <td className="max-w-[220px] px-6 py-4">
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-xs text-slate-400">
                    {order.customerEmail}
                  </div>
                </td>
                <td className="max-w-[280px] px-6 py-4 text-sm text-slate-600">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <span key={`${order._id}-${item.productId}-${idx}`}>
                      {item.productName} ×{item.quantity}
                      {idx < order.items.slice(0, 2).length - 1 ? ", " : ""}
                    </span>
                  ))}
                  {order.items.length > 2 ? (
                    <span className="text-xs text-slate-400">
                      {" "}
                      + ещё {order.items.length - 2}
                    </span>
                  ) : null}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                      ORDER_STATUS_META[order.status].tone,
                    )}
                  >
                    {ORDER_STATUS_META[order.status].label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-semibold whitespace-nowrap text-slate-900">
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
