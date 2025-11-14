"use client";

import Image from "next/image";
import type { PRODUCT_CATEGORY_GROUPS } from "@/constants/categories";

type CategoryGroup = (typeof PRODUCT_CATEGORY_GROUPS)[number];

interface CategoryGroupCardProps {
  group: CategoryGroup;
  isActive: boolean;
  activeCategory: string;
  activeGroup: string | null;
  onGroupSelect: (groupValue: CategoryGroup["value"]) => void;
  onShowAll: (groupValue: CategoryGroup["value"]) => void;
  onSubcategorySelect: (
    value: string,
    groupValue: CategoryGroup["value"],
  ) => void;
}

export function CategoryGroupCard({
  group,
  isActive,
  activeCategory,
  activeGroup,
  onGroupSelect,
  onShowAll,
  onSubcategorySelect,
}: CategoryGroupCardProps) {
  const hasSubcategories = group.subcategories.length > 0;
  const isHighlighted = isActive;

  const handleClick = () => {
    if (!hasSubcategories) {
      onGroupSelect(group.value);
      return;
    }

    const isActiveSubcategory =
      activeGroup === group.value && Boolean(activeCategory);
    if (isActiveSubcategory) {
      onSubcategorySelect(activeCategory, group.value);
      return;
    }

    onShowAll(group.value);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative h-full min-h-18 w-full rounded-2xl border px-3 py-3 text-left transition-[background-color,box-shadow,border-color] duration-200 ${
        isHighlighted
          ? "bg-accent text-on-accent border-transparent shadow-[0_18px_28px_rgba(var(--accent-rgb),0.28)]"
          : "text-deep border-[rgba(var(--deep-rgb),0.1)] bg-[rgba(var(--primary-rgb),0.92)] hover:border-[rgba(var(--accent-rgb),0.4)]"
      }`}
      aria-pressed={isActive}
    >
      {group.icon ? (
        <div className="pointer-events-none absolute top-1/2 right-3 z-0 -translate-y-1/2">
          <div className="relative aspect-square overflow-hidden rounded-lg opacity-90">
            <Image
              src={group.icon}
              alt={group.label}
              width={48}
              height={48}
              className="aspect-square object-cover object-center"
            />
          </div>
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-12 flex-col justify-center pr-14">
        <span className="text-[0.95rem] leading-tight font-semibold">
          {group.label}
        </span>
        {group.description ? (
          <span
            className={`mt-0.5 text-xs ${
              isHighlighted
                ? "text-white/80"
                : "text-[rgba(var(--deep-rgb),0.6)]"
            }`}
          >
            {group.description}
          </span>
        ) : null}
      </div>
    </button>
  );
}
