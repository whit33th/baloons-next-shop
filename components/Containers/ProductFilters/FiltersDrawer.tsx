"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";

const colors = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "pink", label: "Pink" },
  { value: "purple", label: "Purple" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "orange", label: "Orange" },
];

const sizes = ["small", "medium", "large"];

const shapes = [
  { value: "round", label: "Round", emoji: "🎈" },
  { value: "heart", label: "Heart", emoji: "💖" },
  { value: "star", label: "Star", emoji: "⭐" },
  { value: "animal", label: "Animal", emoji: "🐶" },
];

const materials = [
  { value: "latex", label: "Latex" },
  { value: "foil", label: "Foil" },
  { value: "vinyl", label: "Vinyl" },
  { value: "mylar", label: "Mylar" },
];

const occasions = [
  { value: "all", label: "All Occasions" },
  { value: "birthday", label: "Birthday 🎂" },
  { value: "wedding", label: "Wedding 💒" },
  { value: "anniversary", label: "Anniversary 💑" },
  { value: "graduation", label: "Graduation 🎓" },
  { value: "baby-shower", label: "Baby Shower 👶" },
  { value: "holiday", label: "Holiday 🎄" },
  { value: "corporate", label: "Corporate 💼" },
  { value: "other", label: "Other 🎉" },
];

export function FiltersDrawer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [localPriceRange, setLocalPriceRange] = useState([0, 1000]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/catalog?${params.toString()}`);
  };

  const getParam = (key: string) => searchParams.get(key) || "";

  const hasActiveFilters = () => {
    return !!(
      getParam("search") ||
      getParam("color") ||
      getParam("size") ||
      getParam("shape") ||
      getParam("material") ||
      // getParam("occasion") ||
      getParam("available") ||
      getParam("sale") ||
      getParam("minPrice") ||
      getParam("maxPrice")
    );
  };

  const clearFilters = () => {
    router.push("/catalog");
  };

  const handlePriceCommit = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (localPriceRange[0] !== 0) {
      params.set("minPrice", localPriceRange[0].toString());
    } else {
      params.delete("minPrice");
    }

    if (localPriceRange[1] !== 1000) {
      params.set("maxPrice", localPriceRange[1].toString());
    } else {
      params.delete("maxPrice");
    }

    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>
        <button className="border-border/50 text-deep flex h-10 items-center gap-2 text-xs font-medium tracking-wide underline-offset-1 transition-colors hover:underline">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-primary h-[85vh] rounded-t-2xl">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="text-deep text-center text-2xl font-bold tracking-wide uppercase">
            Filters
          </DrawerTitle>
          <DrawerDescription className="text-deep/70 text-center">
            Select your preferred filters for balloons
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-8">
            {/* Available & Sale Toggles */}
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              }}
            >
              <Button
                variant={getParam("available") ? "secondary" : "ghost"}
                size="sm"
                onClick={() =>
                  updateParam("available", getParam("available") ? "" : "true")
                }
                className={`h-10 rounded-xl px-4 font-medium tracking-wide uppercase transition-all duration-200 ${
                  getParam("available")
                    ? "btn-secondary text-on-secondary shadow-md"
                    : "text-deep hover:bg-secondary/10 border-secondary border bg-transparent"
                }`}
              >
                Available
              </Button>
              <Button
                variant={getParam("sale") ? "secondary" : "ghost"}
                size="sm"
                onClick={() =>
                  updateParam("sale", getParam("sale") ? "" : "true")
                }
                className={`h-10 rounded-xl px-4 font-medium tracking-wide uppercase transition-all duration-200 ${
                  getParam("sale")
                    ? "btn-secondary text-on-secondary shadow-md"
                    : "text-deep hover:bg-secondary/10 border-secondary border bg-transparent"
                }`}
              >
                Sale
              </Button>
            </div>
            {/* Price Range Filter */}
            <div>
              <h3 className="text-deep mb-2 text-lg font-semibold tracking-wide uppercase">
                Price Range
              </h3>
              <div className="space-y-4">
                <Slider
                  value={localPriceRange}
                  onValueChange={setLocalPriceRange}
                  onValueCommit={handlePriceCommit}
                  min={0}
                  max={1000}
                  step={10}
                  className="w-full"
                />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-1 items-center gap-2">
                    <label className="text-deep/70 text-sm font-medium">
                      Min:
                    </label>
                    <input
                      type="number"
                      value={localPriceRange[0]}
                      onChange={(e) =>
                        setLocalPriceRange([
                          Math.max(0, parseInt(e.target.value) || 0),
                          localPriceRange[1],
                        ])
                      }
                      onBlur={handlePriceCommit}
                      className="border-secondary text-deep focus:border-secondary focus:ring-secondary/20 w-full rounded-xl border bg-transparent px-3 py-2 text-sm transition-colors outline-none focus:ring-2"
                    />
                  </div>
                  <span className="text-lg font-medium text-black">-</span>
                  <div className="flex flex-1 items-center gap-2">
                    <label className="text-deep/70 text-sm font-medium">
                      Max:
                    </label>
                    <input
                      type="number"
                      value={localPriceRange[1]}
                      onChange={(e) =>
                        setLocalPriceRange([
                          localPriceRange[0],
                          Math.min(1000, parseInt(e.target.value) || 1000),
                        ])
                      }
                      onBlur={handlePriceCommit}
                      className="border-secondary text-deep focus:border-secondary focus:ring-secondary/20 w-full rounded-xl border bg-transparent px-3 py-2 text-sm transition-colors outline-none focus:ring-2"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Color Filter */}
            <div>
              <h3 className="text-deep mb-4 text-lg font-semibold tracking-wide uppercase">
                Color
              </h3>
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                }}
              >
                {colors.map((color) => (
                  <Button
                    key={color.value}
                    variant={
                      getParam("color") === color.value
                        ? "secondary"
                        : "outline"
                    }
                    className={`h-12 rounded-xl border tracking-wide uppercase transition-all duration-200 ${
                      getParam("color") === color.value
                        ? "btn-secondary text-on-secondary shadow-md"
                        : "border-secondary text-deep hover:bg-secondary/10 bg-transparent"
                    }`}
                    onClick={() =>
                      updateParam(
                        "color",
                        getParam("color") === color.value ? "" : color.value,
                      )
                    }
                  >
                    {color.label}
                  </Button>
                ))}
              </div>
            </div>
            {/* Size Filter */}
            <div>
              <h3 className="text-deep mb-4 text-lg font-semibold tracking-wide uppercase">
                Size
              </h3>
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                }}
              >
                {sizes.map((size) => (
                  <Button
                    key={size}
                    variant={
                      getParam("size") === size ? "secondary" : "outline"
                    }
                    className={`h-12 rounded-xl border tracking-wide capitalize transition-all duration-200 ${
                      getParam("size") === size
                        ? "btn-secondary text-on-secondary shadow-md"
                        : "border-secondary text-deep hover:bg-secondary/10 bg-transparent"
                    }`}
                    onClick={() =>
                      updateParam("size", getParam("size") === size ? "" : size)
                    }
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            {/* Shape Filter */}
            <div>
              <h3 className="text-deep mb-4 text-lg font-semibold tracking-wide uppercase">
                Shape
              </h3>
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                }}
              >
                {shapes.map((shape) => (
                  <Button
                    key={shape.value}
                    variant={
                      getParam("shape") === shape.value
                        ? "secondary"
                        : "outline"
                    }
                    className={`h-12 rounded-xl border tracking-wide uppercase transition-all duration-200 ${
                      getParam("shape") === shape.value
                        ? "btn-secondary text-on-secondary shadow-md"
                        : "border-secondary text-deep hover:bg-secondary/10 bg-transparent"
                    }`}
                    onClick={() =>
                      updateParam(
                        "shape",
                        getParam("shape") === shape.value ? "" : shape.value,
                      )
                    }
                  >
                    <span className="mr-2">{shape.emoji}</span>
                    {shape.label}
                  </Button>
                ))}
              </div>
            </div>
            {/* Material Filter */}
            <div>
              <h3 className="text-deep mb-4 text-lg font-semibold tracking-wide uppercase">
                Material
              </h3>
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                }}
              >
                {materials.map((mat) => (
                  <Button
                    key={mat.value}
                    variant={
                      getParam("material") === mat.value
                        ? "secondary"
                        : "outline"
                    }
                    className={`h-12 rounded-xl border tracking-wide uppercase transition-all duration-200 ${
                      getParam("material") === mat.value
                        ? "btn-secondary text-on-secondary shadow-md"
                        : "border-secondary text-deep hover:bg-secondary/10 bg-transparent"
                    }`}
                    onClick={() =>
                      updateParam(
                        "material",
                        getParam("material") === mat.value ? "" : mat.value,
                      )
                    }
                  >
                    {mat.label}
                  </Button>
                ))}
              </div>
            </div>
            {/* Occasion Filter
            <div>
              <h3 className="text-deep mb-4 text-lg font-semibold tracking-wide uppercase">
                Occasion
              </h3>
              <Select
                value={getParam("occasion") || "all"}
                onValueChange={(value) => updateParam("occasion", value)}
              >
                <SelectTrigger className="border-secondary hover:bg-secondary/10 h-12 rounded-xl border bg-transparent tracking-wide uppercase transition-colors">
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent className="border-secondary bg-background rounded-xl border">
                  {occasions.map((occasion) => (
                    <SelectItem
                      key={occasion.value}
                      value={occasion.value}
                      className="rounded-lg"
                    >
                      {occasion.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
          </div>
        </div>

        <DrawerFooter className="pt-4">
          {hasActiveFilters() && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-secondary text-deep hover:bg-secondary/10 w-full rounded-xl bg-transparent tracking-wide uppercase transition-all duration-200 hover:shadow-sm"
            >
              Clear All Filters
            </Button>
          )}
          <DrawerClose asChild>
            <Button className="btn-secondary text-on-secondary w-full rounded-xl transition-colors hover:brightness-95">
              Apply Filters
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
