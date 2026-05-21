import { SHARE_ASSET_PATHS, readShareAsset, pngResponse } from "@/lib/share-assets";
import { SITE_OG_IMAGE_ALT } from "@/lib/site-metadata";

export const alt = SITE_OG_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return pngResponse(readShareAsset(SHARE_ASSET_PATHS.og));
}
