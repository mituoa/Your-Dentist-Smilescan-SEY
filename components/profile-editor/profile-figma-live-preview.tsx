"use client";

import type { ProfileEditorData } from "@/lib/types/profile-editor-data";
import { expandWorkingStyleVitaForDisplay } from "@/lib/profile/working-style-library";
import { figmaSpecialtyLabel, MAX_FIGMA_SPECIALTY_SELECTIONS } from "@/lib/profile/figma-specialties";
import { parsePracticeAddressBlock } from "@/lib/profile/practice-address-split";

interface ProfileFigmaLivePreviewProps {
  data: ProfileEditorData;
}

/**
 * Live-Vorschau der **öffentlichen** Präsenz im Patientenbereich — editorial, ruhig,
 * keine Dashboard-Kartenflut (kein CRM, kein internes Tool).
 */
export function ProfileFigmaLivePreview({ data }: ProfileFigmaLivePreviewProps) {
  const title = (data.title || "").trim();
  const first = (data.first_name || "").trim();
  const last = (data.last_name || "").trim();
  const fullName =
    [first, last].filter(Boolean).join(" ").trim() ||
    (data.display_name || "").trim() ||
    "Ihre Angaben";
  const practiceName = (data.practice_name || "").trim();
  const vitaBody = expandWorkingStyleVitaForDisplay(data.vita_markdown ?? null);
  const statements = vitaBody
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 3);
  const specs = data.specializations.slice(0, MAX_FIGMA_SPECIALTY_SELECTIONS);
  const addr = parsePracticeAddressBlock(data.practice_address);
  const hours = (data.practice_hours || "").trim();
  const hasAddress = !!(addr.street || addr.city || addr.postalCode);

  return (
    <div
      className="relative min-h-full w-full flex-1 bg-[#F2F0EC]"
      role="article"
      aria-label="Vorschau der öffentlichen Präsenz"
    >
      {/* Sehr dezente Tiefe — kein greller Verlauf */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(255,255,255,0.55),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-full w-full max-w-[720px] flex-col px-6 py-12 sm:px-10 sm:py-16 md:px-14 md:py-[4.5rem] lg:px-16 lg:py-20">
        {/* Hero: Portrait + Identität — zentrale Bühne */}
        <header className="flex flex-col items-center text-center">
          <div className="mb-10 w-full max-w-[280px] sm:mb-12 sm:max-w-[300px]">
            {data.photo_url ? (
              <div className="relative mx-auto aspect-[3/4] w-full overflow-hidden rounded-[1.25rem] bg-[#E8E6E1] shadow-[0_24px_48px_-24px_rgba(15,23,42,0.25),0_0_0_1px_rgba(15,23,42,0.04)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.photo_url}
                  alt=""
                  className="h-full w-full object-cover object-[50%_18%]"
                />
              </div>
            ) : (
              <div
                className="mx-auto flex aspect-[3/4] w-full max-w-[260px] flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-slate-300/60 bg-white/40 px-6 text-center backdrop-blur-[2px]"
                aria-hidden
              >
                <p className="text-[13px] font-medium leading-relaxed text-slate-500">
                  Porträt ergänzen
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-400">
                  Sichtbar für Patientinnen und Patienten neben Ihrem Namen.
                </p>
              </div>
            )}
          </div>

          {title ? (
            <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.14em] text-slate-500 sm:text-[13px]">
              {title}
            </p>
          ) : null}

          <h1 className="max-w-[22ch] text-balance font-semibold tracking-[-0.03em] text-slate-950 sm:max-w-none">
            <span className="block text-[clamp(1.75rem,4.2vw,2.75rem)] leading-[1.12]">{fullName}</span>
          </h1>

          {practiceName ? (
            <p className="mt-4 max-w-lg text-pretty text-[15px] font-normal leading-relaxed text-slate-600 sm:text-[16px]">
              {practiceName}
            </p>
          ) : null}
        </header>

        {/* Kurzprofil — editorial, linksbündig in enger Spalte (Leseruhe) */}
        {statements.length > 0 ? (
          <div className="mx-auto mt-14 w-full max-w-[34rem] sm:mt-16 md:mt-[4.5rem]">
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Arbeitsweise
            </p>
            <div className="space-y-6 border-t border-slate-200/70 pt-8">
              {statements.map((text, index) => (
                <p
                  key={`${index}-${text.slice(0, 24)}`}
                  className={
                    index === 0
                      ? "text-[17px] font-medium leading-[1.65] text-slate-800 sm:text-[18px]"
                      : "text-[16px] font-normal leading-[1.75] text-slate-600 sm:text-[17px]"
                  }
                >
                  {text}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        {/* Schwerpunkte — typografisch, nicht „Filter-Chips“ */}
        {specs.length > 0 ? (
          <div className="mx-auto mt-14 w-full max-w-[34rem] sm:mt-16 md:mt-[4.5rem]">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Schwerpunkte
            </p>
            <p className="text-pretty text-[15px] font-normal leading-[1.85] tracking-[-0.01em] text-slate-700 sm:text-[16px]">
              {specs.map((id, i) => (
                <span key={id}>
                  {i > 0 ? <span className="text-slate-300"> · </span> : null}
                  <span className="font-medium text-slate-800">{figmaSpecialtyLabel(id)}</span>
                </span>
              ))}
            </p>
          </div>
        ) : null}

        {/* Praxis & Erreichbarkeit — eine ruhige Fläche */}
        {(hasAddress || hours) && (
          <div className="mx-auto mt-14 w-full max-w-[34rem] sm:mt-16 md:mt-[4.5rem]">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Praxis
            </p>
            <div className="rounded-2xl border border-slate-200/60 bg-white/50 px-6 py-6 text-[15px] leading-relaxed text-slate-700 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-[2px] sm:px-8 sm:py-7">
              {hasAddress ? (
                <div className="space-y-0.5">
                  {addr.street ? <p>{addr.street}</p> : null}
                  {(addr.postalCode || addr.city) && (
                    <p className="text-slate-600">
                      {[addr.postalCode, addr.city].filter(Boolean).join(" ")}
                    </p>
                  )}
                </div>
              ) : null}
              {hours ? (
                <p className={hasAddress ? "mt-5 border-t border-slate-200/60 pt-5 text-slate-600" : ""}>
                  {hours}
                </p>
              ) : null}
            </div>
          </div>
        )}

        <p className="mx-auto mt-14 max-w-[32rem] text-pretty text-center text-[11px] font-normal leading-relaxed text-slate-400 sm:mt-16 sm:text-[12px]">
          Vorschau der Darstellung im Patientenbereich. Leistungsliste und vollständiger Kontaktblock
          erscheinen dort wie hinterlegt; hier nicht in voller Breite abgebildet.
        </p>
      </div>
    </div>
  );
}
