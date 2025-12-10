import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Empty config is fine - Turbopack handles most things automatically
  },
  // Remove eslint config - it's deprecated in next.config.ts
  // Use next lint command or .eslintrc instead
};

export default nextConfig;
