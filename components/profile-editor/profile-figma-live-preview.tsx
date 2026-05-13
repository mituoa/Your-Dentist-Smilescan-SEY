"use client";

import type { ProfileEditorData } from "@/lib/types/profile-editor-data";
import { expandWorkingStyleVitaForDisplay } from "@/lib/profile/working-style-library";
import { figmaSpecialtyLabel, MAX_FIGMA_SPECIALTY_SELECTIONS } from "@/lib/profile/figma-specialties";
import { parsePracticeAddressBlock } from "@/lib/profile/practice-address-split";

interface ProfileFigmaLivePreviewProps {
  data: ProfileEditorData;
}

/**
 * Öffentliche Profilbühne (Patientenbereich) — dominant, editorial, nicht „Preview-Widget“.
 */
export function ProfileFigmaLivePreview({ data }: ProfileFigmaLivePreviewProps) {
  const title = (data.title || "").trim();
  const first = (data.first_name || "").trim();
  const last = (data.last_name || "").trim();
  const fullName =
    [first, last].filter(Boolean).join(" ").trim() ||
    (data.display_name || "").trim() ||
    "Name ergänzen";
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
      className="relative flex min-h-full w-full flex-1 flex-col bg-[#EEEBE6]"
      role="article"
      aria-label="Öffentliche Profildarstellung"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_70%_at_50%_0%,rgba(255,255,255,0.72),transparent_58%)]"
        aria-hidden
      />

      <div className="relative flex min-h-full flex-1 flex-col px-5 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-14 md:px-12 md:pt-16 lg:px-14 lg:pb-16 lg:pt-[clamp(2.5rem,6vh,4.5rem)]">
        <div className="mx-auto w-full max-w-[min(100%,980px)] flex-1">
          {/* Hero: ab lg zweispaltig — Portrait + Identität (Magazin-Lesung) */}
          <header className="xl:grid xl:grid-cols-[minmax(200px,300px)_minmax(0,1fr)] xl:items-end xl:gap-x-14 xl:gap-y-6">
            <div className="mx-auto mb-10 w-full max-w-[280px] xl:mx-0 xl:mb-0 xl:max-w-none xl:justify-self-start">
              {data.photo_url ? (
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.125rem] bg-[#E4E1DA] shadow-[0_28px_56px_-28px_rgba(15,23,42,0.28),0_0_0_1px_rgba(15,23,42,0.05)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.photo_url}
                    alt=""
                    className="h-full w-full object-cover object-[50%_16%]"
                  />
                </div>
              ) : (
                <div
                  className="flex aspect-[3/4] w-full flex-col items-center justify-center rounded-[1.125rem] border border-slate-300/25 bg-white/25 px-5 text-center backdrop-blur-[1px]"
                  aria-hidden
                >
                  <p className="text-[13px] font-medium tracking-[-0.01em] text-slate-500">Porträt hinzufügen</p>
                </div>
              )}
            </div>

            <div className="text-center xl:pb-2 xl:text-left">
              {title ? (
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 sm:text-[12px]">
                  {title}
                </p>
              ) : null}

              <h1 className="font-serif text-[clamp(2rem,4.5vw,3.25rem)] font-light leading-[1.08] tracking-[-0.02em] text-slate-950">
                {fullName}
              </h1>

              {practiceName ? (
                <p className="mt-5 max-w-xl text-pretty text-[15px] font-normal leading-relaxed text-slate-600 sm:text-[17px] xl:mx-0 xl:max-w-[42ch]">
                  {practiceName}
                </p>
              ) : null}
            </div>
          </header>

          <div className="mx-auto mt-16 max-w-[40rem] space-y-16 sm:mt-20 md:mt-24 md:space-y-20">
            {statements.length > 0 ? (
              <section aria-label="Arbeitsweise">
                <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Arbeitsweise
                </p>
                <div className="space-y-6 border-t border-slate-300/25 pt-8">
                  {statements.map((text, index) => (
                    <p
                      key={`${index}-${text.slice(0, 24)}`}
                      className={
                        index === 0
                          ? "text-[18px] font-normal leading-[1.7] text-slate-800 sm:text-[19px]"
                          : "text-[16px] font-normal leading-[1.78] text-slate-600 sm:text-[17px]"
                      }
                    >
                      {text}
                    </p>
                  ))}
                </div>
              </section>
            ) : null}

            {specs.length > 0 ? (
              <section aria-label="Schwerpunkte">
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Schwerpunkte
                </p>
                <ul className="border-t border-slate-300/25 pt-7">
                  {specs.map((id) => (
                    <li
                      key={id}
                      className="border-b border-slate-300/20 py-3.5 text-[16px] font-normal leading-snug tracking-[-0.015em] text-slate-800 first:pt-0 sm:text-[17px]"
                    >
                      {figmaSpecialtyLabel(id)}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {(hasAddress || hours) && (
              <section aria-label="Praxis">
                <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Praxis</p>
                <div className="border-t border-slate-300/25 pt-7 text-[15px] leading-relaxed text-slate-700 sm:text-[16px]">
                  {hasAddress ? (
                    <div className="space-y-1">
                      {addr.street ? <p>{addr.street}</p> : null}
                      {(addr.postalCode || addr.city) && (
                        <p className="text-slate-600">{[addr.postalCode, addr.city].filter(Boolean).join(" ")}</p>
                      )}
                    </div>
                  ) : null}
                  {hours ? (
                    <p className={hasAddress ? "mt-6 border-t border-slate-300/20 pt-6 text-slate-600" : "text-slate-600"}>
                      {hours}
                    </p>
                  ) : null}
                </div>
              </section>
            )}
          </div>
        </div>

        <p className="mx-auto mt-auto max-w-[28rem] pt-16 text-center text-[10px] font-normal uppercase tracking-[0.12em] text-slate-400 sm:text-[11px] sm:normal-case sm:tracking-normal">
          Vorschau · Leistungen und vollständiger Kontakt erscheinen im Patientenbereich separat.
        </p>
      </div>
    </div>
  );
}
