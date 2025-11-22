import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { CategorySection } from "@/components/CategorySection";
import { Hero } from "@/components/Containers";
import RainbowArcText from "@/components/ui/rainbow-text";
import { routing } from "@/i18n/routing";
import { ProductCarouselsFallback } from "./_components/ProductCarouselsFallback";
import { ProductCarouselsWrapper } from "./_components/ProductCarouselsWrapper";

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
  }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <main className="flex min-h-screen flex-col">
      {/* Static content - pre-rendered at build time */}
      <Hero />

      <div className="flex flex-col gap-6">
        {/* CategorySection as Server Component - static, pre-rendered */}
        <CategorySection />

        {/* Product Carousels - Dynamic content wrapped in Suspense for streaming */}
        {/* Static shell renders immediately, dynamic content loads asynchronously */}
        <Suspense fallback={<ProductCarouselsFallback />}>
          <ProductCarouselsWrapper />
        </Suspense>
      </div>

      {/* Rainbow Text - Client Component with static text */}
      <RainbowArcText
        className="py-5 text-[10vw] sm:text-[8vw]"
        text={t("rainbowText")}
      />
    </main>
  );
}
