"use client";

import { CategoriesCarousel } from "@/components/ui/carousels/categories-carousel";
import { Hero, Quality, Footer } from "@/components/Containers";
import { ProductCarousel } from "@/components/ui/carousels/product-carousel";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import ParallaxImage from "@/components/ui/parallax-image";
import RainbowArcText from "@/components/ui/rainbow-text";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
interface HomePageClientProps {
  preloadedBestsellers: Preloaded<typeof api.products.list>;
}

export function HomePageClient({ preloadedBestsellers }: HomePageClientProps) {
  // Use preloaded query for instant data - no loading state!
  const bestsellersProduct = usePreloadedQuery(preloadedBestsellers);

  const categories = [
    {
      name: "Round Balloons",
      image: "/img.jpg",
      link: "/catalog?search=round",
    },
    {
      name: "Heart Balloons",
      image: "/baloons2.png",
      link: "/catalog?search=heart",
    },
    {
      name: "Star Balloons",
      image: "/baloons3.png",
      link: "/catalog?search=star",
    },
    {
      name: "Animal Balloons",
      image: "/baloons4.png",
      link: "/catalog?search=animal",
    },
    {
      name: "Kids Choice",
      image: "/img.jpg",
      link: "/catalog",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col">
      <Hero />

      {/* Bestsellers Carousel - Instant data from SSR */}
      {bestsellersProduct?.page && bestsellersProduct.page.length > 0 ? (
        <ProductCarousel
          data={bestsellersProduct.page}
          label="Bestselling"
          secondaryLabel="Products"
        />
      ) : (
        <div className="flex h-32 items-center justify-center">
          <div className="text-center text-gray-500">No products available</div>
        </div>
      )}

      {/* Categories Carousel */}
      <CategoriesCarousel categories={categories} />
      <RainbowArcText
        className="py-4 text-[10vw] sm:text-[8vw]"
        text="Lift Your Day"
      />
    </main>
  );
}
