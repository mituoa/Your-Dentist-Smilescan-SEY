import Link from "next/link";

import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";

type Props = {
  rows: RelayWorkRow[];
};

function routineWhen(row: RelayWorkRow): string {
  if (row.dueLabel?.trim()) return row.dueLabel;
  if (row.waitingLabel?.trim()) return row.waitingLabel;
  if (row.timeLabel?.trim()) return row.timeLabel;
  return "Bald";
}

export function DashboardRoutinesSidebar({ rows }: Props) {
  return (
    <aside className="yd-dash-bento-routines" aria-label="Nächste Routinen">
      <header className="yd-dash-bento-routines__head">
        <h2 className="yd-dash-bento-routines__title">Nächste Routinen</h2>
      </header>

      {rows.length === 0 ? (
        <p className="yd-dash-bento-routines__empty">Keine fälligen Routinen.</p>
      ) : (
        <ul className="yd-dash-bento-routines__list">
          {rows.map((row) => (
            <li key={row.id}>
              <Link href={row.href} className="yd-dash-bento-routines__item" prefetch>
                <span className="yd-dash-bento-routines__label">{row.primaryLabel}</span>
                <time className="yd-dash-bento-routines__when">{routineWhen(row)}</time>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link href="/relay?section=routines" className="yd-dash-bento-routines__all" prefetch>
        Alle Routinen
      </Link>
    </aside>
  );
}
