export function ProductCarouselsFallback() {
  return (
    <>
      {/* Bestsellers Carousel Skeleton */}
      <section className="flex flex-col overflow-hidden">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between p-4 px-4">
          <div className="h-7 w-48 animate-pulse rounded bg-white/40" />
          <div className="h-5 w-24 animate-pulse rounded bg-white/40" />
        </div>

        {/* Carousel Skeleton */}
        <div className="border-foreground relative border-t">
          <div className="border-foreground grid w-full grid-cols-2 gap-0 border-r border-b sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`skeleton-bestseller-${index}`}
                className="border-foreground flex flex-col border-r border-b"
              >
                <div
                  className="aspect-3/4 animate-pulse"
                  style={{
                    backgroundColor: [
                      "#FFB3BA",
                      "#BAFFC9",
                      "#BAE1FF",
                      "#FFFFBA",
                      "#FFD4BA",
                      "#E0BBE4",
                    ][index % 6],
                  }}
                />
                <div className="px-4 py-3">
                  <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-white/60" />
                  <div className="h-4 w-20 animate-pulse rounded bg-white/40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Carousel Skeleton */}
      <section className="flex flex-col overflow-hidden">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between p-4 px-4">
          <div className="h-7 w-48 animate-pulse rounded bg-white/40" />
          <div className="h-5 w-24 animate-pulse rounded bg-white/40" />
        </div>

        {/* Carousel Skeleton */}
        <div className="border-foreground relative border-t">
          <div className="border-foreground grid w-full grid-cols-2 gap-0 border-r border-b sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`skeleton-new-arrival-${index}`}
                className="border-foreground flex flex-col border-r border-b"
              >
                <div
                  className="aspect-3/4 animate-pulse"
                  style={{
                    backgroundColor: [
                      "#BAE1FF",
                      "#FFFFBA",
                      "#FFD4BA",
                      "#E0BBE4",
                      "#FFB3BA",
                      "#BAFFC9",
                    ][index % 6],
                  }}
                />
                <div className="px-4 py-3">
                  <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-white/60" />
                  <div className="h-4 w-20 animate-pulse rounded bg-white/40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

