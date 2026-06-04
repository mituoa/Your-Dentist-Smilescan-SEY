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
  showTrailHint?: boolean;
  /** Nur dezente Meta-Zeile, kein Sektionstitel (Fallakte). */
  quietHeader?: boolean;
};

function dayIndexLabel(index: number): string {
  return `Tag ${index + 1}`;
}

export function TrackerPhotoStage({
  submissionId,
  photos,
  patientName,
  dominant = false,
  showTrailHint = false,
  quietHeader = false,
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
    dominant && "yd-tracker-v4-photo-stage--dominant"
  );
  const title = "Klinische Dokumentation";

  if (sorted.length === 0) {
    return (
      <section className={cn(stageClass, "yd-tracker-v4-photo-stage--awaiting")} aria-label={title}>
        <header
          className={cn(
            "yd-tracker-v4-photo-stage__head yd-tracker-v4-photo-stage__head--dominant",
            quietHeader && "yd-tracker-v4-photo-stage__head--quiet"
          )}
        >
          {quietHeader ? (
            <p className="yd-tracker-v4-photo-stage__meta yd-tracker-v4-photo-stage__meta--solo">
              Noch keine Aufnahmen
            </p>
          ) : (
            <div>
              <h3 className="yd-tracker-ia-section-title yd-tracker-ia-section-title--hero">{title}</h3>
              <p className="yd-tracker-v4-photo-stage__meta">Noch keine Aufnahmen</p>
            </div>
          )}
        </header>
        <div className="yd-tracker-v4-photo-stage__empty yd-tracker-v4-photo-stage__empty--clinical">
          <div className="yd-tracker-v4-photo-stage__empty-canvas" aria-hidden>
            <div className="yd-tracker-v4-photo-stage__empty-frame" />
            <div className="yd-tracker-v4-photo-stage__empty-frame yd-tracker-v4-photo-stage__empty-frame--secondary" />
          </div>
          <div className="yd-tracker-v4-photo-stage__empty-copy">
            <p className="yd-tracker-v4-photo-stage__empty-title">
              Warten auf klinische Dokumentation
            </p>
            <p className="yd-tracker-v4-photo-stage__empty-lead">
              Sobald Bilder eingehen, erscheinen sie hier im Viewer — mit Tagesverlauf und
              Vergleich über mehrere Aufnahmen.
            </p>
            <p className="yd-tracker-v4-photo-stage__empty-hint">
              Nachforderung über den Praxis-Assistenten rechts.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const photoMeta =
    sorted.length === 1
      ? "1 Bild"
      : `${sorted.length} Bilder · ${dayGroups.length} ${dayGroups.length === 1 ? "Tag" : "Tage"}`;

  return (
    <section className={stageClass} aria-label="Foto-Dokumentation">
      <header
        className={cn(
          "yd-tracker-v4-photo-stage__head yd-tracker-v4-photo-stage__head--dominant",
          quietHeader && "yd-tracker-v4-photo-stage__head--quiet"
        )}
      >
        {quietHeader ? (
          <p className="yd-tracker-v4-photo-stage__meta yd-tracker-v4-photo-stage__meta--solo">
            {photoMeta}
            {showTrailHint ? " · Verlauf über mehrere Tage" : ""}
          </p>
        ) : (
          <>
            <div>
              <h3 className="yd-tracker-ia-section-title yd-tracker-ia-section-title--hero">{title}</h3>
              <p className="yd-tracker-v4-photo-stage__meta">{photoMeta}</p>
            </div>
            {showTrailHint ? (
              <p className="yd-tracker-v4-photo-stage__trail-hint">
                Verlauf über mehrere Tage — Tageszeilen zum Vergleich.
              </p>
            ) : null}
          </>
        )}
      </header>
      <div className="yd-tracker-v4-photo-stage__viewer">
        <PhotoViewer
          submissionId={submissionId}
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
          className="yd-tracker-v4-photo-stage__timeline"
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
