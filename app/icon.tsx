import { SHARE_ASSET_PATHS, readShareAsset, pngResponse } from "@/lib/share-assets";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return pngResponse(readShareAsset(SHARE_ASSET_PATHS.icon32));
}
