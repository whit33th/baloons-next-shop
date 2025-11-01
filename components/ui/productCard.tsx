import { Doc } from "@/convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import { Route } from "next";
import { balloonColors } from "../ProductGrid";

export default function ProductCard({
  product,
  index,
}: {
  product: Doc<"products"> & {
    primaryImageUrl: string | null;
    imageUrls: string[];
  };
  index: number;
}) {
  // Assign colors based on product - matching reference colorful balloon theme

  const colorIndex = index % balloonColors.length;
  const bgColor = balloonColors[colorIndex];

  const srcs = ["/baloons2.png", "/baloons3.png", "/img.jpg", "/baloons4.png"];
  return (
    <Link href={`/catalog/${product._id}` as Route}>
      <div
        // style={{ backgroundColor: bgColor }}
        className={`flex h-full flex-col border-r border-b border-neutral-950`}
      >
        {/* Product Image with colorful balloon background */}
        <div
          className="relative aspect-3/4 w-full"
          style={{ backgroundColor: bgColor }}
        >
          <div className="flex h-full w-full items-center justify-center">
            {product.primaryImageUrl ? (
              <Image
                src={product.primaryImageUrl}
                alt={product.name}
                width={400}
                height={600}
                className="aspect-3/4 h-full w-full object-cover"
                loading={index < 2 ? "eager" : "lazy"}
              />
            ) : (
              <Image
                src={srcs[index % srcs.length]}
                alt={"asd"}
                width={400}
                height={600}
                className="aspect-3/4 h-full w-full object-cover"
                loading={index < 2 ? "eager" : "lazy"}
              />
            )}
          </div>
        </div>

        {/* Product Info */}
        <div
          className={`relative overflow-hidden border-t border-neutral-950 px-4 py-2`}
          style={{ backgroundColor: bgColor }}
        >
          {/* Ribbon-like top border accent */}
          <div className="mb-2 flex items-center gap-2">
            <div className="via-border h-px flex-1 bg-linear-to-r from-transparent to-transparent" />
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                <div
                  className="h-1 w-1 rotate-45"
                  style={{ backgroundColor: "var(--support-warm)" }}
                />
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "var(--color-blue)" }}
                />
              </div>

              <div className="flex gap-0.5">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "var(--color-terracotta)" }}
                />
                <div
                  className="h-1 w-1 rotate-45"
                  style={{ backgroundColor: "var(--color-deep)" }}
                />
              </div>
            </div>
            <div className="via-border h-px flex-1 bg-linear-to-r from-transparent to-transparent" />
          </div>

          {/* Price with playful styling */}
          <div className="space-y-0.5 text-center text-xs">
            <h3 className="font-bold uppercase">{product.name}</h3>
            <span>{product.price} €</span>
          </div>

          {/* Title with decorative underline */}
        </div>
      </div>
    </Link>
  );
}
