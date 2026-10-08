import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

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

export default withBundleAnalyzer(nextConfig);
