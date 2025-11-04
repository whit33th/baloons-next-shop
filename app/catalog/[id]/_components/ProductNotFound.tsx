"use client";

import Link from "next/link";
import { motion } from "motion/react";

export function ProductNotFound() {
  return (
    <div className="min-h-screen bg-[#F8F5ED]">
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
            className="inline-flex h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-semibold tracking-wide text-white uppercase hover:opacity-90"
          >
            Back to Catalog
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
