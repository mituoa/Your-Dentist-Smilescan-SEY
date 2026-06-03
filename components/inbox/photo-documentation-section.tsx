"use client";

import { ImageIcon } from "lucide-react";

export type PhotoDocumentationEntry = {
  id: string;
  sort_order: number;
  created_at: string;
  signed_url: string | null;
};

type PhotoDocumentationSectionProps = {
  photos: PhotoDocumentationEntry[];
  patientNotes: string | null;
};

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function formatDayHeading(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Eingang";
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const key = dayKey(iso);
  if (key === todayKey) return "Heute";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === yesterday.toISOString().slice(0, 10)) return "Gestern";
  return d.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function groupPhotosByDay(photos: PhotoDocumentationEntry[]) {
  const sorted = [...photos].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const groups: { dayKey: string; heading: string; items: PhotoDocumentationEntry[] }[] = [];
  for (const photo of sorted) {
    const key = dayKey(photo.created_at);
    let group = groups.find((g) => g.dayKey === key);
    if (!group) {
      group = { dayKey: key, heading: formatDayHeading(photo.created_at), items: [] };
      groups.push(group);
    }
    group.items.push(photo);
  }
  return groups;
}

export function PhotoDocumentationSection({
  photos,
  patientNotes,
}: PhotoDocumentationSectionProps) {
  if (photos.length === 0) {
    return (
      <section
        className="yd-photo-doc yd-photo-doc--premium mt-6 max-w-full overflow-hidden"
        aria-labelledby="photo-doc-heading"
      >
        <h3 id="photo-doc-heading" className="yd-photo-doc__title">
          Fotoverlauf
        </h3>
        <p className="mt-3 text-[14px] text-[#64748B]">Noch keine Fotos zu diesem Fall.</p>
      </section>
    );
  }

  const groups = groupPhotosByDay(photos);
  const multiDay = groups.length > 1;

  return (
    <section
      className="yd-photo-doc yd-photo-doc--premium mt-6 max-w-full overflow-hidden"
      aria-labelledby="photo-doc-heading"
    >
      <h3 id="photo-doc-heading" className="yd-photo-doc__title">
        Fotoverlauf
      </h3>
      {multiDay ? (
        <p className="yd-photo-doc__lead">{groups.length} Tage</p>
      ) : null}

      <ol className="yd-photo-doc__timeline mt-4 space-y-4">
        {groups.map((group) => (
          <li key={group.dayKey} className="yd-photo-doc__day">
            <div className="yd-photo-doc__day-head">
              <span className="yd-photo-doc__day-label">{group.heading}</span>
              <span className="yd-photo-doc__day-meta">
                {group.items.length === 1 ? "1 Foto" : `${group.items.length} Fotos`}
              </span>
            </div>
            <ul className="mt-2 space-y-2">
              {group.items.map((photo) => (
                <li key={photo.id} className="yd-photo-doc__entry">
                  <div className="yd-photo-doc__thumb">
                    {photo.signed_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.signed_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="sr-only">Foto nicht verfügbar</span>
                    )}
                    {!photo.signed_url ? (
                      <ImageIcon className="h-5 w-5 text-[#94A3B8]" aria-hidden />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[#334155]">Nachsorgefoto</p>
                    <p className="text-[12px] text-[#64748B]">
                      {patientNotes?.trim()
                        ? `Patientennotiz: ${patientNotes.trim().slice(0, 120)}${patientNotes.length > 120 ? "…" : ""}`
                        : "Keine Patientennotiz zu diesem Zeitpunkt."}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <p className="mt-4 text-[12px] leading-relaxed text-[#94A3B8]">
        Chronologische Übersicht — ohne automatische Bewertung. Die klinische Einordnung erfolgt
        in der Praxis.
      </p>
    </section>
  );
}
