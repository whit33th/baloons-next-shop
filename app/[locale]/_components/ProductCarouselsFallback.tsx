import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousels/carousel";

const balloonColors = [
  "#FFB3BA", // pastel pink
  "#BAFFC9", // pastel green
  "#BAE1FF", // pastel blue
  "#FFFFBA", // pastel yellow
  "#FFD4BA", // pastel orange
  "#E0BBE4", // pastel purple
];

const carousels = [{ key: "bestseller" }, { key: "new-arrival" }];

export function ProductCarouselsFallback() {
  return (
    <>
      {carousels.map((carousel) => (
        <section key={carousel.key} className="flex flex-col overflow-hidden">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between p-4 px-4">
            <div className="h-6 w-48 animate-pulse rounded bg-white/40 md:h-8" />
            <div className="h-5 w-24 animate-pulse rounded bg-white/40" />
          </div>

          {/* Carousel Skeleton */}
          <div className="border-foreground relative border-t">
            <Carousel
              className="group"
              opts={{
                align: "start",
              }}
            >
              <CarouselContent className="ml-0">
                {Array.from({ length: 8 }).map((_, index) => (
                  <CarouselItem
                    key={`skeleton-${carousel.key}-${index}`}
                    className="basis-2/5 pl-0 sm:basis-2/7 md:basis-2/9 lg:basis-2/11 xl:basis-2/13"
                  >
                    <div className="border-foreground flex flex-col border-r border-b">
                      <div
                        className="aspect-3/4 animate-pulse"
                        style={{
                          backgroundColor:
                            balloonColors[index % balloonColors.length],
                        }}
                      />
                      <div className="px-4 py-3">
                        <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-white/60" />
                        <div className="h-4 w-20 animate-pulse rounded bg-white/40" />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>
      ))}
    </>
  );
}
