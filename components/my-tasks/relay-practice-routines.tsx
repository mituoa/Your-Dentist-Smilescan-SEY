"use client";

import Link from "next/link";

import type { RelayRoutineRow } from "@/lib/relay/build-relay-snapshot";
import { YD } from "@/lib/design/yd-design-tokens";

type RelayPracticeRoutinesProps = {
  routines: RelayRoutineRow[];
};

export function RelayPracticeRoutines({ routines }: RelayPracticeRoutinesProps) {
  return (
    <section className="yd-relay-side-card" aria-labelledby="yd-relay-routines-title">
      <h2 id="yd-relay-routines-title" className="yd-relay-section-title">
        Praxisroutinen
      </h2>
      {routines.length === 0 ? (
        <p className="mt-3 text-[13px]" style={{ color: YD.text.muted }}>
          Keine wiederkehrenden Aufgaben offen.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {routines.map((row) => (
            <li key={row.id}>
              <Link
                href={row.href}
                className="block rounded-lg border border-[rgba(226,232,240,0.85)] bg-[rgba(248,250,252,0.6)] px-3 py-2.5 transition-colors hover:border-[rgba(43,111,232,0.2)] hover:bg-white"
              >
                <p className="text-[14px] font-medium text-[#0F172A]">{row.title}</p>
                <p className="mt-0.5 text-[12px] font-medium" style={{ color: YD.text.muted }}>
                  {row.rhythmLabel}
                  {row.nextLabel ? ` · ${row.nextLabel}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
