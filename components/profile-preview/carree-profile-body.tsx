import { SpecializationIcon } from "@/components/profile-preview/specialization-icon";
import { specializationPickerLabel } from "@/lib/profile/specialization-picker-data";
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
        <section
          className="yd-carree-profile__approach-panel"
          aria-label="Persönliche Worte"
        >
          <p className="yd-carree-profile__section-label">Persönliche Worte</p>
          <p className="yd-carree-profile__approach-text">{personalApproach}</p>
        </section>
      ) : null}

      {careerPath.length > 0 ? (
        <section
          className="yd-carree-profile__career-panel"
          aria-label="Ausbildung und Werdegang"
        >
          <p className="yd-carree-profile__section-label">Ausbildung &amp; Werdegang</p>
          <ul className="yd-carree-profile__career-list">
            {careerPath.map((line) => (
              <li key={line} className="yd-carree-profile__career-item">
                <span className="yd-carree-profile__career-marker" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
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
                      {specializationPickerLabel(id)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {hasCredentials ? (
            <section
              className="yd-carree-profile__dual-col yd-carree-profile__panel yd-carree-profile__panel--credentials"
              aria-label="Auszeichnungen und Zertifikate"
            >
              <p className="yd-carree-profile__section-label">
                Fortbildungen &amp; Zertifikate
              </p>
              <ul className="yd-carree-profile__cred-list">
                {credentials.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
