import type { Doc } from "@/convex/_generated/dataModel";

export type OrderStatus = Doc<"orders">["status"];

export type PendingImage = {
  file: File;
  preview: string;
};

export type ProductCardData = Doc<"products"> & {
  primaryImageUrl: string | null;
};

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; tone: string }
> = {
  pending: {
    label: "В обработке",
    tone: "bg-amber-100 text-amber-900",
  },
  confirmed: {
    label: "Подтверждён",
    tone: "bg-sky-100 text-sky-900",
  },
  shipped: {
    label: "Отправлен",
    tone: "bg-indigo-100 text-indigo-900",
  },
  delivered: {
    label: "Доставлен",
    tone: "bg-emerald-100 text-emerald-900",
  },
};

export const ORDER_STATUS_FILTERS: Array<{
  value: OrderStatus | "all";
  label: string;
}> = [
  { value: "all", label: "Все статусы" },
  { value: "pending", label: "В обработке" },
  { value: "confirmed", label: "Подтверждён" },
  { value: "shipped", label: "Отправлен" },
  { value: "delivered", label: "Доставлен" },
];
