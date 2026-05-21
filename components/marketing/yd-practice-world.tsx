"use client";

import Image from "next/image";

import { PUBLIC_EDITORIAL_IMAGES } from "@/lib/marketing/public-editorial-images";

const ambient = PUBLIC_EDITORIAL_IMAGES.practiceWorldAmbient;

const RELAY_MOMENTS = [
  { type: "Nachricht", text: "„Rückruf morgen“ · Zuständig: MFA" },
  { type: "Gruppe", text: "Laborrückfragen" },
  { type: "Mo", text: "Laborkontrolle" },
] as const;

const WORKFLOW_STEPS = [
  { num: "01", label: "Eingang", detail: "Patientin · Fotos", state: "done" as const },
  { num: "02", label: "Tracker", detail: "Strukturiert da", state: "done" as const },
  { num: "03", label: "Relay", detail: "Team · intern", state: "active" as const },
  { num: "04", label: "Routine", detail: "Erinnerung", state: "next" as const },
  { num: "05", label: "Abschluss", detail: "Ruhig erledigt", state: "next" as const },
] as const;

/**
 * Hero — one calm operational surface (not fragmented micro-cards).
 */
export function YdPracticeWorld() {
  return (
    <div
      className="yd-practice-world"
      role="img"
      aria-label="Praxisablauf: strukturierter Eingang, interne Koordination in Relay, Erinnerungen, leise Command AI Unterstützung"
    >
      <div className="yd-practice-world-photo" aria-hidden>
        <Image
          src={ambient.src}
          alt=""
          fill
          sizes="(max-width: 960px) 100vw, 55vw"
          className="yd-practice-world-photo-img"
          priority
        />
        <div className="yd-practice-world-photo-veil" />
      </div>
      <div className="yd-practice-world-glow yd-practice-world-glow--warm" aria-hidden />
      <div className="yd-practice-world-glow yd-practice-world-glow--cool" aria-hidden />

      <p className="yd-practice-world-kicker">
        <span className="yd-practice-world-kicker-dot" aria-hidden />
        Eingang · Team · Routinen — ein Raum
      </p>

      <div className="yd-practice-world-layout">
        <div className="yd-practice-world-stage">
          <div className="yd-practice-world-stage-head">
            <div>
              <span className="yd-practice-world-label">Tracker · Einsendung</span>
              <p className="yd-practice-world-stage-title">Patientin M. K. — Schmerz &amp; Foto</p>
            </div>
            <span className="yd-practice-world-pill">Sichtung</span>
          </div>

          <div className="yd-practice-world-stage-body">
            <div className="yd-practice-world-patient-chip">
              <span className="yd-practice-world-chip-label">Patientenweg</span>
              <p>3 Fotos sicher · vor 12 Min.</p>
            </div>

            <div className="yd-practice-world-stage-main">
              <ul className="yd-practice-world-inbox">
                <li className="yd-practice-world-inbox-item yd-practice-world-inbox-item--focus">
                  <div>
                    <p className="yd-practice-world-inbox-name">Intern · Relay</p>
                    <p className="yd-practice-world-inbox-meta">
                      Gruppe „Implantatfälle“ · Übergabe erledigt
                    </p>
                  </div>
                  <span className="yd-practice-world-status yd-practice-world-status--wait">Team</span>
                </li>
                <li className="yd-practice-world-inbox-item">
                  <div>
                    <p className="yd-practice-world-inbox-name">Erinnerung · Rückruf</p>
                    <p className="yd-practice-world-inbox-meta">Morgen 09:00 · Dr. Weber</p>
                  </div>
                  <span className="yd-practice-world-status">Geplant</span>
                </li>
                <li className="yd-practice-world-inbox-item yd-practice-world-inbox-item--ai">
                  <div>
                    <p className="yd-practice-world-inbox-name">Command AI</p>
                    <p className="yd-practice-world-inbox-meta">
                      Rückruf empfohlen · Priorität erhöht
                    </p>
                  </div>
                </li>
              </ul>
              <p className="yd-practice-world-thread-line">
                <strong>Nachricht:</strong> „Röntgenfreigabe prüfen — bitte bis heute“
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
            <span>Routine</span> Steri-Kontrolle · täglich
          </p>
        </aside>
      </div>

      <p className="yd-practice-world-stage-foot">
        Kein WhatsApp · kein Post-it — alles bleibt im Praxisbereich
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

      <svg className="yd-practice-world-connector" viewBox="0 0 520 48" aria-hidden>
        <path
          d="M 24 24 H 496"
          fill="none"
          stroke="url(#yd-flow-line)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="yd-flow-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(72, 178, 188, 0.5)" />
            <stop offset="50%" stopColor="rgba(47, 128, 237, 0.55)" />
            <stop offset="100%" stopColor="rgba(167, 139, 250, 0.35)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
