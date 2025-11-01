"use client";
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
      className="relative flex aspect-[3/4] items-center justify-center overflow-hidden"
    >
      <motion.img
        src="/baloons2.png"
        alt="Parallax background"
        style={{ y, scale: 1.1 }}
        className="absolute top-0 left-0 h-full w-full object-cover will-change-transform"
      />
    </section>
  );
}
