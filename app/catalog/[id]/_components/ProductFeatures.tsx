"use client";

import { memo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FEATURES_SECTIONS = [
  {
    title: "Product Specifications",
    items: [
      "High-quality latex material with soft-touch finish",
      "Professional-grade durability for extended use",
    ],
  },
  {
    title: "Care & Usage",
    items: [
      "Inflates quickly in seconds - ready for any celebration",
      "Stays buoyant for hours with vibrant color retention",
    ],
  },
  {
    title: "Sustainability",
    items: [
      "Eco-friendly packaging made from recycled materials",
      "Perfect for parties, celebrations, and special moments",
    ],
  },
] as const;

export const ProductFeatures = memo(function ProductFeatures() {
  return (
    <div className="space-y-2">
      <Accordion type="single" collapsible className="w-full">
        {FEATURES_SECTIONS.map((section) => (
          <AccordionItem key={section.title} value={section.title}>
            <AccordionTrigger className="text-deep text-left font-semibold">
              {section.title}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="text-deep/70 space-y-2 text-sm">
                {section.items.map((item) => (
                  <li
                    key={`${section.title}-${item}`}
                    className="flex items-start gap-3"
                  >
                    <span className="text-secondary mt-0.5 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
});
