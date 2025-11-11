"use client";

import type { IKImageProps } from "@imagekit/next";
import { Image } from "@imagekit/next";
import { type CSSProperties, useMemo, useState } from "react";

import {
  buildPlaceholderUrl,
  type ImageKitPlaceholderOptions,
} from "@/lib/imagekit";

export type ImageKitPictureProps = IKImageProps & {
  placeholderOptions?: ImageKitPlaceholderOptions;
};

export function ImageKitPicture({
  placeholderOptions,
  onLoad,
  style,
  ...imageProps
}: ImageKitPictureProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const placeholderUrl = useMemo(() => {
    if (typeof imageProps.src !== "string") {
      return undefined;
    }
    return buildPlaceholderUrl(imageProps.src, placeholderOptions);
  }, [imageProps.src, placeholderOptions]);

  const combinedStyle = useMemo(() => {
    if (!placeholderUrl || isLoaded) {
      return style;
    }

    return {
      backgroundImage: `url(${placeholderUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      transition: "filter 0.3s ease",
      ...style,
    } satisfies CSSProperties;
  }, [placeholderUrl, isLoaded, style]);

  return (
    <Image
      {...imageProps}
      style={combinedStyle}
      onLoad={(event) => {
        if (!isLoaded) {
          setIsLoaded(true);
        }
        onLoad?.(event);
      }}
    />
  );
}

export default ImageKitPicture;
