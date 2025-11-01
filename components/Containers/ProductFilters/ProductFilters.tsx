"use client";

import { SearchInput } from "./SearchInput";
import { SortByButton } from "./SortByButton";
import { FiltersDrawer } from "./FiltersDrawer";
import { CategoriesIconCarousel } from "@/app/catalog/_components/CategoriesIconCarousel";

export function ProductFilters() {
  // Массив категорий для карусели
  const categories = [
    { name: "Birthday", icon: "/icons/cake.png" },
    { name: "Wedding", icon: "/icons/wedding.png" },
    { name: "Kids", icon: "/baloons3.png" },
    { name: "Anniversary", icon: "/baloons4.png" },
    { name: "Graduation", icon: "/img.jpg" },
    { name: "Corporate", icon: "/icons/cake.png" },
    // добавьте еще категории по желанию
  ];
  return (
    <div className="py-BALLOON_CATEGORIES2 flex flex-col gap-1.5 px-4 py-1 sm:gap-3 sm:px-8 sm:py-3">
      <CategoriesIconCarousel categories={categories} />
      <div className="block sm:hidden">
        <SearchInput />
      </div>
      <div className="grid w-full grid-cols-[auto_1fr_auto] gap-10 overflow-x-visible">
        <div className="justify-self-start">
          <SortByButton />
        </div>

        <div className="w-full max-w-xl justify-self-center">
          <div className="hidden sm:block">
            <SearchInput />
          </div>
        </div>

        <div className="justify-self-end">
          <FiltersDrawer />
        </div>
      </div>
    </div>
  );
}
