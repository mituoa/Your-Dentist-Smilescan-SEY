"use client";

import { cn } from "@/lib/utils";
import { COMMAND_AI_PUBLIC } from "@/lib/marketing/command-ai-public-copy";

const DEMO_STEPS = [
  {
    phase: "Eingang",
    title: "Patientin sendet Anliegen strukturiert",
    detail: "3 Fotos · Schmerz linker Unterkiefer · 12:41 eingegangen",
    context: "Tracker",
  },
  {
    phase: "Sichtung",
    title: "Priorität im Praxisbereich",
    detail: "Rezeption markiert: Rückruf heute · ZFA für Röntgenfreigabe",
    context: "Praxisbereich",
  },
  {
    phase: "Übergabe",
    title: "Interne Abstimmung ohne Nebenkanal",
    detail: "Dr. Weber → ZFA: „Freigabe Röntgen prüfen — bitte bis heute“",
    context: "Relay",
  },
  {
    phase: "Kommunikation",
    title: "Team bleibt am gleichen Fall",
    detail: "Gruppe Implantatfälle · 2 neue Nachrichten · Verantwortung klar",
    context: "Relay",
  },
  {
    phase: "Assistenz",
    title: "Leise Orientierung im Hintergrund",
    detail: COMMAND_AI_PUBLIC.demoStep,
    context: "Command AI",
  },
  {
    phase: "Abschluss",
    title: "Strukturierter Tagesabschluss",
    detail: "Sichtung erledigt · Übergabe bestätigt · Rückruf für morgen geplant",
    context: "Ruhe",
  },
] as const;

const DEMO_STEPS_COMPACT = DEMO_STEPS.slice(0, 4);

type YdPracticeDemoProps = {
  compact?: boolean;
};

/**
 * Ruhiger Live-Einblick — Praxisalltag, kein Sales-Funnel.
 */
export function YdPracticeDemo({ compact = false }: YdPracticeDemoProps) {
  const steps = compact ? DEMO_STEPS_COMPACT : DEMO_STEPS;
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
        <p className="yd-clinical-eyebrow">{compact ? "Praxisablauf" : "Live-Einblick"}</p>
        <h2 id="yd-practice-demo-title" className="yd-clinical-act-title yd-clinical-act-title--direct">
          {compact ? "Kurzer Einblick in den Alltag" : "So läuft ein Tag in Ihrem Praxisbereich"}
        </h2>
        {!compact ? (
          <p className="yd-clinical-body yd-practice-demo-lead">
            Ein kurzer geführter Ablauf — von der Patientenanfrage bis zur ruhigen Übergabe im Team.
            Zum Verstehen, nicht zum Verkaufen.
          </p>
        ) : null}
      </header>

      <ol className="yd-practice-demo-flow">
        {steps.map((step, i) => (
          <li key={step.phase} className="yd-practice-demo-step">
            <div className="yd-practice-demo-step-rail" aria-hidden>
              <span className="yd-practice-demo-step-num">{String(i + 1).padStart(2, "0")}</span>
              {i < steps.length - 1 ? <span className="yd-practice-demo-step-line" /> : null}
            </div>
            <div className="yd-practice-demo-step-body">
              <div className="yd-practice-demo-step-meta">
                <span className="yd-practice-demo-step-phase">{step.phase}</span>
                <span className="yd-practice-demo-step-context">{step.context}</span>
              </div>
              <p className="yd-practice-demo-step-title">{step.title}</p>
              <p className="yd-practice-demo-step-detail">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      {!compact ? (
        <p className="yd-clinical-whisper yd-practice-demo-close">
          Das reduziert Chaos im Kopf — Struktur im Team, ohne laut zu werden.
        </p>
      ) : null}
    </section>
  );
}
