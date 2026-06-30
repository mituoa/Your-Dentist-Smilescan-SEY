"use client";

function formatEditorialDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("de-DE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] || email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

export function initialsFromEmail(email: string): string {
  const parts = displayNameFromEmail(email).split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
  }
  const local = email.split("@")[0] || "?";
  return local.slice(0, 2).toUpperCase();
}

function roleLabel(role: "doctor" | "team", pending: boolean): string {
  if (pending) return "Einladung offen";
  return role === "doctor" ? "Administrator" : "Team";
}

type SettingsTeamMemberCardProps = {
  email: string;
  role: "doctor" | "team";
  joinedAt?: string | null;
  workspaceName: string;
  pending?: boolean;
  isCurrentUser?: boolean;
  busy?: boolean;
  onRemove?: () => void;
  onRevoke?: () => void;
};

export function SettingsTeamMemberCard({
  email,
  role,
  joinedAt = null,
  workspaceName,
  pending = false,
  isCurrentUser = false,
  busy = false,
  onRemove,
  onRevoke,
}: SettingsTeamMemberCardProps) {
  const displayName = displayNameFromEmail(email);
  const initials = initialsFromEmail(email);
  const dateLabel = pending ? "Eingeladen" : "Im Team seit";
  const dateValue = formatEditorialDate(joinedAt);

  return (
    <article
      className={`yd-settings-team-card${pending ? " yd-settings-team-card--pending" : ""}`}
      aria-label={pending ? `Ausstehende Einladung ${displayName}` : `Teammitglied ${displayName}`}
    >
      <div className="yd-settings-team-card__row">
        <span className="yd-settings-team-card__avatar" aria-hidden>
          {initials}
        </span>
        <div className="yd-settings-team-card__body">
          <div className="yd-settings-team-card__head">
            <h3 className="yd-settings-team-card__name">
              {displayName}
              {isCurrentUser ? (
                <span className="yd-settings-team-card__badge-you">Sie</span>
              ) : null}
            </h3>
            <span
              className={`yd-settings-team-card__role${pending ? " yd-settings-team-card__role--pending" : ""}`}
            >
              {roleLabel(role, pending)}
            </span>
          </div>
          <p className="yd-settings-team-card__email">{email}</p>
          <p className="yd-settings-team-card__meta">
            {dateLabel} {dateValue} · {workspaceName}
          </p>
        </div>
      </div>

      {onRevoke || onRemove ? (
        <div className="yd-settings-team-card__actions">
          {onRevoke ? (
            <button
              type="button"
              className="yd-settings-team-card__action"
              disabled={busy}
              onClick={onRevoke}
            >
              Einladung widerrufen
            </button>
          ) : null}
          {onRemove ? (
            <button
              type="button"
              className="yd-settings-team-card__action"
              disabled={busy}
              onClick={onRemove}
            >
              Aus Team entfernen
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
