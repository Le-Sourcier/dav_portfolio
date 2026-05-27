import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/:locale(fr|en)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/:locale(fr|en)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "bulk.nexuscorporat.com",
      },
      {
        protocol: "https",
        hostname: "bulk.nexuscorporat.com",
      },
      {
        protocol: "https",
        hostname: "nexuscorporat.com",
      },
      {
        protocol: "http",
        hostname: "nexuscorporat.com",
      },
      {
        protocol: "https",
        hostname: "api-docs.mailwizz.com",
      },
      {
        protocol: "https",
        hostname: "lesourcier.space",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
