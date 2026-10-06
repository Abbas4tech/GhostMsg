import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tanstack/react-query",
      "motion",
      "radix-ui",
      "usehooks-ts",
      "@hookform/resolvers",
    ],
  },
};

export default nextConfig;
