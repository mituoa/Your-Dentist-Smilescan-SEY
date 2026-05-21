import { SHARE_ASSET_PATHS, readShareAsset, pngResponse } from "@/lib/share-assets";

export async function GET() {
  return pngResponse(readShareAsset(SHARE_ASSET_PATHS.icon16));
}
