"use client";

import { useMemo, useState } from "react";
import { ProductGallery } from "./ProductGallery";
import { ProductHeader } from "./ProductHeader";

interface ProductGalleryWrapperProps {
  images: string[];
  productName: string;
  productId: string;
}

export function ProductGalleryWrapper({
  images,
  productName,
  productId,
}: ProductGalleryWrapperProps) {
  const [activeImage, setActiveImage] = useState(0);

  const galleryImages = useMemo(() => {
    if (images.length === 0) {
      return [];
    }
    return images;
  }, [images]);

  const handleImageChange = (index: number) => {
    setActiveImage(index);
  };

  return (
    <div className="border-border relative flex flex-col lg:sticky lg:top-0 lg:h-[calc(100svh-57px)] lg:w-1/2 lg:overflow-hidden lg:border-r">
      <ProductHeader />
      <ProductGallery
        images={galleryImages}
        productName={productName}
        activeImage={activeImage}
        onImageChange={handleImageChange}
        transitionId={productId}
        transitionGroups={["catalog", "bestseller", "new-arrival"]}
      />
    </div>
  );
}
