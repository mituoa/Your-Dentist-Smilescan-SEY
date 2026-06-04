"use client";

import { useMemo } from "react";
import { ImageIcon } from "lucide-react";

import { PhotoViewer } from "@/components/inbox/photo-viewer";
import { cn } from "@/lib/utils";

type TrackerPhoto = {
  id: string;
  sort_order: number;
  created_at: string;
  signed_url: string | null;
};

type TrackerPhotoStageProps = {
  submissionId: string;
  photos: TrackerPhoto[];
  patientName: string;
  /** Große Foto-Bühne — Kern der Arbeitsfläche. */
  dominant?: boolean;
};

function dayIndexLabel(index: number): string {
  return `Tag ${index + 1}`;
}

function scrollToPhotoRequest() {
  const el = document.getElementById("tracker-v10-primary-action");
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
  if (el instanceof HTMLButtonElement) {
    window.setTimeout(() => el.focus(), 280);
  }
}

export function TrackerPhotoStage({
  submissionId,
  photos,
  patientName,
  dominant = false,
}: TrackerPhotoStageProps) {
  const sorted = useMemo(
    () =>
      [...photos].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [photos]
  );

  const dayGroups = useMemo(() => {
    const groups: { key: string; photos: TrackerPhoto[] }[] = [];
    for (const photo of sorted) {
      const key = photo.created_at.slice(0, 10);
      const last = groups[groups.length - 1];
      if (last?.key === key) {
        last.photos.push(photo);
      } else {
        groups.push({ key, photos: [photo] });
      }
    }
    return groups;
  }, [sorted]);

  const stageClass = cn(
    "yd-tracker-v4-photo-stage",
    "yd-tracker-v11-photo-stage",
    dominant && "yd-tracker-v4-photo-stage--dominant yd-tracker-v11-photo-stage--dominant"
  );
  const title = "Klinische Bilder";

  if (sorted.length === 0) {
    return (
      <section className={stageClass} aria-label="Klinische Bilder">
        <header className="yd-tracker-v4-photo-stage__head">
          <h3 className="yd-tracker-workspace-section__title">{title}</h3>
        </header>
        <div className="yd-tracker-v4-photo-stage__empty yd-tracker-v11-photo-empty">
          <ImageIcon className="h-9 w-9 text-[#94A3B8]/40" strokeWidth={1.25} aria-hidden />
          <p className="yd-tracker-v11-photo-empty__title">
            Noch keine klinischen Bilder vorhanden.
          </p>
          <p className="yd-tracker-v11-photo-empty__hint">
            Nach Eingang erscheinen die Aufnahmen hier zur klinischen Beurteilung.
          </p>
          <button
            type="button"
            className="yd-tracker-v11-photo-empty__cta"
            onClick={scrollToPhotoRequest}
          >
            Bild anfordern
          </button>
        </div>
      </section>
    );
  }

  const photoMeta =
    sorted.length === 1
      ? "1 Bild"
      : `${sorted.length} Bilder · ${dayGroups.length} ${dayGroups.length === 1 ? "Tag" : "Tage"}`;

  return (
    <section className={stageClass} aria-label="Klinische Bilder">
      <header className="yd-tracker-v4-photo-stage__head">
        <h3 className="yd-tracker-workspace-section__title">{title}</h3>
        <p className="yd-tracker-v4-photo-stage__meta">{photoMeta}</p>
      </header>
      <div className="yd-tracker-v4-photo-stage__viewer yd-tracker-v11-photo-stage__viewer">
        <PhotoViewer
          submissionId={submissionId}
          className="yd-tracker-v11-photo-viewer"
          photos={sorted.map(({ id, sort_order, signed_url }) => ({
            id,
            sort_order,
            signed_url,
          }))}
          patientName={patientName}
        />
      </div>

      {dayGroups.length > 0 ? (
        <div
          className="yd-tracker-v4-photo-stage__timeline yd-tracker-v11-photo-timeline"
          role="list"
          aria-label="Fotoverlauf nach Tagen"
        >
          {dayGroups.map((group, groupIndex) => (
            <div key={group.key} className="yd-tracker-v4-photo-day" role="listitem">
              <p className="yd-tracker-v4-photo-day__label">{dayIndexLabel(groupIndex)}</p>
              <div className="yd-tracker-v4-photo-day__thumbs">
                {group.photos.map((photo) => (
                  <div key={photo.id} className="yd-tracker-v4-photo-thumb">
                    {photo.signed_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.signed_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="m-auto h-5 w-5 text-[#94A3B8]/50" aria-hidden />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
