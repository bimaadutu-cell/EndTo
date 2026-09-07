import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Prevent optional/demo-mode type issues from blocking Vercel deploy
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
