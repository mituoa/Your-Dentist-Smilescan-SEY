import Link from "next/link";
import { cn } from "@/lib/utils";

interface SubmissionListItemProps {
  id: string;
  patientName: string | null;
  patientEmail: string | null;
  createdAt: string;
  seenAt: string | null;
  photoCount: number;
}

function getInitials(name: string | null, email: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "??";
}

function formatTime(iso: string): string {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min`;
  if (diffHours < 24) return `vor ${diffHours} Std`;
  if (diffDays === 1) return "gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return then.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

export function SubmissionListItem({
  id,
  patientName,
  patientEmail,
  createdAt,
  seenAt,
  photoCount,
}: SubmissionListItemProps) {
  const isUnseen = !seenAt;
  const initials = getInitials(patientName, patientEmail);
  const displayName = patientName?.trim() || patientEmail || "Unbekannt";

  return (
    <Link
      href={`/inbox/${id}`}
      className="flex items-center gap-4 px-6 py-4 border-b border-border hover:bg-surface-sunken/50 transition-colors group"
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          isUnseen
            ? "bg-brand text-white"
            : "bg-surface-sunken text-text-secondary"
        )}
      >
        <span className="text-xs font-medium">{initials}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-sm truncate",
              isUnseen
                ? "font-medium text-text-primary"
                : "text-text-secondary"
            )}
          >
            {displayName}
          </span>
          {isUnseen && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
          )}
        </div>
        <p className="text-xs text-text-tertiary mt-0.5">
          {photoCount} {photoCount === 1 ? "Foto" : "Fotos"}
        </p>
      </div>

      <div className="text-xs text-text-tertiary shrink-0">
        {formatTime(createdAt)}
      </div>
    </Link>
  );
}
