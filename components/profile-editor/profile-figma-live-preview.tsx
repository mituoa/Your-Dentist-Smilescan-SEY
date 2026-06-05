"use client";

import { CarreeEditorialHero } from "@/components/profile-preview/carree-editorial-hero";
import { carreeThemeStyle } from "@/lib/profile/carree-theme";
import { expandWorkingStyleVitaForDisplay } from "@/lib/profile/working-style-library";
import { specializationPickerLabel } from "@/lib/profile/specialization-picker-data";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";
import type { ProfileEditorData } from "@/lib/types/profile-editor-data";

interface ProfileFigmaLivePreviewProps {
  data: ProfileEditorData;
  workspaceName?: string;
}

/**
 * Live-Vorschau im Editor — dieselbe Carree-Bühne wie im Patientenbereich.
 */
export function ProfileFigmaLivePreview({
  data,
  workspaceName = "Ihre Praxis",
}: ProfileFigmaLivePreviewProps) {
  const vitaBody = expandWorkingStyleVitaForDisplay(data.vita_markdown ?? null);
  const statements = vitaBody
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 2);
  const specs = data.specializations.slice(0, PROFILE_LIMITS.MAX_VISIBLE_SPECIALIZATIONS);
  const services = data.services_structured.slice(0, PROFILE_LIMITS.MAX_VISIBLE_SERVICES);

  return (
    <div
      className="yd-carree-profile relative w-full"
      style={carreeThemeStyle(data.profile_background_color)}
      role="article"
      aria-label="Öffentliche Profildarstellung"
    >
      <CarreeEditorialHero
        data={data}
        workspaceName={workspaceName}
        appointmentLink={data.appointment_link}
        compact
      />

      {(statements.length > 0 || specs.length > 0 || services.length > 0) && (
        <div className="yd-carree-profile__below-hero">
          {statements.length > 0 ? (
            <section className="yd-carree-profile__below-block" aria-label="Arbeitsweise">
              <p className="yd-carree-profile__section-label">Vita</p>
              <div className="yd-carree-profile__body space-y-4 text-[0.9375rem]">
                {statements.map((text, index) => (
                  <p key={`${index}-${text.slice(0, 24)}`}>{text}</p>
                ))}
              </div>
            </section>
          ) : null}

          {specs.length > 0 ? (
            <section className="yd-carree-profile__below-block" aria-label="Schwerpunkte">
              <p className="yd-carree-profile__section-label">Schwerpunkte</p>
              <ul className="yd-carree-profile__list yd-carree-profile__list--soft text-[0.9375rem]">
                {specs.map((id) => (
                  <li key={id}>{specializationPickerLabel(id)}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {services.length > 0 ? (
            <section className="yd-carree-profile__below-block" aria-label="Leistungen">
              <p className="yd-carree-profile__section-label">Leistungen</p>
              <ul className="yd-carree-profile__list yd-carree-profile__list--soft text-[0.9375rem]">
                {services.map((s) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}

      <p className="mx-auto mt-auto max-w-[28rem] px-5 pb-6 text-center text-[10px] tracking-[0.08em] text-[rgba(26,26,26,0.35)]">
        Live-Vorschau · So sehen Patientinnen und Patienten Ihre Praxis.
      </p>
    </div>
  );
}
