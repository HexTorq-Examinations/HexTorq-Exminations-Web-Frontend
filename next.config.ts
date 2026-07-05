import type { NextConfig } from "next";

// output: 'export' disables Next.js middleware entirely, which breaks `next dev`
// (every request errors: "Middleware cannot be used with output: export"). Keep it
// opt-in, e.g.: STATIC_EXPORT=true npm run build
const nextConfig: NextConfig = {
  ...(process.env.STATIC_EXPORT === 'true' ? { output: 'export' as const } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
