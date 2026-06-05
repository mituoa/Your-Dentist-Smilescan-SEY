import { Check } from "lucide-react";

import { SpecializationIcon } from "@/components/profile-preview/specialization-icon";
import { parseCareerTimelineLine } from "@/lib/profile/career-timeline-display";
import { patientFacingSpecializationLabel } from "@/lib/profile/patient-facing-labels";
import { expandWorkingStyleVitaForDisplay } from "@/lib/profile/working-style-library";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";
import type { ProfileEditorData } from "@/lib/types/profile-editor-data";

type CarreeProfileBodyProps = {
  data: ProfileEditorData;
};

export function CarreeProfileBody({ data }: CarreeProfileBodyProps) {
  const vitaBody = expandWorkingStyleVitaForDisplay(data.vita_markdown ?? null);
  const vitaParagraphs = vitaBody
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const personalApproach = (data.profile_personal_approach ?? "").trim();
  const careerPath = (data.profile_career_path ?? []).filter((line) => line.trim()).slice(0, 6);
  const specs = data.specializations.slice(0, PROFILE_LIMITS.MAX_VISIBLE_SPECIALIZATIONS);
  const credentials = (data.profile_credentials ?? []).filter((c) => c.trim()).slice(0, 8);

  const hasSpecs = specs.length > 0;
  const hasCredentials = credentials.length > 0;
  const hasCompetenceGrid = hasSpecs || hasCredentials;

  const hasContent =
    vitaParagraphs.length > 0 ||
    personalApproach.length > 0 ||
    careerPath.length > 0 ||
    hasCompetenceGrid;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="yd-carree-profile__body-wrap">
      {vitaParagraphs.length > 0 ? (
        <section className="yd-carree-profile__vita-panel" aria-label="Vita">
          <span className="yd-carree-profile__vita-quote" aria-hidden>
            „
          </span>
          <div className="yd-carree-profile__vita-content">
            <p className="yd-carree-profile__section-label yd-carree-profile__vita-label">Vita</p>
            <div className="yd-carree-profile__vita-text-block">
              {vitaParagraphs.map((paragraph, index) => (
                <p key={index} className="yd-carree-profile__vita-text">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {personalApproach ? (
        <section className="yd-carree-profile__approach-panel" aria-label="Was mir wichtig ist">
          <p className="yd-carree-profile__section-label">Was mir wichtig ist</p>
          <p className="yd-carree-profile__approach-text">{personalApproach}</p>
        </section>
      ) : null}

      {careerPath.length > 0 ? (
        <section className="yd-carree-profile__career-panel" aria-label="Ausbildung und Erfahrung">
          <p className="yd-carree-profile__section-label">Ausbildung &amp; Erfahrung</p>
          <ol className="yd-carree-profile__career-timeline">
            {careerPath.map((line) => {
              const entry = parseCareerTimelineLine(line);
              return (
                <li key={line} className="yd-carree-profile__career-timeline-item">
                  {entry.period ? (
                    <span className="yd-carree-profile__career-period">{entry.period}</span>
                  ) : (
                    <span className="yd-carree-profile__career-period yd-carree-profile__career-period--open" aria-hidden />
                  )}
                  <span className="yd-carree-profile__career-title">{entry.title}</span>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {hasCompetenceGrid ? (
        <div
          className={`yd-carree-profile__dual-grid${hasSpecs && hasCredentials ? "" : " yd-carree-profile__dual-grid--single"}`}
        >
          {hasSpecs ? (
            <section
              className="yd-carree-profile__dual-col yd-carree-profile__panel"
              aria-label="Schwerpunkte"
            >
              <p className="yd-carree-profile__section-label">Schwerpunkte</p>
              <ul className="yd-carree-profile__spec-list">
                {specs.map((id) => (
                  <li key={id} className="yd-carree-profile__spec-item">
                    <span className="yd-carree-profile__spec-icon">
                      <SpecializationIcon id={id} className="h-[15px] w-[15px]" />
                    </span>
                    <span className="yd-carree-profile__spec-label">
                      {patientFacingSpecializationLabel(id)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {hasCredentials ? (
            <section
              className="yd-carree-profile__dual-col yd-carree-profile__panel yd-carree-profile__panel--credentials"
              aria-label="Fortbildungen und Zertifikate"
            >
              <p className="yd-carree-profile__section-label">Fortbildungen &amp; Zertifikate</p>
              <ul className="yd-carree-profile__cred-badges">
                {credentials.map((line) => (
                  <li key={line} className="yd-carree-profile__cred-badge">
                    <Check className="yd-carree-profile__cred-badge-icon" strokeWidth={2.25} aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
