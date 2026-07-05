import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a fully static site (one .html file per route) into out/ so it can be
  // served by any plain static file host/CDN — no Node server required at runtime.
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
