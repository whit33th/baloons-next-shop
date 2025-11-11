"use client";

import { ImageKitProvider } from "@imagekit/next";
import type { PropsWithChildren } from "react";

import { imageKitConfig } from "@/lib/imagekit";

export default function AppImageKitProvider({ children }: PropsWithChildren) {
  if (!imageKitConfig.urlEndpoint) {
    return children;
  }

  return (
    <ImageKitProvider urlEndpoint={imageKitConfig.urlEndpoint}>
      {children}
    </ImageKitProvider>
  );
}
