import Link from "next/link";

import { JournalPreviewList } from "@/components/public/journal-preview-list";
import { carreeThemeStyle } from "@/lib/profile/carree-theme";
import { CarreeEditorialHero } from "@/components/profile-preview/carree-editorial-hero";
import { CarreeProfileBody } from "@/components/profile-preview/carree-profile-body";
import { expandWorkingStyleVitaForDisplay } from "@/lib/profile/working-style-library";
import type { ProfileEditorData } from "@/lib/types/profile-editor-data";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";
import type { JournalEntry } from "@/lib/types/journal-entry";

interface EditorialProfileProps {
  data: ProfileEditorData;
  workspaceName: string;
  slug: string;
  appointmentLink?: string | null;
  journalEntries?: JournalEntry[];
  previewMode?: boolean;
}

export function EditorialProfile({
  data,
  workspaceName,
  slug,
  appointmentLink = null,
  journalEntries,
  previewMode = false,
}: EditorialProfileProps) {
  const visibleServices = data.services_structured.slice(0, PROFILE_LIMITS.MAX_VISIBLE_SERVICES);

  const vitaParagraphs = expandWorkingStyleVitaForDisplay(data.vita_markdown ?? null)
    .split(/\n\n+/)
    .filter((p) => p.trim());

  const hasCarreeBody =
    vitaParagraphs.length > 0 ||
    Boolean((data.profile_personal_approach ?? "").trim()) ||
    (data.profile_career_path?.length ?? 0) > 0 ||
    data.specializations.length > 0 ||
    (data.profile_credentials?.length ?? 0) > 0;

  return (
    <div
      className="yd-carree-profile min-h-screen"
      style={carreeThemeStyle(data.profile_background_color)}
    >
      <CarreeEditorialHero
        data={data}
        workspaceName={workspaceName}
        slug={slug}
        appointmentLink={appointmentLink}
        showUploadCta={!previewMode}
      />

      {hasCarreeBody ? <CarreeProfileBody data={data} /> : null}

      {visibleServices.length > 0 ? (
        <section className="yd-carree-profile__section" aria-labelledby="carree-services">
          <p className="yd-carree-profile__section-label">III · Leistungen</p>
          <h2 id="carree-services" className="yd-carree-profile__section-title">
            Was ich <em>anbiete</em>.
          </h2>
          <ul className="yd-carree-profile__list">
            {visibleServices.map((s) => (
              <li key={s.id}>
                {s.name}
                {s.note ? (
                  <span className="ml-2 text-[0.6875rem] uppercase tracking-[0.12em] text-[rgba(26,26,26,0.38)]">
                    {s.note}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {journalEntries && journalEntries.length > 0 ? (
        <JournalPreviewList entries={journalEntries} slug={slug} />
      ) : null}

      {(data.practice_address || data.practice_hours || data.practice_email) && (
        <section className="yd-carree-profile__section" aria-labelledby="carree-practice">
          <p className="yd-carree-profile__section-label">IV · Praxis</p>
          <h2 id="carree-practice" className="yd-carree-profile__section-title">
            {data.practice_name ? (
              <>
                {data.practice_name.split(" ")[0]}{" "}
                <em>{data.practice_name.split(" ").slice(1).join(" ") || "."}</em>
              </>
            ) : (
              <>
                Ihre <em>Praxis</em>.
              </>
            )}
          </h2>
          <div className="yd-carree-profile__body space-y-4">
            {data.practice_address ? (
              <p className="whitespace-pre-line">{data.practice_address}</p>
            ) : null}
            {data.practice_hours ? (
              <p className="whitespace-pre-line text-[rgba(26,26,26,0.62)]">{data.practice_hours}</p>
            ) : null}
            {data.practice_email ? (
              <p>
                <span className="mr-3 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[#9a7b4f]">
                  E-Mail
                </span>
                <a href={`mailto:${data.practice_email}`} className="underline-offset-2 hover:underline">
                  {data.practice_email}
                </a>
              </p>
            ) : null}
          </div>
        </section>
      )}

      {!previewMode ? (
        <section className="yd-carree-profile__upload-cta">
          <h2 className="yd-carree-profile__upload-title">
            Unterlagen <em>einreichen</em>.
          </h2>
          <p className="mx-auto mb-8 max-w-md text-[15px] leading-relaxed text-[rgba(26,26,26,0.55)]">
            Senden Sie Fotos und Unterlagen diskret und verschlüsselt direkt an die Praxis.
          </p>
          <Link href={`/doc/${slug}/upload`} className="yd-carree-hero__cta inline-flex">
            Jetzt einsenden
          </Link>
          <p className="mt-8 text-[0.625rem] uppercase tracking-[0.18em] text-[rgba(26,26,26,0.35)]">
            Ende-zu-Ende verschlüsselt · DSGVO-konform
          </p>
        </section>
      ) : null}

      <footer className="yd-carree-profile__footer">
        <span>© {new Date().getFullYear()} {data.practice_name || workspaceName}</span>
        <span>
          Via <strong className="font-medium text-[rgba(26,26,26,0.45)]">Your Dentist</strong>
        </span>
      </footer>
    </div>
  );
}
