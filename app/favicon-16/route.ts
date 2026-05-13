import { favicon16BrandImageResponse } from "@/lib/brand-share-image";

export async function GET() {
  const res = favicon16BrandImageResponse();
  res.headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400");
  return res;
}
