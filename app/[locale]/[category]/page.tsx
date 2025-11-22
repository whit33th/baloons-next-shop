import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { SelectedGroupShowcase } from "@/components/categories/CategoryShowcases";
import {
  CATEGORY_GROUP_SLUGS,
  PRODUCT_CATEGORY_GROUPS,
  SLUG_TO_CATEGORY_GROUP,
} from "@/constants/categories";
import { routing } from "@/i18n/routing";

export const dynamicParams = false;
export const dynamic = "force-static";

const STATIC_SLUGS = Object.values(CATEGORY_GROUP_SLUGS) as Array<
  (typeof CATEGORY_GROUP_SLUGS)[keyof typeof CATEGORY_GROUP_SLUGS]
>;
export function generateStaticParams() {
  const params: Array<{ locale: string; category: string }> = [];
  for (const locale of routing.locales) {
    for (const category of STATIC_SLUGS) {
      params.push({ locale, category });
    }
  }
  return params;
}
export default async function CategoryLandingPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  const groupValue = SLUG_TO_CATEGORY_GROUP[category];
  if (!groupValue) {
    console.log(params);
    notFound();
  }

  const group = PRODUCT_CATEGORY_GROUPS.find(
    (candidate) => candidate.value === groupValue,
  );

  if (!group) {
    notFound();
  }

  return <SelectedGroupShowcase group={group} />;
}
