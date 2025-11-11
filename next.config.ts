import type { NextConfig } from "next";

const imageKitEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
const imageKitHostname = imageKitEndpoint
  ? (() => {
      try {
        return new URL(imageKitEndpoint).hostname;
      } catch (error) {
        console.warn("Invalid NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT", error);
        return "ik.imagekit.io";
      }
    })()
  : "ik.imagekit.io";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },

  reactCompiler: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: imageKitHostname,
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
