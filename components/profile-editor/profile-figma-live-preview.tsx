"use client";

import { CarreeEditorialHero } from "@/components/profile-preview/carree-editorial-hero";
import { CarreeProfileBody } from "@/components/profile-preview/carree-profile-body";
import { carreeThemeStyle } from "@/lib/profile/carree-theme";
import type { ProfileEditorData } from "@/lib/types/profile-editor-data";

interface ProfileFigmaLivePreviewProps {
  data: ProfileEditorData;
  workspaceName?: string;
  onPortraitEdit?: () => void;
  portraitEditPending?: boolean;
}

export function ProfileFigmaLivePreview({
  data,
  workspaceName = "Ihre Praxis",
  onPortraitEdit,
  portraitEditPending = false,
}: ProfileFigmaLivePreviewProps) {
  return (
    <div className="yd-carree-editor-preview-frame">
      <div
        className="yd-carree-profile yd-carree-profile--editor-preview"
        style={carreeThemeStyle(data.profile_background_color)}
        role="article"
        aria-label="Öffentliche Profildarstellung"
      >
        <CarreeEditorialHero
          data={data}
          workspaceName={workspaceName}
          appointmentLink={data.appointment_link}
          compact
          onPortraitEdit={onPortraitEdit}
          portraitEditPending={portraitEditPending}
        />
        <CarreeProfileBody data={data} />
      </div>
    </div>
  );
}
