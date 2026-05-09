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
      return firstSentence.length > 56
        ? `${firstSentence.slice(0, 56).trim()}…`
        : firstSentence;
    }
  }
  const name = (patientName || "").trim();
  if (name) return name.length > 56 ? `${name.slice(0, 56).trim()}…` : name;
  return "Neue Einsendung";
}

interface SubmissionListItemFigmaProps {
  id: string;
  patientName: string | null;
  patientNotes: string | null;
  createdAt: string;
  seenAt: string | null;
  isDraft: boolean;
  urgency?: string | null;
  hrefOverride?: string;
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
      className={`block touch-manipulation transition-all duration-150 ease-out ${
        isActive ? "" : "hover:-translate-y-0.5 hover:bg-white/55 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
      }`}
      style={{
        padding: "16px",
        marginBottom: "4px",
        borderRadius: "8px",
        cursor: "pointer",
        background: isActive ? "#EEF6FF" : "transparent",
        borderLeft: isActive ? "3px solid #2B6FE8" : "3px solid transparent",
        opacity: isUnseen ? 1 : 0.66,
      }}
    >
      <p
        className="text-[15px]"
        style={{
          color: isActive ? "#1E3A8A" : "#0F172A",
          fontWeight: 600,
          lineHeight: 1.4,
          marginBottom: "6px",
          letterSpacing: "-0.015em",
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
          letterSpacing: "-0.005em",
        }}
      >
        {patientLabel}
      </p>

      <p className="mb-1 flex flex-wrap gap-1.5 text-[11px] font-semibold">
        {isDraft ? (
          <span
            className="rounded px-2 py-0.5"
            style={{ background: "rgba(254, 243, 199, 0.9)", color: "#92400E" }}
          >
            Entwurf
          </span>
        ) : null}
        {!isDraft && isUnseen ? (
          <span
            className="rounded px-2 py-0.5"
            style={{ background: "#EEF6FF", color: "#1C6FD8" }}
          >
            Neu
          </span>
        ) : null}
        {!isDraft && !isUnseen ? (
          <span className="rounded px-2 py-0.5" style={{ background: "#F1F5F9", color: "#64748B" }}>
            Gelesen
          </span>
        ) : null}
        {urgencyShort ? (
          <span className="rounded px-2 py-0.5" style={{ background: "#F1F5F9", color: "#334155" }}>
            {urgencyShort}
          </span>
        ) : null}
      </p>

      <p className="text-[13px]" style={{ color: "#94A3B8", fontWeight: 400 }}>
        {formatRelativeTime(createdAt)}
      </p>
    </Link>
  );
}
