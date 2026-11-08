import type { NextConfig } from "next";

const apiUrl = new URL(process.env.API_BASE_URL ?? "http://127.0.0.1:8000/api");
const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async rewrites() {
    return [{ source: "/game-media/:path*", destination: `${apiUrl.origin}/storage/games/:path*` }];
  },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
  experimental: { serverActions: { bodySizeLimit: "25mb" } },
};
export default nextConfig;
