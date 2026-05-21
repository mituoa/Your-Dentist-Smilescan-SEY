"use client";

import Image from "next/image";

import { PUBLIC_EDITORIAL_IMAGES } from "@/lib/marketing/public-editorial-images";
import { COMMAND_AI_PUBLIC } from "@/lib/marketing/command-ai-public-copy";

const ambient = PUBLIC_EDITORIAL_IMAGES.practiceWorldAmbient;

const RELAY_MOMENTS = [
  { type: "Direkt", text: "Dr. Weber → ZFA: Freigabe Röntgen?" },
  { type: "Gruppe", text: "Implantatfälle · 4 im Thread" },
  { type: "Übergabe", text: "Urlaub · ZFA übernimmt Fälle" },
  { type: "Rezeption", text: "Rückruf-Termin · Patientin M. K." },
] as const;

const WORKFLOW_STEPS = [
  { num: "01", label: "Eingang", detail: "3 Fotos", state: "done" as const },
  { num: "02", label: "Tracker", detail: "Sichtung", state: "done" as const },
  { num: "03", label: "Relay", detail: "Team", state: "active" as const },
  { num: "04", label: "Routine", detail: "Rückruf", state: "next" as const },
  { num: "05", label: "Ruhe", detail: "Erledigt", state: "next" as const },
] as const;

/**
 * Hero product — real practice states, one calm operational surface.
 */
export function YdPracticeWorld() {
  return (
    <div
      className="yd-practice-world yd-practice-world--premium yd-practice-world--orchestrated"
      role="img"
      aria-label="Praxissoftware in Nutzung: Patienteneingang, interne Kommunikation, Aufgaben, Erinnerungen, leise Assistenz"
    >
      <div className="yd-practice-world-photo" aria-hidden>
        <Image
          src={ambient.src}
          alt=""
          fill
          sizes="(max-width: 960px) 100vw, 62vw"
          className="yd-practice-world-photo-img"
          priority
        />
        <div className="yd-practice-world-photo-veil" />
      </div>
      <div className="yd-practice-world-glow yd-practice-world-glow--warm" aria-hidden />
      <div className="yd-practice-world-glow yd-practice-world-glow--cool" aria-hidden />

      <p className="yd-practice-world-kicker">
        <span className="yd-practice-world-kicker-dot" aria-hidden />
        Live · Praxisbereich Dr. Weber
      </p>

      <div className="yd-practice-world-layout">
        <div className="yd-practice-world-stage">
          <div className="yd-practice-world-stage-head">
            <div className="min-w-0 flex-1">
              <span className="yd-practice-world-label">Tracker · Einsendung</span>
              <p className="yd-practice-world-stage-title">Patientin M. K. — Schmerz linker Unterkiefer</p>
            </div>
            <span className="yd-practice-world-pill">Zu sichten</span>
          </div>

          <div className="yd-practice-world-stage-body">
            <div className="yd-practice-world-patient-chip">
              <span className="yd-practice-world-chip-label">Patientenweg</span>
              <p>3 intraorale Fotos · eingegangen 12:41</p>
            </div>

            <div className="yd-practice-world-stage-main">
              <ul className="yd-practice-world-inbox">
                <li className="yd-practice-world-inbox-item yd-practice-world-inbox-item--focus">
                  <div className="min-w-0">
                    <p className="yd-practice-world-inbox-name">Relay · Gruppe Implantatfälle</p>
                    <p className="yd-practice-world-inbox-meta">
                      Intern: „Röntgenfreigabe prüfen — bitte bis heute“
                    </p>
                  </div>
                  <span className="yd-practice-world-status yd-practice-world-status--wait">2 neu</span>
                </li>
                <li className="yd-practice-world-inbox-item yd-practice-world-inbox-item--task">
                  <div className="min-w-0">
                    <p className="yd-practice-world-inbox-name">Aufgabe · Röntgenfreigabe</p>
                    <p className="yd-practice-world-inbox-meta">Zuständig: ZFA · seit 2 Tagen offen</p>
                  </div>
                  <span className="yd-practice-world-status yd-practice-world-status--open">Offen</span>
                </li>
                <li className="yd-practice-world-inbox-item">
                  <div className="min-w-0">
                    <p className="yd-practice-world-inbox-name">Erinnerung · Rückruf Patientin</p>
                    <p className="yd-practice-world-inbox-meta">Morgen 09:00 · Rezeption</p>
                  </div>
                  <span className="yd-practice-world-status">Geplant</span>
                </li>
              </ul>

              <p className="yd-practice-world-assist" role="note">
                <span className="yd-practice-world-assist-label">Command</span>
                <span className="yd-practice-world-assist-text">
                  {COMMAND_AI_PUBLIC.showcaseAssist}
                </span>
              </p>
            </div>
          </div>
        </div>

        <aside className="yd-practice-world-side" aria-label="Relay Kommunikation und Routinen">
          <p className="yd-practice-world-side-title">Relay · intern</p>
          <ul className="yd-practice-world-moments">
            {RELAY_MOMENTS.map((m) => (
              <li key={m.type} className="yd-practice-world-moment">
                <span className="yd-practice-world-moment-type">{m.type}</span>
                <span className="yd-practice-world-moment-text">{m.text}</span>
              </li>
            ))}
          </ul>
          <p className="yd-practice-world-routine">
            <span>Routine</span> Steri-Kontrolle · täglich 08:00 · Erinnerung aktiv
          </p>
        </aside>
      </div>

      <p className="yd-practice-world-stage-foot">
        Eingang · Team · Aufgaben · Erinnerungen — ein geschützter Raum
      </p>

      <ol className="yd-practice-world-spine" aria-hidden>
        {WORKFLOW_STEPS.map((step) => (
          <li
            key={step.num}
            className={`yd-practice-world-spine-step yd-practice-world-spine-step--${step.state}`}
          >
            <span className="yd-practice-world-spine-num">{step.num}</span>
            <span className="yd-practice-world-spine-label">{step.label}</span>
            <span className="yd-practice-world-spine-detail">{step.detail}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
