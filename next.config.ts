import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  typedRoutes: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
