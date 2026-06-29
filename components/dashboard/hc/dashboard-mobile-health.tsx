import Link from "next/link";
import { Calendar, ClipboardCheck, UserRound, Users } from "lucide-react";

import { DashboardWeekStrip } from "@/components/dashboard/hc/dashboard-week-strip";
import type {
  DashboardTodayItem,
  PracticeStateDomain,
} from "@/lib/dashboard/dashboard-bento-model";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

type Props = {
  greeting: string;
  displayName: string;
  practiceDomains: PracticeStateDomain[];
  todayItems: DashboardTodayItem[];
  weeklyCounts: number[] | null;
  overviewIncomplete?: boolean;
};

function weekdayLabels(): string[] {
  const today = new Date();
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dow = d.getDay();
    const idx = dow === 0 ? 6 : dow - 1;
    labels.push(DAY_LABELS[idx] ?? "—");
  }
  return labels;
}

function domainCount(domains: PracticeStateDomain[], id: PracticeStateDomain["id"]) {
  return domains.find((d) => d.id === id)?.count ?? 0;
}

function domainHref(domains: PracticeStateDomain[], id: PracticeStateDomain["id"]) {
  return domains.find((d) => d.id === id)?.href ?? "/relay";
}

const TODAY_SUMMARY = [
  {
    id: "freigaben" as const,
    label: "Freigaben",
    mobileLabel: "Freigaben",
    icon: ClipboardCheck,
  },
  {
    id: "patienten" as const,
    label: "Patienten-Rückfragen",
    mobileLabel: "Patienten",
    icon: UserRound,
  },
  {
    id: "team" as const,
    label: "Teamaufgaben",
    mobileLabel: "Team",
    icon: Users,
  },
  {
    id: "routinen" as const,
    label: "Routinen",
    mobileLabel: "Routinen",
    icon: Calendar,
  },
] as const;

function kindLabel(kind: DashboardTodayItem["kind"]) {
  return kind === "routine" ? "Routine" : "Entscheidung";
}

function compactWhen(when: string): string {
  const trimmed = when.trim();
  if (trimmed.length <= 18) return trimmed;
  return `${trimmed.slice(0, 16).trimEnd()}…`;
}

function MiniSparkline({ counts, className }: { counts: number[]; className?: string }) {
  const max = Math.max(...counts, 1);
  const labels = weekdayLabels();
  return (
    <div className={cn("yd-dash-m__spark", className)} role="img" aria-hidden>
      {counts.map((count, i) => {
        const h = count > 0 ? Math.max(14, Math.round((count / max) * 100)) : 8;
        const isToday = i === counts.length - 1;
        return (
          <div key={i} className="yd-dash-m__spark-col">
            <div className="yd-dash-m__spark-track">
              <span
                className={cn("yd-dash-m__spark-bar", isToday && "yd-dash-m__spark-bar--today")}
                style={{ height: `${h}%` }}
              />
            </div>
            <span className="yd-dash-m__spark-day">{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardMobileHealth({
  greeting,
  displayName,
  practiceDomains,
  todayItems,
  weeklyCounts,
  overviewIncomplete,
}: Props) {
  const practiceMax = Math.max(...practiceDomains.map((d) => d.count), 1);
  const casesWeekTotal = (weeklyCounts ?? []).reduce((a, b) => a + b, 0);
  const freigabenCount = domainCount(practiceDomains, "freigaben");
  const journalCount = domainCount(practiceDomains, "journal");
  const activityMax = Math.max(casesWeekTotal, freigabenCount, journalCount, 1);

  return (
    <div className="yd-dash-m md:hidden">
      <header className="yd-dash-m__header">
        <p className="yd-dash-m__greet">{greeting}</p>
        <h1 className="yd-dash-m__name">{displayName}</h1>
      </header>

      {overviewIncomplete ? (
        <p className="yd-dash-m__notice" role="status">
          Einige Bereiche konnten nicht geladen werden — bitte Seite erneut laden.
        </p>
      ) : null}

      <section className="yd-dash-m__card yd-dash-m__card--today" aria-label="Heute">
        <h2 className="yd-dash-m__card-title">Heute</h2>
        <ul className="yd-dash-m__summary">
          {TODAY_SUMMARY.map((row) => {
            const count = domainCount(practiceDomains, row.id);
            const Icon = row.icon;
            return (
              <li key={row.id}>
                <Link href={domainHref(practiceDomains, row.id)} className="yd-dash-m__summary-row">
                  <span className="yd-dash-m__summary-icon" aria-hidden>
                    <Icon strokeWidth={1.85} />
                  </span>
                  <span className="yd-dash-m__summary-copy">
                    <span className="yd-dash-m__summary-count">{count}</span>
                    <span className="yd-dash-m__summary-label">{row.mobileLabel}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="yd-dash-m__card" aria-label="Praxiszustand">
        <header className="yd-dash-m__card-head">
          <div>
            <h2 className="yd-dash-m__card-title">Praxiszustand</h2>
          </div>
        </header>
        <div className="yd-dash-m__state-inset">
          <div className="yd-dash-m__state-chart" role="img" aria-label="Verteilung offener Vorgänge">
            <div className="yd-dash-m__state-grid" aria-hidden />
            <div className="yd-dash-m__state-plot">
              {practiceDomains.map((domain) => {
                const height =
                  domain.count === 0 ? 12 : Math.max(18, Math.round((domain.count / practiceMax) * 100));
                return (
                  <Link key={domain.id} href={domain.href} className="yd-dash-m__state-col">
                    <span className="yd-dash-m__state-bar-wrap">
                      <span className="yd-dash-m__state-bar" style={{ height: `${height}%` }} />
                    </span>
                    <span className="yd-dash-m__state-count">{domain.count}</span>
                    <span className="yd-dash-m__state-label">{domain.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="yd-dash-m__card yd-dash-m__card--schedule" aria-label="Heute relevant">
        <header className="yd-dash-m__card-head yd-dash-m__card-head--schedule">
          <h2 className="yd-dash-m__card-title">Heute relevant</h2>
          <Link href="/relay" className="yd-dash-m__card-link yd-dash-m__card-link--inline">
            Relay
          </Link>
        </header>

        <DashboardWeekStrip />

        {todayItems.length === 0 ? (
          <p className="yd-dash-m__empty">Keine Termine oder Entscheidungen.</p>
        ) : (
          <ul className="yd-dash-m__relevant">
            {todayItems.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="yd-dash-m__relevant-item">
                  <span
                    className={cn(
                      "yd-dash-m__relevant-dot",
                      item.kind === "routine" && "yd-dash-m__relevant-dot--routine"
                    )}
                    aria-hidden
                  />
                  <span className="yd-dash-m__relevant-copy">
                    <span className="yd-dash-m__relevant-title">{item.label}</span>
                    <time className="yd-dash-m__relevant-when">{compactWhen(item.when)}</time>
                  </span>
                  <span className="sr-only">{kindLabel(item.kind)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="yd-dash-m__card" aria-label="Aktivität">
        <header className="yd-dash-m__card-head">
          <h2 className="yd-dash-m__card-title">Aktivität</h2>
        </header>

        <div className="yd-dash-m__activity">
          <div className="yd-dash-m__activity-block">
            <div className="yd-dash-m__activity-head">
              <p className="yd-dash-m__activity-label">Fälle diese Woche</p>
              <p className="yd-dash-m__activity-value">{casesWeekTotal}</p>
            </div>
            {weeklyCounts ? <MiniSparkline counts={weeklyCounts} /> : null}
          </div>

          <div className="yd-dash-m__activity-block yd-dash-m__activity-block--compact">
            <div className="yd-dash-m__activity-head">
              <p className="yd-dash-m__activity-label">Freigaben offen</p>
              <p className="yd-dash-m__activity-value">{freigabenCount}</p>
            </div>
            <div className="yd-dash-m__activity-track" aria-hidden>
              <span
                className="yd-dash-m__activity-fill"
                style={{ width: `${Math.max(8, Math.round((freigabenCount / activityMax) * 100))}%` }}
              />
            </div>
          </div>

          <div className="yd-dash-m__activity-block yd-dash-m__activity-block--compact">
            <div className="yd-dash-m__activity-head">
              <p className="yd-dash-m__activity-label">Journal-Aktivität</p>
              <p className="yd-dash-m__activity-value">{journalCount}</p>
            </div>
            <div className="yd-dash-m__activity-track" aria-hidden>
              <span
                className="yd-dash-m__activity-fill yd-dash-m__activity-fill--journal"
                style={{ width: `${Math.max(8, Math.round((journalCount / activityMax) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
