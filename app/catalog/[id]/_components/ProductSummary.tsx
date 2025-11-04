"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import type { ProductWithImage } from "@/convex/helpers/products";

interface ProductSummaryProps {
  product: ProductWithImage;
  onAddToCart: (quantity: number) => Promise<void> | void;
}

export function ProductSummary({ product, onAddToCart }: ProductSummaryProps) {
  const [quantity, setQuantity] = useState(1);

  const quantityOptions = useMemo(() => {
    const limit = Math.max(1, Math.min(10, product.inStock));
    return Array.from({ length: limit }, (_, index) => index + 1);
  }, [product.inStock]);

  const handleSubmit = async () => {
    await onAddToCart(quantity);
  };

  return (
    <div className="flex w-full flex-col justify-between px-6 py-10 text-black lg:min-w-0 lg:flex-1 lg:px-8 lg:py-16">
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col space-y-8"
      >
        <div>
          <h1 className="mb-4 text-5xl font-light tracking-tight text-black lg:text-6xl">
            {product.name}
          </h1>
          <p className="text-3xl font-light text-black lg:text-4xl">
            {product.price.toFixed(2)}€
          </p>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-medium tracking-widest uppercase opacity-70">
            Overview
          </span>
          <p className="text-sm leading-relaxed text-black/80">
            {product.description}
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-medium tracking-widest uppercase opacity-70">
            Quantity
            <select
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="mt-2 ml-4 rounded border border-black/30 bg-transparent px-4 py-2 text-black outline-none hover:border-black/50 focus:border-black"
              disabled={product.inStock === 0}
            >
              {quantityOptions.map((value) => (
                <option
                  value={value}
                  key={value}
                  className="bg-[#FDF3E4] text-black"
                >
                  {value}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => void handleSubmit()}
              disabled={product.inStock === 0}
              className="flex h-12 items-center justify-center border border-black bg-black px-8 text-sm font-semibold tracking-widest text-white uppercase hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy now
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => void handleSubmit()}
              disabled={product.inStock === 0}
              className="flex h-12 items-center justify-center border border-black/50 bg-transparent px-8 text-sm font-semibold tracking-widest text-black uppercase hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add to bag
            </motion.button>
          </div>

          <p
            className={`text-xs font-medium uppercase ${
              product.inStock > 0 ? "text-black opacity-70" : "text-red-600"
            }`}
          >
            {product.inStock > 0
              ? `${product.inStock} in stock`
              : "Out of stock"}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="mt-8 space-y-4 border-t border-black/20 pt-8 text-sm text-black"
      >
        <Section title="Details">
          <p className="mt-4 text-xs leading-relaxed opacity-80">
            {product.description}
          </p>
        </Section>
        <Section title="Product care">
          <div className="mt-4 space-y-2 text-xs leading-relaxed opacity-80">
            <p>• Inflates in seconds and stays buoyant for hours</p>
            <p>• Crafted from durable latex with a soft-touch finish</p>
            <p>• Handle with care to maintain shape</p>
          </div>
        </Section>
        <Section title="Shipping & Return">
          <div className="mt-4 space-y-2 text-xs leading-relaxed opacity-80">
            <p>• Ships flat with recycled protective packaging</p>
            <p>• Free shipping on orders over 50€</p>
            <p>• 30-day return policy</p>
          </div>
        </Section>
      </motion.div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between py-2 text-xs font-medium tracking-widest uppercase opacity-70 hover:opacity-100">
        <span>{title}</span>
        <span className="transition-transform group-open:rotate-45">+</span>
      </summary>
      {children}
    </details>
  );
}
