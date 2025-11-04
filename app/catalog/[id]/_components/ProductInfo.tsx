"use client";

import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { memo, useCallback } from "react";

interface ProductInfoProps {
  name: string;
  description: string;
  price: number;
  inStock: number;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: (quantity: number) => void;
}

export const ProductInfo = memo(function ProductInfo({
  name,
  description,
  price,
  inStock,
  quantity,
  onQuantityChange,
  onAddToCart,
}: ProductInfoProps) {
  const handleQuantityChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onQuantityChange(Number(event.target.value));
    },
    [onQuantityChange],
  );

  const handleAddToCart = useCallback(() => {
    onAddToCart(quantity);
  }, [onAddToCart, quantity]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-secondary flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
          <Sparkles className="h-4 w-4" />
          Premium Balloon Collection
        </p>
        <h1 className="text-deep mt-3 text-4xl leading-tight font-bold lg:text-5xl">
          {name}
        </h1>
        <p className="text-deep/70 mt-5 max-w-2xl text-base leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <span className="text-deep/50 mb-1 block text-xs tracking-wider uppercase">
              Price
            </span>
            <span className="text-deep text-5xl font-bold">
              ${price.toFixed(2)}
            </span>
          </div>
          <span
            className={`rounded-full px-5 py-2 text-sm font-semibold tracking-wide uppercase ${
              inStock > 10
                ? "bg-secondary/10 text-secondary"
                : inStock > 0
                  ? "bg-support-warm/10 text-support-warm"
                  : "bg-deep/10 text-deep"
            }`}
          >
            {inStock > 0 ? `${inStock} in stock` : "Out of stock"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="text-deep flex items-center gap-3 text-sm font-medium">
            <span className="tracking-wider uppercase">Quantity:</span>
            <select
              value={quantity}
              onChange={handleQuantityChange}
              className="border-border text-deep hover:border-secondary focus:border-secondary focus:ring-secondary/20 h-11 rounded-xl border-2 bg-white px-4 text-sm font-semibold transition-colors outline-none focus:ring-2"
            >
              {Array.from(
                { length: Math.max(1, Math.min(10, inStock)) },
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
          onClick={handleAddToCart}
          disabled={inStock === 0}
          className="btn-accent text-on-accent mt-2 inline-flex h-14 items-center justify-center rounded-xl text-sm font-bold tracking-widest uppercase shadow-lg transition-[box-shadow,filter,opacity] duration-200 hover:shadow-xl hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
        >
          {inStock === 0 ? "Sold out" : "Add to cart"}
        </motion.button>

        <div className="text-secondary flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-5 w-5" />
          Free gift wrapping with every order
        </div>
      </div>
    </div>
  );
});
