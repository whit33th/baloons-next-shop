"use client";

import { useCallback, useEffect, useRef, useState, memo } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

interface GalleryImageProps {
  image: string;
  productName: string;
  index: number;
  isPreviousImage: boolean;
  scrollProgress: MotionValue<number>;
  priority: boolean;
}

const GalleryImage = memo(function GalleryImage({
  image,
  productName,
  index,
  isPreviousImage,
  scrollProgress,
  priority,
}: GalleryImageProps) {
  const scale = useTransform(
    scrollProgress,
    [0, 1],
    isPreviousImage ? [1, 1.15] : [1, 1],
  );

  return (
    <motion.div
      className="sticky top-0 w-full"
      style={{
        zIndex: index + 1,
        // scale,
        willChange: isPreviousImage ? "transform" : "auto",
        height: "calc(100dvh - 57px - 26px)",
      }}
    >
      <div
        className="relative h-full w-full"
        style={{ aspectRatio: "3/4", maxHeight: "100%" }}
      >
        <Image
          src={image}
          alt={`${productName} ${index + 1}`}
          fill
          className="object-cover"
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </motion.div>
  );
});

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollProgress = useMotionValue(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const scrollToImage = useCallback((index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerWidth = container.clientWidth;
      const imageHeight = containerWidth * (4 / 3);
      const scrollPosition = index * imageHeight;

      container.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }

    if (mobileCarouselRef.current) {
      const container = mobileCarouselRef.current;
      const containerWidth = container.clientWidth;
      const scrollPosition = index * containerWidth;

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (!scrollContainerRef.current || images.length === 0) {
      return;
    }

    const container = scrollContainerRef.current;
    const isDesktop = container.offsetParent !== null;
    if (!isDesktop) {
      return;
    }

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = container.scrollTop;
        const containerWidth = container.clientWidth;
        const imageHeight = containerWidth * (4 / 3);

        // Calculate which image we're currently on
        const rawIndex = scrollTop / imageHeight;
        const currentIndex = Math.floor(rawIndex);

        // Progress from 0 to 1 within the current image
        const scrollWithinImage = rawIndex - currentIndex;

        // Switch to next image when scroll reaches 50%
        const displayIndex =
          scrollWithinImage >= 0.5 ? currentIndex + 1 : currentIndex;

        const clampedIndex = Math.max(
          0,
          Math.min(displayIndex, images.length - 1),
        );

        setActiveImageIndex(clampedIndex);
        scrollProgress.set(scrollWithinImage);
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [images, scrollProgress]);

  useEffect(() => {
    if (!mobileCarouselRef.current || images.length === 0) {
      return;
    }

    const container = mobileCarouselRef.current;
    const isMobile = container.offsetParent !== null;
    if (!isMobile) {
      return;
    }

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const index = Math.round(scrollLeft / containerWidth);
      const clampedIndex = Math.max(0, Math.min(index, images.length - 1));
      setActiveImageIndex(clampedIndex);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [images]);

  useEffect(() => {
    setActiveImageIndex(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    if (mobileCarouselRef.current) {
      mobileCarouselRef.current.scrollLeft = 0;
    }
  }, [images]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full lg:w-1/2 lg:flex-none lg:self-start">
      <div className="hidden lg:absolute lg:top-1/2 lg:left-6 lg:z-10 lg:flex lg:-translate-y-1/2 lg:flex-col lg:gap-3">
        {images.map((image, index) => {
          const isCurrent = index === activeImageIndex;

          return (
            <button
              key={`thumb-${index}`}
              type="button"
              onClick={() => scrollToImage(index)}
              className={`relative h-16 w-16 overflow-hidden border ${
                isCurrent ? "border-black" : "border-black/30"
              }`}
            >
              <Image
                src={image}
                width={64}
                height={64}
                alt={`${productName} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>

      <div className="relative flex w-full justify-center lg:hidden">
        <div className="relative w-full max-w-xl">
          <div
            ref={mobileCarouselRef}
            className="flex touch-pan-x snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((image, index) => (
              <div
                key={`mobile-image-${index}`}
                className="relative aspect-3/4 w-full shrink-0 snap-center"
              >
                <Image
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* <div className="absolute bottom-4 left-1/2 z-10 flex max-w-full -translate-x-1/2 snap-x snap-mandatory gap-2 overflow-x-auto px-4">
          {images.map((image, index) => (
            <button
              key={`mobile-thumb-${index}`}
              type="button"
              onClick={() => scrollToImage(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={activeImageIndex === index ? "true" : "false"}
              className={`relative h-14 w-14 shrink-0 snap-center overflow-hidden border-2 transition-colors ${
                activeImageIndex === index
                  ? "border-black bg-black/10"
                  : "border-black/30 hover:border-black/50"
              }`}
            >
              <Image
                src={image}
                width={56}
                height={56}
                alt={`${productName} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {activeImageIndex === index && (
                <div className="pointer-events-none absolute inset-0 border border-black" />
              )}
            </button>
          ))}
        </div> */}
      </div>

      <div
        ref={scrollContainerRef}
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        className="hidden w-full overflow-y-scroll overscroll-none [-ms-overflow-style:none] [scrollbar-width:none] lg:block [&::-webkit-scrollbar]:hidden"
        style={{
          scrollBehavior: "auto",
          height: "calc(100dvh - 57px - 26px)",
        }}
      >
        <div style={{ height: `${images.length * 100}%` }}>
          {images.map((image, index) => {
            const isPreviousImage = index === activeImageIndex - 1;

            return (
              <GalleryImage
                key={`image-${index}`}
                image={image}
                productName={productName}
                index={index}
                isPreviousImage={isPreviousImage}
                scrollProgress={scrollProgress}
                priority={index === 0}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
