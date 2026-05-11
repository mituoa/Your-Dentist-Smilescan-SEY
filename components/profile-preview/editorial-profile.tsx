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
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <nav className="flex flex-col gap-4 border-b border-border py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:py-10">
          {data.logo_url ? (
            <div className="flex max-w-full items-center sm:max-w-[220px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.logo_url}
                alt={data.practice_name || workspaceName}
                className="max-h-11 w-auto object-contain object-left sm:max-h-12"
              />
            </div>
          ) : (
            <div className="text-[13px] tracking-[0.12em] uppercase leading-snug sm:text-sm sm:tracking-[0.14em]">
              {data.practice_name || workspaceName}
            </div>
          )}
          {tagline && (
            <div className="max-w-full text-left text-[11px] leading-relaxed tracking-wider text-ink-soft sm:max-w-[min(100%,280px)] sm:text-right sm:text-xs">
              {tagline}
            </div>
          )}
        </nav>

        <section className="pt-14 md:pt-32 pb-16 md:pb-20">
          <div
            className={`grid gap-10 md:gap-20 ${data.photo_url ? "md:grid-cols-[1fr_400px]" : "grid-cols-1"} items-start`}
          >
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-ink-faint mb-8">
                Zahnärztliche Praxis
                {data.founding_year && ` · Est. ${data.founding_year}`}
              </div>
              <h1 className="font-serif font-light leading-[0.92] text-[clamp(3.5rem,9vw,8rem)] tracking-tight mb-10 max-w-[18ch]">
                {data.first_name && data.last_name ? (
                  <>
                    {data.first_name}{" "}
                    <span className="italic text-ink-soft">{data.last_name}</span>
                  </>
                ) : (
                  fullName
                )}
              </h1>
              <div className="flex flex-wrap gap-6 md:gap-12 pt-8 md:pt-10 mt-8 md:mt-10 border-t border-border">
                {displayTitle && (
                  <div>
                    <div className="text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-1.5">
                      Titel
                    </div>
                    <div className="text-sm font-medium">{displayTitle}</div>
                  </div>
                )}
                {topSpecs.length > 0 && (
                  <div>
                    <div className="text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-1.5">
                      Schwerpunkte
                    </div>
                    <div className="text-sm font-medium">
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
                    <div className="text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-1.5">
                      Praxis
                    </div>
                    <div className="text-sm font-medium">{data.practice_name}</div>
                  </div>
                )}
              </div>
            </div>

            {data.photo_url && (
              <div className="aspect-[4/5] bg-paper border border-border overflow-hidden">
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
          <section className="py-16 md:py-32 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16 mb-10">
              <div className="text-[10px] tracking-[0.3em] uppercase text-ink-faint">
                I · Vita
              </div>
              <h2 className="font-serif font-light text-[clamp(2.25rem,5vw,4rem)] leading-none">
                <span className="italic">Über</span> mich.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
              <div />
              <div className="max-w-[640px]">
                {vitaParagraphs.map((p, i) => (
                  <p
                    key={i}
                    className={`font-serif text-lg leading-relaxed text-ink mb-7 ${
                      i === 0
                        ? "first-letter:font-serif first-letter:text-[4.5rem] first-letter:leading-[0.8] first-letter:float-left first-letter:pr-3 first-letter:pt-1.5"
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
          <section className="py-16 md:py-32 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16 mb-10">
              <div className="text-[10px] tracking-[0.3em] uppercase text-ink-faint">
                II · Schwerpunkte
              </div>
              <h2 className="font-serif font-light text-[clamp(2.25rem,5vw,4rem)] leading-none">
                Meine <span className="italic">Schwerpunkte</span>.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
              <div />
              <div className="max-w-[640px]">
                <div className="flex flex-wrap gap-3">
                  {visibleSpecs.map((id) => (
                    <div
                      key={id}
                      className="inline-flex items-center px-4 py-2 border border-border rounded-full font-serif text-base"
                    >
                      {id.startsWith("custom:")
                        ? id.replace("custom:", "")
                        : getSpecializationLabel(id)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {visibleServices.length > 0 && (
          <section className="py-16 md:py-32 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16 mb-10">
              <div className="text-[10px] tracking-[0.3em] uppercase text-ink-faint">
                III · Leistungen
              </div>
              <h2 className="font-serif font-light text-[clamp(2.25rem,5vw,4rem)] leading-none">
                Was ich <span className="italic">anbiete</span>.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
              <div />
              <ul className="max-w-[640px] list-none">
                {visibleServices.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-col gap-1 border-b border-border py-5 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
                  >
                    <span className="font-serif text-[1.05rem] leading-snug text-ink sm:text-lg">
                      {s.name}
                    </span>
                    {s.note && (
                      <span className="shrink-0 text-[11px] uppercase tracking-wider text-ink-faint sm:text-xs">
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
          <section className="py-16 md:py-32 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16 mb-10">
              <div className="text-[10px] tracking-[0.3em] uppercase text-ink-faint">
                V · Praxis
              </div>
              <h2 className="font-serif font-light text-[clamp(2.25rem,5vw,4rem)] leading-none">
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
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16">
              <div />
              <div className="max-w-[640px] grid grid-cols-1 md:grid-cols-2 gap-10">
                {data.practice_address && (
                  <div>
                    <div className="text-[10px] tracking-[0.24em] uppercase text-ink-faint mb-2">
                      Adresse
                    </div>
                    <div className="font-serif text-base whitespace-pre-line">
                      {data.practice_address}
                    </div>
                  </div>
                )}
                {data.practice_hours && (
                  <div>
                    <div className="text-[10px] tracking-[0.24em] uppercase text-ink-faint mb-2">
                      Öffnungszeiten
                    </div>
                    <div className="font-serif text-base whitespace-pre-line">
                      {data.practice_hours}
                    </div>
                  </div>
                )}
                {data.practice_phone && (
                  <div>
                    <div className="text-[10px] tracking-[0.24em] uppercase text-ink-faint mb-2">
                      Telefon
                    </div>
                    <a
                      href={`tel:${data.practice_phone}`}
                      className="font-serif text-base border-b border-border pb-0.5 hover:border-ink transition-colors"
                    >
                      {data.practice_phone}
                    </a>
                  </div>
                )}
                {data.practice_email && (
                  <div>
                    <div className="text-[10px] tracking-[0.24em] uppercase text-ink-faint mb-2">
                      E-Mail
                    </div>
                    <a
                      href={`mailto:${data.practice_email}`}
                      className="font-serif text-base border-b border-border pb-0.5 hover:border-ink transition-colors"
                    >
                      {data.practice_email}
                    </a>
                  </div>
                )}
                {data.practice_website && (
                  <div>
                    <div className="text-[10px] tracking-[0.24em] uppercase text-ink-faint mb-2">
                      Website
                    </div>
                    <a
                      href={data.practice_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-base border-b border-border pb-0.5 hover:border-ink transition-colors"
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
          <section className="py-20 md:py-40 text-center bg-paper -mx-6 md:-mx-10 px-6 md:px-10 border-t border-border">
            <h2 className="font-serif font-light text-[clamp(3rem,7vw,6rem)] leading-none mb-5 max-w-[14ch] mx-auto">
              Unterlagen <span className="italic">einreichen</span>.
            </h2>
            <p className="text-lg text-ink-soft mb-10 max-w-[48ch] mx-auto">
              Senden Sie Fotos und Unterlagen diskret und verschlüsselt direkt an
              die Praxis.
            </p>
            <Link
              href={`/doc/${slug}/upload`}
              className="inline-flex min-h-[48px] items-center justify-center gap-3 rounded-sm bg-ink px-8 py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-cream no-underline transition-colors hover:bg-brand-glow sm:min-h-[52px] md:px-10 md:py-5"
            >
              Jetzt einsenden
              <span aria-hidden>→</span>
            </Link>
            <div className="mt-10 text-xs tracking-wider uppercase text-ink-faint">
              Ende-zu-Ende verschlüsselt · DSGVO-konform
            </div>
          </section>
        )}

        <footer className="flex flex-col gap-3 border-t border-border py-10 text-xs leading-relaxed text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0">
            © 2026 {data.practice_name || workspaceName}
          </div>
          <div className="shrink-0">
            Via <strong className="text-ink-soft">Your Dentist</strong>
          </div>
        </footer>
      </div>
    </div>
  );
}
