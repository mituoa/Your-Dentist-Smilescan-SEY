import { ImageResponse } from "next/og";

import { SITE_DESCRIPTION } from "@/lib/site-metadata";

/** Rounded mark card used in favicon, Apple touch, and OG artwork (Your Dentist smile mark). */
export function BrandMarkCard({ size }: { size: number }) {
  const r = Math.round(size * 0.19);
  const inner = Math.round(size * 0.78);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: "linear-gradient(145deg, #FFFFFF 0%, #E3F3EC 100%)",
        border: "2px solid rgba(15, 110, 86, 0.2)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: inner,
          height: inner,
        }}
      >
        <div
          style={{
            fontSize: Math.round(size * 0.11),
            fontStyle: "italic",
            fontWeight: 300,
            color: "#0f172a",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          Your
        </div>
        <div
          style={{
            fontSize: Math.round(size * 0.15),
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            marginTop: Math.round(size * 0.02),
          }}
        >
          Dentist
        </div>
      </div>
    </div>
  );
}

export function openGraphBrandImageResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          background: "linear-gradient(155deg, #FAFAFA 0%, #EEF2FF 38%, #F8F7F3 100%)",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 28,
            maxWidth: 1080,
          }}
        >
          <BrandMarkCard size={120} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: 42,
                fontWeight: 600,
                color: "#111827",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              Your Dentist
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 500,
                color: "#0284C7",
                marginTop: 10,
                letterSpacing: "-0.02em",
              }}
            >
              Neutral Practice Platform
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: "#4B5563",
                marginTop: 20,
                lineHeight: 1.45,
                maxWidth: 720,
              }}
            >
              {SITE_DESCRIPTION}
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

/** Apple touch / PWA: centered mark with safe padding for iOS squircle mask. */
export function appleTouchBrandImageResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #FFFFFF 0%, #E8F5EF 55%, #E3F3EC 100%)",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <BrandMarkCard size={132} />
      </div>
    ),
    { width: 180, height: 180 }
  );
}

/** Small raster favicon (tabs); matches brand mark. */
export function faviconBrandImageResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
        }}
      >
        <BrandMarkCard size={26} />
      </div>
    ),
    { width: 32, height: 32 }
  );
}

/** Optional 16×16 for legacy `<link sizes="16x16">`; browsers scale 32 well — kept for spec parity. */
export function favicon16BrandImageResponse() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
        }}
      >
        <BrandMarkCard size={13} />
      </div>
    ),
    { width: 16, height: 16 }
  );
}
