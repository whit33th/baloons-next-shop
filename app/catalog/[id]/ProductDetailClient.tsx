"use client";

import Link from "next/link";
import {
  Preloaded,
  useMutation,
  usePreloadedQuery,
  useQuery,
} from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { balloonColors } from "@/components/ProductGrid";
import { useGuestCart, snapshotFromProduct } from "@/lib/guestCart";

interface Props {
  preloaded: Preloaded<typeof api.products.get>;
}

const FALLBACK_IMAGES = [
  "/baloons2.png",
  "/baloons3.png",
  "/img.jpg",
  "/baloons4.png",
];

export default function ProductDetailClient({ preloaded }: Props) {
  const product = usePreloadedQuery(preloaded);
  const addToCart = useMutation(api.cart.add);
  const user = useQuery(api.auth.loggedInUser);
  const { addItem: addGuestItem } = useGuestCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const galleryImages = useMemo(() => {
    if (!product) {
      return [];
    }
    if (product.imageUrls.length > 0) {
      return product.imageUrls;
    }
    return FALLBACK_IMAGES;
  }, [product]);

  useEffect(() => {
    setActiveImage(0);
  }, [galleryImages.length]);

  const accentColor = useMemo(() => {
    if (!product) {
      return "#000";
    }
    if (/^#/.test(product.color)) {
      return product.color;
    }
    return balloonColors[
      Math.abs(product.name?.length ?? 0) % balloonColors.length
    ];
  }, [product]);

  const handleAddToCart = async (desired: number = 1) => {
    if (!product) {
      return;
    }

    const safeQuantity = Math.max(1, Math.floor(desired));
    const clampedQuantity = Math.min(safeQuantity, product.inStock);

    if (!user) {
      addGuestItem(snapshotFromProduct(product), clampedQuantity);
      if (clampedQuantity < safeQuantity) {
        toast.info(
          `Added only ${clampedQuantity} item(s) due to stock limits.`,
        );
      } else {
        toast.success(`Added ${clampedQuantity} item(s) to cart!`);
      }
      return;
    }

    try {
      await addToCart({
        productId: product._id as any,
        quantity: clampedQuantity,
      });
      toast.success(`Added ${clampedQuantity} item(s) to cart!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add to cart",
      );
    }
  };

  if (product === undefined) {
    return (
      <div className="bg-[#F8F5ED]">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="aspect-4/5 animate-pulse rounded-4xl bg-white/60" />
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

  if (!product) {
    return (
      <div className="bg-[#F8F5ED]">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-4 text-6xl">❌</div>
            <h2 className="mb-2 text-3xl font-semibold text-black">
              Product not found
            </h2>
            <p className="mb-8 text-base text-black/70">
              The product you're looking for doesn't exist.
            </p>
            <Link
              href="/catalog"
              className="inline-flex h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-semibold tracking-wide text-white uppercase transition hover:bg-black/90"
            >
              Back to Catalog
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const totalThumbnails = galleryImages.length;
  const canNavigate = totalThumbnails > 1;

  const handlePreviousImage = () => {
    if (!canNavigate) return;
    setActiveImage((prev) => (prev - 1 + totalThumbnails) % totalThumbnails);
  };

  const handleNextImage = () => {
    if (!canNavigate) return;
    setActiveImage((prev) => (prev + 1) % totalThumbnails);
  };

  return (
    <section className="w-full bg-[#F8F5ED]">
      <div className="grid min-h-[calc(100vh-80px)] grid-cols-1 border-t border-neutral-950 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative flex flex-col border-b border-neutral-950 bg-[#FDF3E4] lg:border-r"
        >
          <div className="flex items-center justify-between border-b border-neutral-950 bg-white px-6 py-5 text-xs font-semibold tracking-[0.3rem] text-black/50 uppercase">
            <Link
              href="/catalog"
              className="text-black transition hover:opacity-70"
            >
              ← Back
            </Link>
            <span className="text-black/40">{product.shape} collection</span>
          </div>

          <div className="flex flex-1 items-center justify-center border-b border-neutral-950 px-6 py-8">
            <div
              className="relative aspect-3/4 w-full max-w-[620px] border border-neutral-950 bg-white shadow-[0_20px_40px_-30px_rgba(15,23,42,0.45)]"
              onWheel={(event) => {
                if (!canNavigate) {
                  return;
                }
                if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                  event.preventDefault();
                  if (event.deltaY > 0) {
                    handleNextImage();
                  } else {
                    handlePreviousImage();
                  }
                }
              }}
              onMouseDown={(event) => {
                if (canNavigate && event.button === 0) {
                  handleNextImage();
                }
              }}
              onKeyDown={(event) => {
                if (!canNavigate) {
                  return;
                }
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
              <AnimatePresence mode="wait">
                <motion.img
                  key={galleryImages[activeImage]}
                  src={galleryImages[activeImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  initial={{ opacity: 0.4, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35 }}
                />
              </AnimatePresence>

              {canNavigate ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-3">
                  {galleryImages.map((_, index) => (
                    <span
                      key={`dot-${index}`}
                      className={`h-2 w-8 border border-neutral-950 ${
                        index === activeImage ? "bg-neutral-950" : "bg-white"
                      }`}
                    />
                  ))}
                </div>
              ) : null}

              {canNavigate ? (
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <button
                    type="button"
                    onClick={handlePreviousImage}
                    className="ml-3 flex h-10 w-10 items-center justify-center border border-neutral-950 bg-white text-black transition hover:bg-black hover:text-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </div>
              ) : null}

              {canNavigate ? (
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="mr-3 flex h-10 w-10 items-center justify-center border border-neutral-950 bg-white text-black transition hover:bg-black hover:text-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex snap-x gap-3 overflow-x-auto border-b border-neutral-950 bg-white px-6 py-4">
            {galleryImages.map((image, index) => (
              <button
                key={image + index}
                type="button"
                onClick={() => setActiveImage(index)}
                className={`group relative aspect-3/4 h-32 w-auto shrink-0 overflow-hidden border border-neutral-950 transition ${
                  activeImage === index
                    ? "bg-[#F2EAE0]"
                    : "bg-white hover:bg-[#F8F3ED]"
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="h-full w-full object-cover transition group-hover:scale-[1.01]"
                />
                {activeImage === index ? (
                  <span className="absolute inset-0 border-2 border-neutral-950" />
                ) : null}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between px-6 py-4 text-xs tracking-[0.25rem] text-black/60 uppercase">
            <span>Hold & drag</span>
            <span>Scroll to preview</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col justify-between border-b border-neutral-950 bg-[#FDF3E4] px-8 py-10"
        >
          <div className="space-y-6">
            <div>
              <p className="text-xs tracking-[0.35rem] text-black/40 uppercase">
                Balloon atelier
              </p>
              <h1 className="mt-2 text-4xl font-semibold text-black">
                {product.name}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/70">
                {product.description}
              </p>
            </div>

            <div className="grid gap-4 border-y border-neutral-950 py-6 text-sm tracking-[0.2rem] text-black/60 uppercase">
              <div className="flex items-center justify-between">
                <span>Color</span>
                <span className="flex items-center gap-2 text-base font-semibold text-black normal-case">
                  <span
                    className="h-6 w-6 rounded-full border border-neutral-950"
                    style={{ backgroundColor: product.color }}
                  />
                  <span className="capitalize">{product.color}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Size</span>
                <span className="rounded-full border border-neutral-950 px-3 py-1 text-xs font-semibold text-black normal-case">
                  {product.size}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shape</span>
                <span className="rounded-full border border-neutral-950 px-3 py-1 text-xs font-semibold text-black normal-case">
                  {product.shape}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-xs tracking-[0.35rem] text-black/40 uppercase">
                Limited time offer
              </span>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-4xl font-semibold text-black">
                  ${product.price.toFixed(2)}
                </span>
                <span className="rounded-full border border-neutral-950 px-4 py-1 text-xs font-semibold tracking-[0.25rem] text-black uppercase">
                  {product.inStock} in stock
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs tracking-[0.3rem] text-black/50 uppercase">
                  Quantity
                  <select
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(Number(event.target.value))
                    }
                    className="ml-3 h-10 rounded-full border border-neutral-950 bg-white px-4 text-xs font-semibold tracking-[0.25rem] text-black uppercase outline-none"
                  >
                    {Array.from(
                      { length: Math.max(1, Math.min(10, product.inStock)) },
                      (_, idx) => idx + 1,
                    ).map((value) => (
                      <option value={value} key={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => void handleAddToCart(quantity)}
                disabled={product.inStock === 0}
                className="mt-2 inline-flex h-12 items-center justify-center border border-neutral-950 bg-black px-6 text-xs font-semibold tracking-[0.3rem] text-white uppercase transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-black/30"
              >
                {product.inStock === 0 ? "Sold out" : "Add to cart"}
              </motion.button>

              <div className="flex items-center gap-2 text-xs tracking-[0.2rem] text-black/40 uppercase">
                <Sparkles className="h-4 w-4" />
                Complimentary ribbon wrapping included
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs tracking-[0.2rem] text-black/45 uppercase">
            <p>• Inflates in seconds and stays buoyant for hours of colour.</p>
            <p>• Crafted from durable latex with a soft-touch finish.</p>
            <p>• Ships flat with recycled protective packaging.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
