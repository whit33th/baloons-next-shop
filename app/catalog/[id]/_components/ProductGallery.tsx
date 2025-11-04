"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { memo } from "react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  activeImage: number;
  onImageChange: (index: number) => void;
}

export const ProductGallery = memo(function ProductGallery({
  images,
  productName,
  activeImage,
  onImageChange,
}: ProductGalleryProps) {
  const canNavigate = images.length > 1;

  const handlePreviousImage = () => {
    if (!canNavigate) return;
    onImageChange((activeImage - 1 + images.length) % images.length);
  };

  const handleNextImage = () => {
    if (!canNavigate) return;
    onImageChange((activeImage + 1) % images.length);
  };

  return (
    <>
      <div className="border-border relative flex max-h-[calc(100dvh-57px-55.6px)] flex-1 flex-col border-b md:flex-row md:items-center md:justify-center">
        <div
          className="relative aspect-3/4 h-full w-full flex-1 overflow-hidden"
          onKeyDown={(event) => {
            if (!canNavigate) return;
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
              event.preventDefault();
              handleNextImage();
            }
            if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
              event.preventDefault();
              handlePreviousImage();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <Image
            key={images[activeImage]}
            src={images[activeImage]}
            alt={productName}
            fill
            className="aspect-3/4 h-full w-full object-contain drop-shadow"
            sizes="(min-width: 640px) 800px, 100vw"
            priority
          />

          {canNavigate && (
            <>
              <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-2 md:hidden">
                {images.map((_, index) => (
                  <span
                    key={`dot-${index}`}
                    className={`h-2 w-2 rounded-full transition-[width,background-color] duration-300 ${
                      index === activeImage
                        ? "bg-accent w-8"
                        : "backdrop-invert"
                    }`}
                  />
                ))}
              </div>

              <div className="absolute inset-y-0 left-0 flex items-center md:flex">
                <button
                  type="button"
                  onClick={handlePreviousImage}
                  className="text-deep hover:bg-secondary ml-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg transition-[transform,background-color,color] duration-200 hover:scale-110 hover:text-white md:flex"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </div>

              <div className="absolute inset-y-0 right-0 flex items-center md:flex">
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="text-deep hover:bg-secondary mr-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg transition-[transform,background-color,color] duration-200 hover:scale-110 hover:text-white md:flex"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            </>
          )}
        </div>

        <div className="border-border flex snap-x gap-3 overflow-x-auto border-t p-4 md:absolute md:bottom-2 md:left-1/2 md:-translate-x-1/2 md:border-t-0">
          {images.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => onImageChange(index)}
              className={`group relative aspect-3/4 h-20 w-auto shrink-0 overflow-hidden rounded transition-[transform,box-shadow,ring] duration-200 md:h-24 2xl:h-28 ${
                activeImage === index
                  ? "ring-secondary scale-105 shadow-lg ring-2"
                  : "ring-border hover:ring-secondary/50 ring-1 hover:shadow-md"
              }`}
            >
              <Image
                src={image}
                width={100}
                height={100}
                alt={`${productName} ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {activeImage === index && (
                <div className="bg-secondary/10 absolute inset-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
});
