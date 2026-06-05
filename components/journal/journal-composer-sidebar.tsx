"use client";

import {
  CLINICAL_AREAS,
  inferClinicalArea,
  type ClinicalAreaId,
} from "@/lib/journal/clinical-areas";
import {
  CONTENT_TYPE_LABELS,
  inferContentType,
  type JournalContentType,
} from "@/lib/journal/content-categories";
import { formatReadingTime } from "@/lib/journal/workspace-display";
import type { JournalEntry } from "@/lib/types/journal-entry";

interface JournalComposerSidebarProps {
  article: JournalEntry;
  clinicalArea: ClinicalAreaId | null;
  contentType: JournalContentType;
  readingTimeMinutes: number | null;
  canPublish: boolean;
  isPending: boolean;
  status: "draft" | "published";
  onClinicalAreaChange: (area: ClinicalAreaId) => void;
  onContentTypeChange: (type: JournalContentType) => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

const CONTENT_TYPES = Object.keys(CONTENT_TYPE_LABELS) as JournalContentType[];

export function JournalComposerSidebar({
  article,
  clinicalArea,
  contentType,
  readingTimeMinutes,
  canPublish,
  isPending,
  status,
  onClinicalAreaChange,
  onContentTypeChange,
  onPublish,
  onUnpublish,
}: JournalComposerSidebarProps) {
  const resolvedArea = clinicalArea ?? inferClinicalArea(article);
  const resolvedType = contentType ?? inferContentType(article);

  return (
    <aside className="yd-journal-composer-v6__aside">
      <div>
        <label className="yd-journal-composer-v6__field-label" htmlFor="journal-clinical-area">
          Themenbereich
        </label>
        <select
          id="journal-clinical-area"
          className="yd-journal-composer-v6__select"
          value={resolvedArea ?? ""}
          onChange={(e) => onClinicalAreaChange(e.target.value as ClinicalAreaId)}
        >
          <option value="" disabled>
            Bereich wählen
          </option>
          {CLINICAL_AREAS.map((area) => (
            <option key={area.id} value={area.id}>
              {area.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="yd-journal-composer-v6__field-label" htmlFor="journal-content-type">
          Artikeltyp
        </label>
        <select
          id="journal-content-type"
          className="yd-journal-composer-v6__select"
          value={resolvedType}
          onChange={(e) => onContentTypeChange(e.target.value as JournalContentType)}
        >
          {CONTENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {CONTENT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="yd-journal-composer-v6__field-label">Status</p>
        <p className="yd-journal-composer-v6__status">
          {status === "published" ? "Veröffentlicht" : "Entwurf"}
        </p>
      </div>

      <div>
        <p className="yd-journal-composer-v6__field-label">Lesezeit</p>
        <p className="yd-journal-composer-v6__reading">
          {formatReadingTime(readingTimeMinutes)}
        </p>
      </div>

      {status === "published" ? (
        <button
          type="button"
          onClick={onUnpublish}
          disabled={isPending}
          className="yd-journal-composer-v6__publish yd-journal-composer-v6__publish--ghost"
        >
          Zurück in Entwurf
        </button>
      ) : (
        <button
          type="button"
          onClick={onPublish}
          disabled={isPending || !canPublish}
          className="yd-journal-composer-v6__publish"
          title={
            !canPublish
              ? "Titel, Inhalt und Themenbereich erforderlich"
              : "Für Patienten veröffentlichen"
          }
        >
          Veröffentlichen
        </button>
      )}
    </aside>
  );
}
