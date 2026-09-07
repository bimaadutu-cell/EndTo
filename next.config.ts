import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Don't fail build on ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on type errors in optional deps
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
