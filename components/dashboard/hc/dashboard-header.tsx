import Link from "next/link";
import { Bell, Search, Sparkles } from "lucide-react";

type DashboardHeaderProps = {
  greeting: string;
  displayName: string;
  pendingApprovals: number | null;
  avatarUrl?: string | null;
  profileDisplayName?: string | null;
  workspaceName: string;
  email: string;
  inboxCount?: number;
};

function priorityLine(pending: number | null): string {
  if (pending === null) return "Übersicht wird geladen …";
  if (pending === 0) return "Keine vorbereiteten Antworten warten auf Ihre Prüfung.";
  if (pending === 1) return "1 vorbereitete Antwort wartet auf Ihre Prüfung.";
  return `${pending} vorbereitete Antworten warten auf Ihre Prüfung.`;
}

function formatPracticeDateLine(date: Date): string {
  const dayMonth = date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
  });
  return `Heute, ${dayMonth}`;
}

export function DashboardHeader({
  greeting,
  displayName,
  pendingApprovals,
  avatarUrl,
  profileDisplayName,
  workspaceName,
  email,
  inboxCount,
}: DashboardHeaderProps) {
  const fallbackBase = (profileDisplayName || workspaceName || email).trim();
  const initials = fallbackBase
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

  const practiceDateLine = formatPracticeDateLine(new Date());
  const hasPending = (pendingApprovals ?? 0) > 0;

  return (
    <header className="yd-dash-header-premium w-full min-w-0 max-w-full">
      <div className="yd-dash-header-premium__grid">
        <div className="yd-dash-header-premium__identity min-w-0">
          <h1 className="yd-dash-header-premium__title">
            {greeting}, {displayName}
          </h1>
          <p
            className="yd-dash-header-premium__priority"
            data-pending={hasPending ? "true" : "false"}
          >
            {priorityLine(pendingApprovals)}
          </p>
          <p className="yd-dash-header-premium__meta">
            <span className="yd-dash-header-premium__meta-dot" aria-hidden />
            <span className="yd-dash-header-premium__meta-practice">Praxis aktiv</span>
            <span className="yd-dash-header-premium__meta-sep" aria-hidden>
              {" "}
              ·{" "}
            </span>
            <span className="yd-dash-header-premium__meta-date">{practiceDateLine}</span>
          </p>
        </div>

        <div className="yd-dash-header-premium__toolbar min-w-0">
          <form action="/inbox" method="get" className="yd-dash-header-premium__search">
            <Search
              className="yd-dash-header-premium__search-icon pointer-events-none absolute top-1/2 -translate-y-1/2"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              type="search"
              name="q"
              placeholder="Patient oder Fall suchen …"
              className="yd-dash-header-premium__search-input"
            />
          </form>

          <div className="yd-dash-header-premium__actions">
            <Link
              href="/inbox"
              className="yd-dash-header-premium__action"
              aria-label={
                inboxCount && inboxCount > 0
                  ? `Benachrichtigungen, ${inboxCount} neu`
                  : "Benachrichtigungen"
              }
            >
              <Bell strokeWidth={1.65} />
              {inboxCount && inboxCount > 0 ? (
                <span className="yd-dash-header-premium__badge" aria-hidden />
              ) : null}
            </Link>
            <Link
              href="/relay"
              className="yd-dash-header-premium__action"
              aria-label="Praxis-Assistenz"
            >
              <Sparkles strokeWidth={1.65} />
            </Link>
            <div className="yd-dash-header-premium__avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="yd-dash-header-premium__avatar-fallback">{initials}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
