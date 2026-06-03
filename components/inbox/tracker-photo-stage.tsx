"use client";

import { useMemo } from "react";
import { ImageIcon } from "lucide-react";

import { PhotoViewer } from "@/components/inbox/photo-viewer";

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
};

function dayIndexLabel(index: number): string {
  return `Tag ${index + 1}`;
}

export function TrackerPhotoStage({
  submissionId,
  photos,
  patientName,
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

  if (sorted.length === 0) {
    return (
      <section className="yd-tracker-v4-photo-stage" aria-label="Foto-Dokumentation">
        <h3 className="yd-tracker-v4-section-title">Foto-Dokumentation</h3>
        <div className="yd-tracker-v4-photo-stage__empty">
          <ImageIcon className="h-10 w-10 text-[#94A3B8]/50" strokeWidth={1.25} aria-hidden />
          <p className="mt-2 text-[14px] font-medium text-[#64748B]">
            Noch keine Fotos — Heilungsverlauf erscheint hier.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="yd-tracker-v4-photo-stage" aria-label="Foto-Dokumentation">
      <h3 className="yd-tracker-v4-section-title">Foto-Dokumentation</h3>
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
