import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { getAppBaseUrl } from "@/lib/env";

/** Cache-safe static filenames — regenerate via `node scripts/generate-brand-share-assets.mjs`. */
export const SHARE_ASSET_PATHS = {
  og: "/brand/share/og-1200x630.png",
  twitter: "/brand/share/twitter-1200x630.png",
  appleTouch: "/brand/share/apple-touch-180.png",
  icon32: "/brand/share/icon-32.png",
  icon16: "/brand/share/icon-16.png",
  icon512: "/brand/share/icon-512.png",
} as const;

export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;

export const SHARE_CACHE_CONTROL =
  "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400, immutable";

export function absoluteShareUrl(path: string): string {
  return new URL(path, getAppBaseUrl()).href;
}

export function readShareAsset(relativePath: string): Buffer {
  return readFileSync(join(process.cwd(), "public", relativePath.replace(/^\//, "")));
}

export function pngResponse(buffer: Buffer): Response {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": SHARE_CACHE_CONTROL,
    },
  });
}
