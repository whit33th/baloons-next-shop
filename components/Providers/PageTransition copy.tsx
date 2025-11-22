"use client";

import { motion } from "motion/react";
import type { PropsWithChildren } from "react";
import { usePathname } from "@/i18n/routing";

export function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <motion.main
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="h-full w-full flex-1 *:h-full *:w-full *:flex-1"
    >
      {children}
    </motion.main>
  );
}
