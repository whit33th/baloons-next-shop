"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  radius?: number;
  colors?: string[];
  className?: string;
}

export default function RainbowArcText({
  text,
  colors = [
    "#8EC7F6",
    "#EF476F",
    "#3A4F7A",
    "#F66E52",
    "#A1D99B",
    "#91E5CF",
    "#FFD93D",
  ],
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Split text into words to prevent word breaking
  const words = text.split(/\s+/);
  let charIndex = 0;

  return (
    <div ref={containerRef}>
      <div
        className={clsx(
          "font-bold/[1] text-center uppercase",
          className,
        )}
        style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
      >
        {words.map((word, wordIndex) => (
          <span
            key={`word-${wordIndex}`}
            style={{ 
              display: "inline-block",
              whiteSpace: "nowrap",
              marginRight: wordIndex < words.length - 1 ? "0.2em" : "0"
            }}
          >
            {word.split("").map((char) => {
              const i = charIndex++;
              const baseColor = colors[i % colors.length];
              const colorSequence = [
                ...colors.slice(i % colors.length),
                ...colors.slice(0, i % colors.length),
              ];
              const delay = i * 0.07;
              return (
                <motion.span
                  key={`char-${i}-${char}`}
                  initial={{ opacity: 0, scale: 1, color: baseColor }}
                  animate={
                    isVisible
                      ? { opacity: 1, scale: [1, 1.1, 1], color: colorSequence }
                      : {}
                  }
                  transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                    delay,
                    scale: { duration: 0.5, ease: "easeInOut", delay },
                    opacity: { duration: 0.35, ease: "easeInOut", delay },
                    color: {
                      duration: colorSequence.length * 0.11,
                      ease: "easeInOut",
                      delay,
                    },
                  }}
                  style={{ display: "inline-block", willChange: "transform" }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        ))}
      </div>
    </div>
  );
}
