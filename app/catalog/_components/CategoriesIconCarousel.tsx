"use client";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { useLayoutEffect, useState } from "react";

export interface Category {
  name: string;
  icon: string;
}

export interface CategoriesCarouselProps {
  categories: Category[];
  className?: string;
}

export function CategoriesIconCarousel({
  categories,
  className,
}: CategoriesCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [disabled, setDisabled] = useState(false);

  useLayoutEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setDisabled(!api.canScrollNext() && !api.canScrollPrev());
    };
    api.on("select", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className={className}>
      <Carousel
        setApi={setApi}
        className="group"
        opts={{
          dragFree: false,
          align: "start",
          slidesToScroll: 5,
        }}
      >
        <CarouselContent className="ml-0">
          {categories.map((category, index) => (
            <CarouselItem
              key={category.name}
              className={index === 0 ? "pl-0" : ""}
              style={{ maxWidth: "max-content" }}
            >
              <div className="flex flex-col items-center">
                <div className="relative flex aspect-square h-full w-full items-center justify-center rounded-xl">
                  <Image
                    src={category.icon}
                    alt={`${category.name} category`}
                    height={48}
                    width={48}
                    className="aspect-square h-full w-full rounded-xl object-cover text-gray-500 drop-shadow"
                  />
                </div>
                <div className="lg:16 mt-3 w-14 truncate text-center text-xs leading-none font-medium text-black lg:text-[0.8rem]">
                  {category.name}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="z-50 opacity-0 group-hover:flex lg:hidden lg:group-hover:opacity-100">
          <CarouselPrevious
            disabled={disabled}
            className="left-0 z-50 h-9 w-9 -translate-x-2/5 disabled:opacity-0 lg:left-4 lg:h-8 lg:w-8 lg:translate-x-0"
          />
          <CarouselNext
            disabled={disabled}
            className="right-0 z-50 h-9 w-9 translate-x-2/5 disabled:opacity-0 lg:right-4 lg:h-8 lg:w-8 lg:translate-x-0"
          />
        </div>
      </Carousel>
    </div>
  );
}
