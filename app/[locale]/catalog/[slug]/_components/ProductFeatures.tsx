"use client";

import { useTranslations } from 'next-intl';
import { memo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const ProductFeatures = memo(function ProductFeatures() {
  const t = useTranslations('product.features');
  
  const FEATURES_SECTIONS = [
    {
      title: t('specifications.title'),
      items: [
        t('specifications.item1'),
        t('specifications.item2'),
      ],
    },
    {
      title: t('care.title'),
      items: [
        t('care.item1'),
        t('care.item2'),
      ],
    },
    {
      title: t('sustainability.title'),
      items: [
        t('sustainability.item1'),
        t('sustainability.item2'),
      ],
    },
  ];
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
