import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  transpilePackages: ["recharts"],
  images: {
    domains: ["logo.clearbit.com"],
  },
};

export default nextConfig;
