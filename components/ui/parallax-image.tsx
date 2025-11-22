"use client";

import { Image } from "@imagekit/next";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function ParallaxImage() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  // чуть больше, чтобы не оставались края

  return (
    <section
      ref={ref}
      className="relative flex aspect-3/4 items-center justify-center overflow-hidden"
    >
      <motion.div
        style={{ y, scale: 1.1 }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src="/baloons2.png"
          alt="Parallax background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          transformation={[
            { width: 1600, quality: 65, format: "auto", progressive: true },
          ]}
        />
      </motion.div>
    </section>
  );
}
