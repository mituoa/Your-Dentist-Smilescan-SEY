"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

function deriveIssue(
  patientNotes: string | null,
  patientName: string | null
): string {
  const raw = (patientNotes || "").trim();
  if (raw) {
    const firstSentence = raw.split("\n")[0]?.split(".")[0]?.trim();
    if (firstSentence) {
      return firstSentence.length > 48
        ? `${firstSentence.slice(0, 48).trim()}…`
        : firstSentence;
    }
  }
  const name = (patientName || "").trim();
  if (name) return name.length > 48 ? `${name.slice(0, 48).trim()}…` : name;
  return "Neue Einsendung";
}

function derivePreview(patientNotes: string | null): string {
  const raw = (patientNotes || "").trim().replace(/\s+/g, " ");
  if (!raw) return "";
  const preview = raw.length > 80 ? `${raw.slice(0, 80).trim()}…` : raw;
  return preview;
}

interface SubmissionListItemFigmaProps {
  id: string;
  patientName: string | null;
  patientNotes: string | null;
  createdAt: string;
  seenAt: string | null;
  isDraft: boolean;
  urgency?: string | null;
  /** Optional: z. B. `/inbox-preview?id=…` für UI-Demos ohne Supabase */
  hrefOverride?: string;
  /** Muss gesetzt sein, wenn hrefOverride gesetzt ist */
  activeOverride?: boolean;
}

export function SubmissionListItemFigma({
  id,
  patientName,
  patientNotes,
  createdAt,
  seenAt,
  isDraft,
  urgency,
  hrefOverride,
  activeOverride,
}: SubmissionListItemFigmaProps) {
  const pathname = usePathname();
  const isActive =
    typeof activeOverride === "boolean" ? activeOverride : pathname === `/inbox/${id}`;
  const href = hrefOverride ?? `/inbox/${id}`;
  const isUnseen = !seenAt;

  const issueBase = deriveIssue(patientNotes, patientName);
  const issue = isDraft ? `Entwurf: ${issueBase}` : issueBase;
  const preview = derivePreview(patientNotes);
  const patientLabel = patientName?.trim() || "Unbekannter Patient";

  const urgencyShort =
    urgency === "today"
      ? "Dringend"
      : urgency === "this_week"
        ? "Diese Woche"
        : urgency === "not_urgent"
          ? "Routine"
          : null;

  return (
    <Link
      href={href}
      style={{
        padding: "16px 20px",
        marginBottom: "8px",
        borderRadius: "10px",
        cursor: "pointer",
        transition: "all 200ms ease",
        background: isActive ? "#EFF6FF" : "transparent",
        borderLeft: isActive ? "2px solid #2F80ED" : "2px solid transparent",
        opacity: isUnseen ? 1 : 0.72,
      }}
      className="block hover:bg-[#F8FAFC]"
    >
      <p
        className="text-[16px]"
        style={{
          color: "#1E293B",
          fontWeight: 600,
          lineHeight: "1.4",
          marginBottom: "6px",
        }}
      >
        {issue}
      </p>

      <p
        className="text-[14px]"
        style={{
          color: "#64748B",
          fontWeight: 500,
          marginBottom: "4px",
        }}
      >
        {patientLabel}
      </p>

      <p className="mb-1 flex flex-wrap gap-2 text-[11px] font-semibold">
        {isDraft ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">Entwurf</span>
        ) : null}
        {!isDraft && isUnseen ? (
          <span className="rounded-full bg-[#EEF6FF] px-2 py-0.5 text-[#1C6FD8]">Neu</span>
        ) : null}
        {!isDraft && !isUnseen ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">Gelesen</span>
        ) : null}
        {urgencyShort ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">{urgencyShort}</span>
        ) : null}
      </p>

      <p
        className="text-[13px]"
        style={{
          color: "#94A3B8",
          fontWeight: 400,
        }}
      >
        {formatRelativeTime(createdAt)}
        {preview ? ` · ${preview}` : ""}
      </p>
    </Link>
  );
}

