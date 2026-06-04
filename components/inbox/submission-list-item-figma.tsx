"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";

function formatRelativeTime(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "Vor wenigen Sekunden";
  if (diffMin < 60) return `Vor ${diffMin} Minuten`;
  if (diffHours < 24) return `Vor ${diffHours} Stunden`;
  if (diffDays === 1) return "Gestern";
  if (diffDays < 7) return `Vor ${diffDays} Tagen`;
  return then.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

interface SubmissionListItemFigmaProps {
  id: string;
  patientName: string | null;
  patientNotes: string | null;
  createdAt: string;
  /** Optional festes Datums-Label (z. B. UI-Vorschau ohne tagesabhängige Relativzeit). */
  createdAtDisplay?: string;
  seenAt: string | null;
  isDraft: boolean;
  urgency?: string | null;
  /** Ziel-URL der Zeile; für öffentliche Vorschau setzen, damit keine Links auf `/inbox/[id]` entstehen. */
  hrefOverride?: string;
  activeOverride?: boolean;
  /**
   * `preview`: keine Neu/Gelesen-/Dringlichkeits-Badges — ersetzt durch sachliche Beispiel-Kennzeichnung
   * (keine Vortäuschung von Posteingangs- oder Triage-Status).
   */
  listPresentation?: "default" | "preview";
}

export function SubmissionListItemFigma({
  id,
  patientName,
  patientNotes,
  createdAt,
  createdAtDisplay,
  seenAt,
  isDraft,
  urgency,
  hrefOverride,
  activeOverride,
  listPresentation = "default",
}: SubmissionListItemFigmaProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActive =
    typeof activeOverride === "boolean" ? activeOverride : pathname === `/inbox/${id}`;
  const q = searchParams.get("q")?.trim();
  const href =
    hrefOverride ??
    (q ? `/inbox/${id}?q=${encodeURIComponent(q)}` : `/inbox/${id}`);
  const isUnseen = !seenAt;
  const isPreviewList = listPresentation === "preview";

  const issueBase = deriveSubmissionIssueShortLine(patientNotes, patientName, {
    maxLen: 56,
    emptyLabel: "Ohne Kurztext",
  });
  const issue = isDraft ? `Entwurf: ${issueBase}` : issueBase;
  const patientLabel = patientName?.trim() || "Unbekannter Patient";

  const urgencyShort =
    urgency === "today"
      ? "Zeitnah"
      : urgency === "this_week"
        ? "Diese Woche"
        : urgency === "not_urgent"
          ? "Routine"
          : null;

  const timeLabel = createdAtDisplay?.trim()
    ? createdAtDisplay.trim()
    : formatRelativeTime(createdAt);

  const statusLine = (() => {
    if (isPreviewList) return null;
    const parts: string[] = [];
    if (isDraft) parts.push("Entwurf");
    else {
      parts.push(isUnseen ? "Neu" : "Gelesen");
      if (urgencyShort) parts.push(urgencyShort);
    }
    parts.push(timeLabel);
    return parts.join(" · ");
  })();

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`yd-spatial-surface yd-inbox-row-ambient group block min-w-0 max-w-full touch-manipulation break-words mb-1.5 md:mb-1 ${
        isActive
          ? ""
          : isPreviewList
            ? "hover:bg-white/50"
            : "hover:bg-white/45"
      }`}
      style={{
        padding: "14px 14px",
        borderRadius: "8px",
        cursor: "pointer",
        background: isActive ? "#EEF6FF" : "transparent",
        borderLeft: isActive ? "3px solid #0C1929" : "3px solid transparent",
      }}
    >
      <p
        className="break-words text-[15px]"
        style={{
          color: isActive ? "#1E3A8A" : "#0F172A",
          fontWeight: 600,
          lineHeight: 1.35,
          marginBottom: "4px",
          letterSpacing: "-0.015em",
        }}
      >
        {issue}
      </p>

      <p
        className="break-words text-[14px]"
        style={{
          color: "#64748B",
          fontWeight: 500,
          marginBottom: "2px",
          letterSpacing: "-0.005em",
        }}
      >
        {patientLabel}
      </p>

      {isPreviewList ? (
        <p className="mb-1 flex flex-wrap gap-1.5 text-[11px] font-semibold">
          {isDraft ? (
            <span
              className="rounded px-2 py-0.5"
              style={{ background: "rgba(254, 243, 199, 0.9)", color: "#92400E" }}
            >
              Entwurf
            </span>
          ) : null}
          {!isDraft ? (
            <span className="rounded px-2 py-0.5" style={{ background: "#F1F5F9", color: "#64748B" }}>
              Beispiel-Eintrag
            </span>
          ) : null}
        </p>
      ) : null}

      <p className="text-[13px]" style={{ color: "#94A3B8", fontWeight: 400, lineHeight: 1.45 }}>
        {isPreviewList ? timeLabel : statusLine}
      </p>

      {!isPreviewList ? (
        <div className="yd-ambient-preview mt-2 space-y-1 border-t border-[rgba(180,198,218,0.3)] pt-2 text-[11px] leading-snug text-[#5E7389]">
          {urgencyShort ? (
            <p>
              <span className="font-medium text-[#3D5266]">Dringlichkeit: </span>
              {urgencyShort}
            </p>
          ) : null}
          <p>
            <span className="font-medium text-[#3D5266]">Status: </span>
            {isDraft ? "Entwurf" : isUnseen ? "Ungelesen — Aufmerksamkeit" : "Gelesen"}
          </p>
          <p>
            <span className="font-medium text-[#3D5266]">Eingang: </span>
            {timeLabel}
          </p>
        </div>
      ) : null}
    </Link>
  );
}
