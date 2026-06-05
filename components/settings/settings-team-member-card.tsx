"use client";

function formatEditorialDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd} . ${mm} . ${yyyy}`;
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

function roleLead(role: "doctor" | "team", pending: boolean): string {
  if (pending) return "Einladung offen";
  return role === "doctor" ? "Leitung · Praxis" : "Team · Praxis";
}

function roleLabel(role: "doctor" | "team", pending: boolean): string {
  if (pending) return "Ausstehend";
  return role === "doctor" ? "Administrator" : "Bearbeiter";
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
      <div className="yd-settings-team-card__main">
        <p className="yd-settings-team-card__date">
          {dateLabel} · {dateValue}
        </p>
        <hr className="yd-settings-team-card__rule" aria-hidden />

        <p className="yd-settings-team-card__lead">{roleLead(role, pending)}</p>
        <h3 className="yd-settings-team-card__name">
          {displayName}
          {isCurrentUser ? <span className="yd-settings-team-card__badge-you">Sie</span> : null}
        </h3>
        <p className="yd-settings-team-card__subtitle">
          {role === "doctor" && !pending ? "Zahnärztliche Leitung" : "Praxisorganisation"} · {workspaceName}
        </p>

        <div className="yd-settings-team-card__meta">
          <div className="yd-settings-team-card__meta-row">
            <span className="yd-settings-team-card__meta-label">Kontakt</span>
            <span
              className={`yd-settings-team-card__meta-value${pending ? " yd-settings-team-card__meta-value--muted" : ""}`}
            >
              {email}
            </span>
          </div>
          <div className="yd-settings-team-card__meta-row">
            <span className="yd-settings-team-card__meta-label">Rolle</span>
            <span className="yd-settings-team-card__meta-value">{roleLabel(role, pending)}</span>
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
      </div>

      <div className="yd-settings-team-card__portrait" aria-hidden>
        <div className="yd-settings-team-card__portrait-frame">
          {pending ? (
            <span className="yd-settings-team-card__portrait-pending">Offen</span>
          ) : (
            <span className="yd-settings-team-card__portrait-initials">{initials}</span>
          )}
        </div>
      </div>
    </article>
  );
}
