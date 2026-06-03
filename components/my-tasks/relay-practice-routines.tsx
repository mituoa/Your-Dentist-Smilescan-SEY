"use client";

import Link from "next/link";

import { HcCard } from "@/components/design/hc-card";
import type { RelayRoutineRow } from "@/lib/relay/build-relay-snapshot";
import { YD } from "@/lib/design/yd-design-tokens";

type RelayPracticeRoutinesProps = {
  routines: RelayRoutineRow[];
};

export function RelayPracticeRoutines({ routines }: RelayPracticeRoutinesProps) {
  return (
    <section className="min-w-0" aria-labelledby="yd-relay-routines-title">
      <h2 id="yd-relay-routines-title" className="yd-dash-section mb-3 text-[1.0625rem] md:text-[1.125rem]">
        Wiederkehrende Routinen
      </h2>
      {routines.length === 0 ? (
        <HcCard tone="default" className="yd-dash-surface p-4">
          <p className="text-[13px]" style={{ color: YD.text.muted }}>
            Keine wiederkehrenden Aufgaben offen.
          </p>
        </HcCard>
      ) : (
        <ul className="flex flex-col gap-2">
          {routines.map((row) => (
            <li key={row.id}>
              <Link href={row.href} className="block no-underline">
                <HcCard
                  tone="default"
                  className="yd-dash-surface yd-dash-interactive-card px-3.5 py-2.5"
                >
                  <p className="text-[14px] font-medium" style={{ color: YD.text.primary }}>
                    {row.title}
                  </p>
                  <p className="mt-0.5 text-[12px] font-medium" style={{ color: YD.text.muted }}>
                    {row.rhythmLabel}
                    {row.nextLabel ? ` · ${row.nextLabel}` : ""}
                  </p>
                </HcCard>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
