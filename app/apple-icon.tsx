import { SHARE_ASSET_PATHS, readShareAsset, pngResponse } from "@/lib/share-assets";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return pngResponse(readShareAsset(SHARE_ASSET_PATHS.appleTouch));
}
