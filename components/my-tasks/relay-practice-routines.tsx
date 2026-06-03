"use client";

import Link from "next/link";

import type { RelayRoutineRow } from "@/lib/relay/build-relay-snapshot";
import { YD } from "@/lib/design/yd-design-tokens";

type RelayPracticeRoutinesProps = {
  routines: RelayRoutineRow[];
};

export function RelayPracticeRoutines({ routines }: RelayPracticeRoutinesProps) {
  if (routines.length === 0) {
    return (
      <p className="text-[13px] font-medium" style={{ color: YD.text.muted }}>
        Keine wiederkehrenden Aufgaben offen.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {routines.map((row) => (
        <li key={row.id}>
          <Link href={row.href} className="yd-relay-v4-routine-row block no-underline">
            <p className="text-[14px] font-medium" style={{ color: YD.text.primary }}>
              {row.title}
            </p>
            <p className="mt-0.5 text-[12px] font-medium" style={{ color: YD.text.muted }}>
              {row.rhythmLabel}
              {row.nextLabel ? ` · ${row.nextLabel}` : ""}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
