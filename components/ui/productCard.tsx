"use client";

import { buildSrc, Image } from "@imagekit/next";
import type { Route } from "next";
import { type ReactNode, useMemo, useState, ViewTransition } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import { Link } from "@/i18n/routing";
import {
  DEFAULT_PRODUCT_IMAGE_TRANSFORMATION,
  imageKitConfig,
} from "@/lib/imagekit";
import { balloonColors } from "../ProductGrid";

type ProductTag = "new" | "bestseller";

type ProductCardProduct = Doc<"products"> & {
  primaryImageUrl: string | null;
  imageUrls: string[];
  tags?: ProductTag[];
};

interface ProductCardProps {
  product: ProductCardProduct;
  index: number;
  transitionGroups?: string[];
  imageSizes?: string;
}

export default function ProductCard({
  product,
  index,
  transitionGroups,
  imageSizes,
}: ProductCardProps) {
  // Assign colors based on product - matching reference colorful balloon theme
  const colorIndex = index % balloonColors.length;
  const bgColor = balloonColors[colorIndex];
  const productHref = `/catalog/${product._id}` as Route;
  const transitionNames =
    transitionGroups && transitionGroups.length > 0
      ? transitionGroups.map((group) => `product-image-${group}-${product._id}`)
      : [`product-image-${product._id}`];

  const displayImage = product.primaryImageUrl ?? product.imageUrls[0] ?? null;

  const tags: ProductTag[] = product.tags ?? [];
  const formattedPrice = `${product.price.toFixed(2)} €`;

  const [showPlaceholder, setShowPlaceholder] = useState(true);

  const placeholderStyle = useMemo(() => {
    if (!showPlaceholder || !displayImage || !imageKitConfig.urlEndpoint) {
      return {};
    }

    const placeholderSrc = buildSrc({
      urlEndpoint: imageKitConfig.urlEndpoint,
      src: displayImage,
      transformation: [
        {
          width: 40,
          quality: 10,
          blur: 90,
        },
      ],
    });

    return {
      backgroundImage: `url(${placeholderSrc})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    };
  }, [showPlaceholder, displayImage]);

  return (
    <Link
      href={productHref}
      className="focus-visible:ring-accent focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="border-foreground flex h-full flex-col border-r border-b">
        {/* Product Image with colorful balloon background */}
        <div
          className="relative aspect-3/4 w-full"
          style={{ backgroundColor: bgColor }}
        >
          {displayImage ? (
            transitionNames.reduceRight<ReactNode>(
              (child, name) => (
                <ViewTransition key={name} name={name}>
                  {child}
                </ViewTransition>
              ),
              (
                <Image
                  src={displayImage}
                  alt={product.name}
                  fill
                  className="aspect-3/4 h-full w-full object-cover"
                  transformation={DEFAULT_PRODUCT_IMAGE_TRANSFORMATION}
                  sizes={
                    imageSizes ??
                    "(max-width: 720px) 50vw, (min-width: 965px) 33vw, (min-width: 1200px) 25vw, (min-width: 1440px) 20vw, (min-width: 1680px) 17vw, 400px "
                  }
                  style={placeholderStyle}
                  onLoad={() => {
                    setShowPlaceholder(false);
                  }}
                />
              ) as ReactNode,
            )
          ) : (
            <div className="bg-card flex h-full w-full items-center justify-center text-xs tracking-wide text-black/60 uppercase">
              {product.name}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="border-foreground relative flex flex-col gap-1 border-t px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-primary/20 rounded-full py-0.5 pr-2 text-xs font-medium tracking-wide text-red-500/90 uppercase"
              >
                {tag === "new" ? "New" : "Bestseller"}
              </span>
            ))}
          </div>
          <h3 className="text-sm leading-tight wrap-break-word">
            {product.name}
          </h3>
          <span className="text-sm font-semibold">{formattedPrice}</span>
        </div>
      </div>
    </Link>
  );
}
