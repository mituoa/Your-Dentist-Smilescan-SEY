"use client";

import Link from "next/link";

import type { TrackerPraxisAssistentModel } from "@/lib/inbox/build-tracker-workspace";
import {
  buildTrackerDecisionActions,
  type TrackerDecisionAction,
} from "@/lib/inbox/tracker-clinical-decision";
import { cn } from "@/lib/utils";

type TrackerPraxisAssistentProps = {
  model: TrackerPraxisAssistentModel;
  submissionId: string;
  isDoctor: boolean;
  openTaskCount?: number;
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function DecisionButton({ action }: { action: TrackerDecisionAction }) {
  const className = cn(
    "yd-tracker-v7-decision-btn",
    action.primary && "yd-tracker-v7-decision-btn--primary"
  );

  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => action.scrollToId && scrollToSection(action.scrollToId)}
    >
      {action.label}
    </button>
  );
}

/** V7 — Assistenz: vorbereitete Arbeit, Lücken, klare Handlung, CTAs. */
export function TrackerPraxisAssistent({
  model,
  submissionId,
  isDoctor,
  openTaskCount = 0,
}: TrackerPraxisAssistentProps) {
  const { decision } = model;
  const actions = buildTrackerDecisionActions({
    primaryAction: decision.primaryAction,
    submissionId,
    isDoctor,
    openTaskCount,
  });
  const primary = actions.find((a) => a.primary);
  const secondary = actions.filter((a) => !a.primary);

  return (
    <aside className="yd-tracker-v7-rail" aria-label="Klinische Voranalyse">
      <header className="yd-tracker-v7-rail__head">
        <h2 className="yd-tracker-v7-rail__title">Klinische Voranalyse</h2>
        <p className="yd-tracker-v7-rail__subtitle">Vorbereitet für Ihre Entscheidung</p>
      </header>

      <section className="yd-tracker-v7-rail__block" aria-labelledby="tracker-v7-prepared">
        <h3 id="tracker-v7-prepared" className="yd-tracker-v7-rail__label">
          Vorbereitet
        </h3>
        <ul className="yd-tracker-v7-prepared-list">
          {decision.prepared.map((item) => (
            <li
              key={item.label}
              className={cn(
                "yd-tracker-v7-prepared-list__item",
                item.status === "done"
                  ? "yd-tracker-v7-prepared-list__item--done"
                  : "yd-tracker-v7-prepared-list__item--warn"
              )}
            >
              <span className="yd-tracker-v7-prepared-list__mark" aria-hidden>
                {item.status === "done" ? "✓" : "⚠"}
              </span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {decision.stillNeed.length > 0 ? (
        <section className="yd-tracker-v7-rail__block" aria-labelledby="tracker-v7-gaps">
          <h3 id="tracker-v7-gaps" className="yd-tracker-v7-rail__label">
            Was fehlt noch?
          </h3>
          <ul className="yd-tracker-v7-gap-list">
            {decision.stillNeed.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        className="yd-tracker-v7-rail__block yd-tracker-v7-rail__block--decision"
        aria-labelledby="tracker-v7-action"
      >
        <h3 id="tracker-v7-action" className="yd-tracker-v7-rail__label">
          Empfohlene nächste Handlung
        </h3>
        <p className="yd-tracker-v7-rail__recommendation">{decision.primaryAction}</p>
        <div className="yd-tracker-v7-rail__actions">
          {primary ? <DecisionButton action={primary} /> : null}
          {secondary.map((action) => (
            <DecisionButton key={action.id} action={action} />
          ))}
        </div>
      </section>
    </aside>
  );
}
