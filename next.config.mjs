import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "400mb",
    },
  },
  webpack: (config) => {
    config.watchOptions = {
      ...(config.watchOptions ?? {}),
      ignored: [
        ...(Array.isArray(config.watchOptions?.ignored)
          ? config.watchOptions.ignored
          : config.watchOptions?.ignored
            ? [config.watchOptions.ignored]
            : []),
        "**/FIGMA DESIGN ALL/**",
        "**/.next/**",
      ],
    };
    return config;
  },
  /** `/inbox-preview` (MVP-Vorschau): Crawler-Hinweis ergänzend zu `metadata.robots` in `app/inbox-preview/page.tsx`. */
  async headers() {
    return [
      {
        source: "/inbox-preview",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/inbox-preview/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/brand/share/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
