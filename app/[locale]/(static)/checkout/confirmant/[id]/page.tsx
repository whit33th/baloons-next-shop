import { preloadQuery } from "convex/nextjs";
import type { Preloaded } from "convex/react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import CheckoutConfirmantClient from "./CheckoutConfirmantClient";

export default async function CheckoutConfirmantPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  // Load translations on the server
  const _t = await getTranslations({ locale, namespace: "checkoutConfirmant" });

  // Preload order data on the server
  let preloadedOrder: Preloaded<typeof api.orders.getPublic>;
  try {
    preloadedOrder = await preloadQuery(api.orders.getPublic, {
      id: id as Id<"orders">,
    });
  } catch (_err) {
    return notFound();
  }

  return <CheckoutConfirmantClient preloadedOrder={preloadedOrder} />;
}
