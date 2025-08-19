import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent "fs" from being bundled in client-side code
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
    eslint: {
    ignoreDuringBuilds: true, // ✅ lets build succeed even if ESLint has errors
  },
};

export default nextConfig;
