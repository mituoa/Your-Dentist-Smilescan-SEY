"use client";

import { useMemo } from "react";
import { ImageIcon } from "lucide-react";

const CLINICAL_DAY_LABELS = [1, 3, 7, 14] as const;

type Photo = {
  id: string;
  sort_order: number;
  created_at: string;
  signed_url: string | null;
};

type TrackerV6ClinicalPhotosProps = {
  photos: Photo[];
};

function dayLabel(index: number, dayKey: string, total: number): string {
  const today = new Date().toISOString().slice(0, 10);
  if (dayKey === today && index === total - 1) return "Heute";
  const n = CLINICAL_DAY_LABELS[Math.min(index, CLINICAL_DAY_LABELS.length - 1)];
  return `Tag ${n}`;
}

/**
 * Vertikale klinische Dokumentation — ein großes Bild pro Kontrolltag.
 */
export function TrackerV6ClinicalPhotos({ photos }: TrackerV6ClinicalPhotosProps) {
  const days = useMemo(() => {
    const sorted = [...photos].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const groups: { key: string; label: string; photo: Photo }[] = [];
    for (const photo of sorted) {
      const key = photo.created_at.slice(0, 10);
      const existing = groups.find((g) => g.key === key);
      if (!existing) {
        groups.push({
          key,
          label: "",
          photo,
        });
      }
    }
    groups.forEach((g, i) => {
      g.label = dayLabel(i, g.key, groups.length);
    });
    return groups;
  }, [photos]);

  return (
    <section className="yd-tracker-v7-photos" aria-labelledby="tracker-v6-photos-title">
      <h2 id="tracker-v6-photos-title" className="yd-tracker-v7-section__title">
        Foto-Dokumentation
      </h2>

      {days.length === 0 ? (
        <div className="yd-tracker-v7-photos__empty">
          <ImageIcon className="h-10 w-10 opacity-30" strokeWidth={1.2} aria-hidden />
          <p>Noch keine klinischen Aufnahmen.</p>
        </div>
      ) : (
        <div className="yd-tracker-v7-photos__stack">
          {days.map((day) => (
            <article key={day.key} className="yd-tracker-v7-photos__day">
              <h3 className="yd-tracker-v7-photos__day-label">{day.label}</h3>
              <div className="yd-tracker-v7-photos__stage">
                {day.photo.signed_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={day.photo.signed_url} alt={`${day.label} — klinische Aufnahme`} />
                ) : (
                  <div className="yd-tracker-v7-photos__missing">
                    <ImageIcon className="h-8 w-8 opacity-40" aria-hidden />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
