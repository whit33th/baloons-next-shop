import { preloadQuery } from "convex/nextjs";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CategorySection } from "@/components/CategorySection";
import { Hero } from "@/components/Containers";
import { ProductCarousels } from "@/components/Containers/ProductCarousels";
import { AnimatedSection } from "@/components/ui/animated-section";
import RainbowArcText from "@/components/ui/rainbow-text";
import { api } from "@/convex/_generated/api";
import { routing } from "@/i18n/routing";

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

  // Preload data on the server using preloadQuery
  const preloadedBestsellers = await preloadQuery(api.products.list, {
    order: "orderCount-desc",
    paginationOpts: {
      cursor: null,
      numItems: 8,
    },
  });

  const preloadedNewArrivals = await preloadQuery(api.products.list, {
    order: "createdAt-desc",
    paginationOpts: {
      cursor: null,
      numItems: 8,
    },
  });

  return (
    <main className="flex min-h-screen flex-col">
      <AnimatedSection>
        <Hero />
      </AnimatedSection>

      <div className="flex flex-col gap-6">
        <AnimatedSection>
          <CategorySection />
        </AnimatedSection>

        {/* Product Carousels - Client Component with preloaded data */}
        <ProductCarousels
          preloadedBestsellers={preloadedBestsellers}
          preloadedNewArrivals={preloadedNewArrivals}
        />
      </div>

      {/* Rainbow Text */}
      <RainbowArcText
        className="py-5 text-[10vw] sm:text-[8vw]"
        text={t("rainbowText")}
      />
    </main>
  );
}
