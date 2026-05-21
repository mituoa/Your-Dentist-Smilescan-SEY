"use client";

import { COMMAND_AI_PUBLIC } from "@/lib/marketing/command-ai-public-copy";

const FLOW = [
  { label: "Eingang", state: "done" as const },
  { label: "Relay", state: "active" as const },
  { label: "Aufgabe", state: "next" as const },
] as const;

/**
 * Hero product surface — believable screenshot scale, minimal chrome.
 */
export function YdPracticeWorld() {
  return (
    <div
      className="yd-practice-world yd-practice-world--premium yd-practice-world--orchestrated yd-practice-world--compact"
      role="img"
      aria-label="Praxissoftware: Patienteneingang, interne Abstimmung, Aufgabe, leise Assistenz"
    >
      <p className="yd-practice-world-kicker">
        <span className="yd-practice-world-kicker-dot" aria-hidden />
        Praxisbereich · Live
      </p>

      <div className="yd-practice-world-layout yd-practice-world-layout--single">
        <div className="yd-practice-world-stage">
          <div className="yd-practice-world-stage-head">
            <div className="min-w-0 flex-1">
              <span className="yd-practice-world-label">Tracker · Einsendung</span>
              <p className="yd-practice-world-stage-title">S. M. — Schmerz Unterkiefer</p>
            </div>
            <span className="yd-practice-world-pill">Zu sichten</span>
          </div>

          <div className="yd-practice-world-stage-body">
            <p className="yd-practice-world-patient-chip">
              <span className="yd-practice-world-chip-label">Patient</span>
              3 Fotos · 12:41
            </p>

            <ul className="yd-practice-world-inbox">
              <li className="yd-practice-world-inbox-item yd-practice-world-inbox-item--focus">
                <div className="min-w-0">
                  <p className="yd-practice-world-inbox-name">Relay · intern</p>
                  <p className="yd-practice-world-inbox-meta">Röntgenfreigabe — ZFA bis heute</p>
                </div>
                <span className="yd-practice-world-status yd-practice-world-status--wait">2 neu</span>
              </li>
              <li className="yd-practice-world-inbox-item yd-practice-world-inbox-item--task">
                <div className="min-w-0">
                  <p className="yd-practice-world-inbox-name">Aufgabe · Rückruf</p>
                  <p className="yd-practice-world-inbox-meta">Rezeption · morgen 09:00</p>
                </div>
                <span className="yd-practice-world-status">Geplant</span>
              </li>
            </ul>

            <p className="yd-practice-world-assist" role="note">
              <span className="yd-practice-world-assist-label">Command</span>
              <span className="yd-practice-world-assist-text">{COMMAND_AI_PUBLIC.showcaseAssist}</span>
            </p>
          </div>
        </div>
      </div>

      <ol className="yd-practice-world-spine yd-practice-world-spine--compact" aria-hidden>
        {FLOW.map((step) => (
          <li
            key={step.label}
            className={`yd-practice-world-spine-step yd-practice-world-spine-step--${step.state}`}
          >
            <span className="yd-practice-world-spine-label">{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
