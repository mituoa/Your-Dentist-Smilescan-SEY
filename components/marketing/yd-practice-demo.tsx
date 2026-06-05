"use client";

import { cn } from "@/lib/utils";
import { PUBLIC_SITE_ABLAUF, PUBLIC_SITE_SECTIONS } from "@/lib/marketing/public-site-ia";

type YdPracticeDemoProps = {
  compact?: boolean;
};

/** Produktablauf — Lösung (Nav: #ablauf) */
export function YdPracticeDemo({ compact = false }: YdPracticeDemoProps) {
  const steps = compact ? PUBLIC_SITE_ABLAUF.steps.slice(0, 3) : PUBLIC_SITE_ABLAUF.steps;

  return (
    <section
      id={PUBLIC_SITE_SECTIONS.loesung}
      className={cn(
        "yd-practice-demo yd-clinical-act yd-public-os-awaken-field yd-public-site-scroll-anchor",
        compact && "yd-practice-demo--compact"
      )}
      style={compact ? undefined : { ["--yd-public-field-i" as string]: "2" }}
      aria-labelledby="yd-practice-demo-title"
    >
      <header className="yd-practice-demo-head">
        <p className="yd-clinical-eyebrow">{PUBLIC_SITE_ABLAUF.eyebrow}</p>
        <h2 id="yd-practice-demo-title" className="yd-clinical-act-title">
          {compact ? "So läuft jede Anfrage" : PUBLIC_SITE_ABLAUF.title}
        </h2>
      </header>

      <ol className="yd-practice-demo-flow yd-practice-demo-flow--compact">
        {steps.map((step, i) => (
          <li key={step.num} className="yd-practice-demo-step">
            <div className="yd-practice-demo-step-rail" aria-hidden>
              <span className="yd-practice-demo-step-num">{step.num}</span>
              {i < steps.length - 1 ? <span className="yd-practice-demo-step-line" /> : null}
            </div>
            <div className="yd-practice-demo-step-body">
              <p className="yd-practice-demo-step-title">
                <span className="yd-practice-demo-step-phase">{step.phase}</span>
                <span className="yd-practice-demo-step-sep" aria-hidden>
                  {" "}
                  —{" "}
                </span>
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
