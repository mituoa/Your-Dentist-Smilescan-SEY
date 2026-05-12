"use client";

import type { ProfileEditorData } from "@/lib/types/profile-editor-data";
import { expandWorkingStyleVitaForDisplay } from "@/lib/profile/working-style-library";
import { figmaSpecialtyLabel, MAX_FIGMA_SPECIALTY_SELECTIONS } from "@/lib/profile/figma-specialties";
import { parsePracticeAddressBlock } from "@/lib/profile/practice-address-split";

interface ProfileFigmaLivePreviewProps {
  data: ProfileEditorData;
}

export function ProfileFigmaLivePreview({ data }: ProfileFigmaLivePreviewProps) {
  const title = (data.title || "").trim();
  const first = (data.first_name || "").trim();
  const last = (data.last_name || "").trim();
  const fullName =
    [title, first, last].filter(Boolean).join(" ").trim() ||
    (data.display_name || "").trim() ||
    "Ihre Angaben";
  const practiceName = (data.practice_name || "").trim();
  const vitaBody = expandWorkingStyleVitaForDisplay(data.vita_markdown ?? null);
  const statements = vitaBody.split(/\n\n+/).map((p) => p.trim()).filter(Boolean).slice(0, 3);
  const specs = data.specializations.slice(0, MAX_FIGMA_SPECIALTY_SELECTIONS);
  const addr = parsePracticeAddressBlock(data.practice_address);
  const hours = (data.practice_hours || "").trim();

  return (
    <div
      className="flex flex-1 justify-center overflow-auto"
      style={{ background: "#FAFAFA" }}
    >
      <div style={{ maxWidth: 560, width: "100%", padding: "clamp(40px, 11vw, 140px) clamp(16px, 5vw, 64px) clamp(36px, 9vw, 100px)" }}>
        <div style={{ marginBottom: "clamp(40px, 10vw, 88px)", textAlign: "center" }}>
          {data.photo_url ? (
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
              <div style={{ width: 148, height: 148, borderRadius: 2, overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.photo_url} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          ) : null}

          <h1
            style={{
              fontSize: "clamp(24px, 6vw, 42px)",
              fontWeight: 600,
              color: "#1a1a1a",
              letterSpacing: "-0.022em",
              lineHeight: 1.12,
              marginBottom: 14,
            }}
          >
            {fullName}
          </h1>
          {practiceName ? (
            <p style={{ fontSize: 16, color: "#6b6b6b", fontWeight: 400 }}>{practiceName}</p>
          ) : null}
        </div>

        {statements.length > 0 ? (
          <div style={{ marginBottom: 80 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {statements.map((text, index) => (
                <p
                  key={`${index}-${text.slice(0, 20)}`}
                  style={{
                    fontSize: index === 0 ? 20 : 17,
                    color: "#262626",
                    lineHeight: index === 0 ? 1.45 : 1.65,
                    fontWeight: index === 0 ? 500 : 400,
                    textAlign: "center",
                    marginBottom:
                      index === 0 ? 40 : index === statements.length - 1 ? 0 : 20,
                  }}
                >
                  {text}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {specs.length > 0 ? (
          <div style={{ marginBottom: 64 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                justifyContent: "center",
              }}
            >
              {specs.map((id) => (
                <div
                  key={id}
                  style={{
                    fontSize: 13,
                    fontWeight: 400,
                    padding: "7px 16px",
                    borderRadius: 2,
                    background: "#F3F3F3",
                    color: "#5c5c5c",
                  }}
                >
                  {figmaSpecialtyLabel(id)}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontSize: 15,
              color: "#4d4d4d",
              lineHeight: 1.6,
            }}
          >
            {(addr.street || addr.city || addr.postalCode) && (
              <div>
                {addr.street ? <div>{addr.street}</div> : null}
                {(addr.postalCode || addr.city) && (
                  <div>
                    {addr.postalCode} {addr.city}
                  </div>
                )}
              </div>
            )}
            {hours ? <div>{hours}</div> : null}
          </div>
        </div>

        <p
          style={{
            marginTop: 48,
            marginBottom: 0,
            fontSize: 11,
            color: "#a3a3a3",
            textAlign: "center",
            lineHeight: 1.55,
            maxWidth: 420,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Vorschau der Darstellung im Patientenbereich. Leistungsliste und vollständiger Kontaktblock erscheinen dort
          wie hinterlegt; hier nicht in voller Breite dargestellt.
        </p>
      </div>
    </div>
  );
}
