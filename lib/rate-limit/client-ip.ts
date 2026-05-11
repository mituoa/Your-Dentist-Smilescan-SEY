import type { NextRequest } from "next/server";

/** Best-effort client IP for rate limiting (trusts X-Forwarded-For first hop when present). */
export function getClientIpFromNextRequest(request: NextRequest): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function getClientIpFromHeaders(headers: Headers): string {
  const xf = headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim() || "unknown";
  return headers.get("x-real-ip")?.trim() || "unknown";
}
