import type { CSSProperties } from "react";
import Link from "next/link";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";
import { getSpecializationLabel } from "@/lib/masterdata/specializations";
import { expandWorkingStyleVitaForDisplay } from "@/lib/profile/working-style-library";
import type { ProfileEditorData } from "@/lib/types/profile-editor-data";
import { JournalPreviewList } from "@/components/public/journal-preview-list";
import type { JournalEntry } from "@/lib/types/journal-entry";
import {
  hexToRgbSpaceSeparated,
  lightenRgbSpaceSeparated,
} from "@/lib/color/hex-to-rgb-css";

interface EditorialProfileProps {
  data: ProfileEditorData;
  workspaceName: string;
  slug: string;
  cityTagline?: string | null;
  journalEntries?: JournalEntry[];
  previewMode?: boolean;
}

export function EditorialProfile({
  data,
  workspaceName,
  slug,
  cityTagline,
  journalEntries,
  previewMode = false,
}: EditorialProfileProps) {
  const fullName =
    [data.first_name, data.last_name].filter(Boolean).join(" ") ||
    data.display_name ||
    workspaceName;
  const displayTitle = data.title || null;

  const visibleSpecs = data.specializations.slice(
    0,
    PROFILE_LIMITS.MAX_VISIBLE_SPECIALIZATIONS
  );
  const visibleServices = data.services_structured.slice(
    0,
    PROFILE_LIMITS.MAX_VISIBLE_SERVICES
  );

  const topSpecs = visibleSpecs.slice(0, 3);
  const tagline =
    cityTagline || data.practice_address?.split("\n").pop()?.trim() || null;

  const accentHex = data.accent_color?.trim() || "#0F6E56";
  const primaryRgb = hexToRgbSpaceSeparated(accentHex);
  const glowRgb = lightenRgbSpaceSeparated(primaryRgb, 0.35);
  const brandCssVars = {
    "--brand-primary": primaryRgb,
    "--brand-glow": glowRgb,
  } as CSSProperties;

  const vitaParagraphs =
    expandWorkingStyleVitaForDisplay(data.vita_markdown ?? null)
      .split(/\n\n+/)
      .filter((p) => p.trim()) || [];

  return (
    <div className="bg-cream text-ink font-sans" style={brandCssVars}>
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-16">
        <nav className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:py-12">
          {data.logo_url ? (
            <div className="flex max-w-full items-center sm:max-w-[240px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.logo_url}
                alt={data.practice_name || workspaceName}
                className="max-h-12 w-auto object-contain object-left sm:max-h-14"
              />
            </div>
          ) : (
            <div className="text-[12px] font-medium tracking-[0.18em] uppercase leading-snug text-ink-soft sm:text-[13px]">
              {data.practice_name || workspaceName}
            </div>
          )}
          {tagline && (
            <div className="max-w-full text-left text-[11px] leading-relaxed tracking-wide text-ink-faint sm:max-w-[min(100%,300px)] sm:text-right sm:text-xs">
              {tagline}
            </div>
          )}
        </nav>

        <section className="pt-16 md:pt-40 pb-20 md:pb-28">
          <div
            className={`grid gap-12 md:gap-24 ${data.photo_url ? "md:grid-cols-[1fr_380px] lg:grid-cols-[1fr_420px]" : "grid-cols-1"} items-start`}
          >
            <div>
              <div className="text-[10px] tracking-[0.35em] uppercase text-ink-faint mb-10 md:mb-14">
                Zahnärztliche Praxis
                {data.founding_year && ` · Seit ${data.founding_year}`}
              </div>
              <h1 className="font-serif font-extralight leading-[0.88] text-[clamp(3.5rem,10vw,9rem)] tracking-[-0.02em] mb-0 max-w-[16ch]">
                {data.first_name && data.last_name ? (
                  <>
                    {data.first_name}
                    <br className="hidden md:block" />
                    <span className="italic text-ink-soft">{data.last_name}</span>
                  </>
                ) : (
                  fullName
                )}
              </h1>
              <div className="flex flex-wrap gap-8 md:gap-14 pt-10 md:pt-14 mt-10 md:mt-14 border-t border-ink/[0.08]">
                {displayTitle && (
                  <div>
                    <div className="text-[9px] tracking-[0.28em] uppercase text-ink-faint mb-2">
                      Titel
                    </div>
                    <div className="text-[15px] font-medium leading-snug">{displayTitle}</div>
                  </div>
                )}
                {topSpecs.length > 0 && (
                  <div>
                    <div className="text-[9px] tracking-[0.28em] uppercase text-ink-faint mb-2">
                      Schwerpunkte
                    </div>
                    <div className="text-[15px] font-medium leading-snug">
                      {topSpecs
                        .map((id) =>
                          id.startsWith("custom:")
                            ? id.replace("custom:", "")
                            : getSpecializationLabel(id)
                        )
                        .join(" · ")}
                    </div>
                  </div>
                )}
                {data.practice_name && (
                  <div>
                    <div className="text-[9px] tracking-[0.28em] uppercase text-ink-faint mb-2">
                      Praxis
                    </div>
                    <div className="text-[15px] font-medium leading-snug">{data.practice_name}</div>
                  </div>
                )}
              </div>
            </div>

            {data.photo_url && (
              <div className="aspect-[3/4] overflow-hidden shadow-[0_24px_80px_-12px_rgba(0,0,0,0.12)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.photo_url}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </section>

        {vitaParagraphs.length > 0 && (
          <section className="py-20 md:py-36 border-t border-ink/[0.06]">
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-20 mb-12">
              <div className="text-[10px] tracking-[0.35em] uppercase text-ink-faint pt-3">
                I · Vita
              </div>
              <h2 className="font-serif font-extralight text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.01em]">
                <span className="italic">Über</span> mich.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-20">
              <div />
              <div className="max-w-[620px]">
                {vitaParagraphs.map((p, i) => (
                  <p
                    key={i}
                    className={`font-serif text-[1.125rem] leading-[1.85] text-ink/90 mb-8 ${
                      i === 0
                        ? "first-letter:font-serif first-letter:text-[5rem] first-letter:leading-[0.75] first-letter:float-left first-letter:pr-4 first-letter:pt-2 first-letter:text-ink"
                        : ""
                    }`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {visibleSpecs.length > 0 && (
          <section className="py-20 md:py-36 border-t border-ink/[0.06]">
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-20 mb-12">
              <div className="text-[10px] tracking-[0.35em] uppercase text-ink-faint pt-3">
                II · Schwerpunkte
              </div>
              <h2 className="font-serif font-extralight text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.01em]">
                Meine <span className="italic">Schwerpunkte</span>.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-20">
              <div />
              <div className="max-w-[620px]">
                <ul className="list-none space-y-0">
                  {visibleSpecs.map((id, i) => (
                    <li
                      key={id}
                      className={`flex items-baseline gap-4 py-4 ${i < visibleSpecs.length - 1 ? "border-b border-ink/[0.06]" : ""}`}
                    >
                      <span className="text-[10px] tracking-[0.2em] text-ink-faint font-medium tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-serif text-[1.1rem] leading-snug text-ink">
                        {id.startsWith("custom:")
                          ? id.replace("custom:", "")
                          : getSpecializationLabel(id)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {visibleServices.length > 0 && (
          <section className="py-20 md:py-36 border-t border-ink/[0.06]">
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-20 mb-12">
              <div className="text-[10px] tracking-[0.35em] uppercase text-ink-faint pt-3">
                III · Leistungen
              </div>
              <h2 className="font-serif font-extralight text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.01em]">
                Was ich <span className="italic">anbiete</span>.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-20">
              <div />
              <ul className="max-w-[620px] list-none">
                {visibleServices.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-col gap-1.5 border-b border-ink/[0.06] py-6 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-12"
                  >
                    <span className="font-serif text-[1.1rem] leading-snug text-ink">
                      {s.name}
                    </span>
                    {s.note && (
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                        {s.note}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {journalEntries && journalEntries.length > 0 && (
          <JournalPreviewList entries={journalEntries} slug={slug} />
        )}

        {(data.practice_address ||
          data.practice_phone ||
          data.practice_email ||
          data.practice_website) && (
          <section className="py-20 md:py-36 border-t border-ink/[0.06]">
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-20 mb-12">
              <div className="text-[10px] tracking-[0.35em] uppercase text-ink-faint pt-3">
                V · Praxis
              </div>
              <h2 className="font-serif font-extralight text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.01em]">
                {data.practice_name ? (
                  <>
                    {data.practice_name.split(" ")[0]}{" "}
                    <span className="italic">
                      {data.practice_name.split(" ").slice(1).join(" ") || "."}
                    </span>
                  </>
                ) : (
                  "Praxis."
                )}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 md:gap-20">
              <div />
              <div className="max-w-[620px] grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {data.practice_address && (
                  <div>
                    <div className="text-[9px] tracking-[0.3em] uppercase text-ink-faint mb-2.5">
                      Adresse
                    </div>
                    <div className="font-serif text-[15px] leading-relaxed whitespace-pre-line">
                      {data.practice_address}
                    </div>
                  </div>
                )}
                {data.practice_hours && (
                  <div>
                    <div className="text-[9px] tracking-[0.3em] uppercase text-ink-faint mb-2.5">
                      Öffnungszeiten
                    </div>
                    <div className="font-serif text-[15px] leading-relaxed whitespace-pre-line">
                      {data.practice_hours}
                    </div>
                  </div>
                )}
                {data.practice_phone && (
                  <div>
                    <div className="text-[9px] tracking-[0.3em] uppercase text-ink-faint mb-2.5">
                      Telefon
                    </div>
                    <a
                      href={`tel:${data.practice_phone}`}
                      className="font-serif text-[15px] border-b border-ink/10 pb-0.5 hover:border-ink/40 transition-colors"
                    >
                      {data.practice_phone}
                    </a>
                  </div>
                )}
                {data.practice_email && (
                  <div>
                    <div className="text-[9px] tracking-[0.3em] uppercase text-ink-faint mb-2.5">
                      E-Mail
                    </div>
                    <a
                      href={`mailto:${data.practice_email}`}
                      className="font-serif text-[15px] border-b border-ink/10 pb-0.5 hover:border-ink/40 transition-colors"
                    >
                      {data.practice_email}
                    </a>
                  </div>
                )}
                {data.practice_website && (
                  <div>
                    <div className="text-[9px] tracking-[0.3em] uppercase text-ink-faint mb-2.5">
                      Website
                    </div>
                    <a
                      href={data.practice_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-[15px] border-b border-ink/10 pb-0.5 hover:border-ink/40 transition-colors"
                    >
                      {data.practice_website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {!previewMode && (
          <section className="py-24 md:py-44 text-center bg-paper -mx-6 md:-mx-12 lg:-mx-16 px-6 md:px-12 lg:px-16 border-t border-ink/[0.06]">
            <h2 className="font-serif font-extralight text-[clamp(3rem,7.5vw,6.5rem)] leading-[0.9] tracking-[-0.02em] mb-6 max-w-[14ch] mx-auto">
              Unterlagen <span className="italic">einreichen</span>.
            </h2>
            <p className="text-[17px] leading-relaxed text-ink-soft mb-12 max-w-[44ch] mx-auto">
              Senden Sie Fotos und Unterlagen diskret und verschlüsselt direkt an
              die Praxis.
            </p>
            <Link
              href={`/doc/${slug}/upload`}
              className="inline-flex min-h-[52px] items-center justify-center gap-3 bg-ink px-10 py-4 text-[13px] font-medium uppercase tracking-[0.16em] text-cream no-underline transition-colors hover:bg-ink/85 sm:min-h-[56px] md:px-12 md:py-5"
            >
              Jetzt einsenden
              <span aria-hidden>→</span>
            </Link>
            <div className="mt-12 text-[10px] tracking-[0.25em] uppercase text-ink-faint">
              Ende-zu-Ende verschlüsselt · DSGVO-konform
            </div>
          </section>
        )}

        <footer className="flex flex-col gap-3 py-12 md:py-14 text-[11px] leading-relaxed text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 tracking-wide">
            © 2026 {data.practice_name || workspaceName}
          </div>
          <div className="shrink-0 tracking-wide">
            Via <strong className="text-ink-soft font-medium">Your Dentist</strong>
          </div>
        </footer>
      </div>
    </div>
  );
}
