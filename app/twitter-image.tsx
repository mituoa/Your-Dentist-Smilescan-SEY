import { openGraphBrandImageResponse } from "@/lib/brand-share-image";
import { SITE_OG_IMAGE_ALT } from "@/lib/site-metadata";

export const alt = SITE_OG_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return openGraphBrandImageResponse();
}
