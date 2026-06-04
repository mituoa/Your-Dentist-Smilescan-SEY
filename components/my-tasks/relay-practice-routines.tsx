"use client";

import Link from "next/link";

import type { RelayRoutineRow } from "@/lib/relay/build-relay-snapshot";

type RelayPracticeRoutinesProps = {
  routines: RelayRoutineRow[];
};

export function RelayPracticeRoutines({ routines }: RelayPracticeRoutinesProps) {
  if (routines.length === 0) {
    return (
      <div className="yd-relay-empty-state yd-relay-empty-state--compact">
        <p className="yd-relay-empty-state__title">Keine Routinen offen</p>
        <p className="yd-relay-empty-state__text">Wiederkehrende Aufgaben erscheinen hier bei Fälligkeit.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1.5">
      {routines.map((row) => (
        <li key={row.id}>
          <Link href={row.href} className="yd-relay-v4-routine-row block no-underline">
            <p className="text-[13px] font-medium text-[#0F172A]">{row.title}</p>
            <p className="mt-0.5 text-[11px] font-medium text-[#64748B]">
              {row.rhythmLabel}
              {row.nextLabel ? ` · ${row.nextLabel}` : ""}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
