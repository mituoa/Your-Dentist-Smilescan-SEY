"use client";

import { cn } from "@/lib/utils";
import { COMMAND_AI_PUBLIC } from "@/lib/marketing/command-ai-public-copy";

const DEMO_STEPS = [
  {
    phase: "Eingang",
    title: "Patient sendet strukturiert ein",
    detail: "3 Fotos · Anliegen · im Tracker",
  },
  {
    phase: "Team",
    title: "Intern abstimmen in Relay",
    detail: "Übergabe · ohne WhatsApp",
  },
  {
    phase: "Aufgabe",
    title: "Erinnerung & Routine",
    detail: "Rückruf geplant · Verantwortung klar",
  },
  {
    phase: "Assistenz",
    title: "Command AI unterstützt",
    detail: COMMAND_AI_PUBLIC.demoStep,
  },
] as const;

type YdPracticeDemoProps = {
  compact?: boolean;
};

/** Kurzer Produktablauf — ruhig, ohne Sales-Dichte. */
export function YdPracticeDemo({ compact = false }: YdPracticeDemoProps) {
  const steps = compact ? DEMO_STEPS.slice(0, 3) : DEMO_STEPS;
  const sectionId = compact ? "einblick-mobile" : "einblick";

  return (
    <section
      id={sectionId}
      className={cn(
        "yd-practice-demo yd-clinical-act yd-public-os-awaken-field",
        compact && "yd-practice-demo--compact"
      )}
      style={compact ? undefined : { ["--yd-public-field-i" as string]: "2" }}
      aria-labelledby="yd-practice-demo-title"
    >
      <header className="yd-practice-demo-head">
        <p className="yd-clinical-eyebrow">{compact ? "Ablauf" : "Produktablauf"}</p>
        <h2 id="yd-practice-demo-title" className="yd-clinical-act-title yd-clinical-act-title--direct">
          {compact ? "So arbeitet Ihr Team" : "Vom Eingang bis zur Übergabe"}
        </h2>
      </header>

      <ol className="yd-practice-demo-flow yd-practice-demo-flow--compact">
        {steps.map((step, i) => (
          <li key={step.phase} className="yd-practice-demo-step">
            <div className="yd-practice-demo-step-rail" aria-hidden>
              <span className="yd-practice-demo-step-num">{String(i + 1).padStart(2, "0")}</span>
              {i < steps.length - 1 ? <span className="yd-practice-demo-step-line" /> : null}
            </div>
            <div className="yd-practice-demo-step-body">
              <span className="yd-practice-demo-step-phase">{step.phase}</span>
              <p className="yd-practice-demo-step-title">{step.title}</p>
              <p className="yd-practice-demo-step-detail">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
