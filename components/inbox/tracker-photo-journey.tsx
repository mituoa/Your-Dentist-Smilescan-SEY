"use client";

import { useMemo, useState } from "react";
import { ImageIcon } from "lucide-react";

import { PhotoViewer } from "@/components/inbox/photo-viewer";
import type { TrackerTimelineEvent } from "@/lib/inbox/build-tracker-workspace";
import { cn } from "@/lib/utils";

type Photo = {
  id: string;
  sort_order: number;
  created_at: string;
  signed_url: string | null;
};

type TrackerPhotoJourneyProps = {
  submissionId: string;
  patientName: string;
  photos: Photo[];
  timelineEvents: TrackerTimelineEvent[];
};

type JourneyDay = {
  key: string;
  label: string;
  milestones: string[];
  photos: Photo[];
};

const CLINICAL_DAY_LABELS = [1, 3, 7, 14] as const;

function dayLabelForIndex(index: number, total: number, dayKey: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (dayKey === today && index === total - 1) return "Heute";
  const n = CLINICAL_DAY_LABELS[Math.min(index, CLINICAL_DAY_LABELS.length - 1)];
  return `Tag ${n}`;
}

export function TrackerPhotoJourney({
  submissionId,
  patientName,
  photos,
  timelineEvents,
}: TrackerPhotoJourneyProps) {
  const sorted = useMemo(
    () =>
      [...photos].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    [photos]
  );

  const days = useMemo(() => {
    const groups: JourneyDay[] = [];
    for (const photo of sorted) {
      const key = photo.created_at.slice(0, 10);
      const last = groups[groups.length - 1];
      if (last?.key === key) {
        last.photos.push(photo);
      } else {
        groups.push({ key, label: "", milestones: [], photos: [photo] });
      }
    }
    groups.forEach((g, i) => {
      g.label = dayLabelForIndex(i, groups.length, g.key);
      const photoEvents = timelineEvents.filter((e) => e.id.startsWith("photo-"));
      const match = photoEvents.find((e) => e.dateLabel && g.photos[0]);
      if (g.photos.length > 0) {
        g.milestones.push(
          g.photos.length === 1 ? "Foto eingegangen" : `${g.photos.length} Fotos eingegangen`
        );
      }
      if (i === groups.length - 1) {
        const prep = timelineEvents.find((e) => e.title.includes("vorbereitet") || e.id === "note");
        if (prep) g.milestones.push(prep.title);
      }
      if (match?.detail && i === 0) g.milestones.push(match.detail);
    });
    return groups;
  }, [sorted, timelineEvents]);

  const [activePhotoId, setActivePhotoId] = useState<string | null>(
    sorted[sorted.length - 1]?.id ?? null
  );

  const activePhoto = sorted.find((p) => p.id === activePhotoId) ?? sorted[sorted.length - 1];

  if (sorted.length === 0) {
    return (
      <section className="yd-tracker-journey" aria-label="Fotoverlauf">
        <header className="yd-tracker-journey__head">
          <h2 className="yd-tracker-v5-section__title">Foto-Dokumentation</h2>
        </header>
        <div className="yd-tracker-journey__empty">
          <ImageIcon className="h-12 w-12 text-[#8BA3B8]/40" strokeWidth={1.1} aria-hidden />
        </div>
      </section>
    );
  }

  return (
    <section className="yd-tracker-journey" aria-label="Fotoverlauf">
        <header className="yd-tracker-journey__head">
          <h2 className="yd-tracker-v5-section__title">Foto-Dokumentation</h2>
        <p className="yd-tracker-journey__meta">
          {sorted.length} {sorted.length === 1 ? "Aufnahme" : "Aufnahmen"}
          {days.length > 1 ? ` · ${days.length} Tage` : ""}
        </p>
      </header>

      <div className="yd-tracker-journey__stage">
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

      <ol className="yd-tracker-journey__rail">
        {days.map((day, dayIndex) => (
          <li key={day.key} className="yd-tracker-journey__day">
            <div className="yd-tracker-journey__day-head">
              <span
                className={cn(
                  "yd-tracker-journey__day-badge",
                  dayIndex === days.length - 1 && "yd-tracker-journey__day-badge--today"
                )}
              >
                {day.label}
              </span>
              <div className="yd-tracker-journey__milestones">
                {day.milestones.map((m) => (
                  <p key={m} className="yd-tracker-journey__milestone">
                    {m}
                  </p>
                ))}
              </div>
            </div>
            <div className="yd-tracker-journey__thumbs">
              {day.photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  className={cn(
                    "yd-tracker-journey__thumb",
                    activePhoto?.id === photo.id && "yd-tracker-journey__thumb--active"
                  )}
                  onClick={() => setActivePhotoId(photo.id)}
                  aria-label={`${day.label} — Foto anzeigen`}
                >
                  {photo.signed_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo.signed_url} alt="" />
                  ) : (
                    <ImageIcon className="m-auto h-5 w-5 opacity-40" aria-hidden />
                  )}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
