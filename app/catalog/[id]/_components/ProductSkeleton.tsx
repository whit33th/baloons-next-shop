"use client";

export function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F5ED]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="aspect-3/4 animate-pulse bg-white/60" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 animate-pulse rounded-full bg-white/60" />
            <div className="h-4 w-full animate-pulse rounded-full bg-white/60" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/60" />
            <div className="h-12 w-40 animate-pulse rounded-full bg-white/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
