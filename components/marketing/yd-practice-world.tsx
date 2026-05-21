"use client";

import Image from "next/image";

import { PUBLIC_EDITORIAL_IMAGES } from "@/lib/marketing/public-editorial-images";

const ambient = PUBLIC_EDITORIAL_IMAGES.practiceWorldAmbient;

const WORKFLOW_STEPS = [
  {
    num: "01",
    label: "Patientin sendet",
    detail: "Bilder & Anliegen über Ihren Praxisweg",
    state: "done",
  },
  {
    num: "02",
    label: "Tracker",
    detail: "Einsendung strukturiert eingegangen",
    state: "active",
  },
  {
    num: "03",
    label: "Relay",
    detail: "Team klärt intern am Fall",
    state: "next",
  },
  {
    num: "04",
    label: "Aufgabe",
    detail: "Erinnerung · klare Verantwortung",
    state: "next",
  },
  {
    num: "05",
    label: "Rückmeldung",
    detail: "Ruhig erledigt — Patientin informiert",
    state: "next",
  },
] as const;

/**
 * Hero workflow — one believable practice day, not floating UI samples.
 */
export function YdPracticeWorld() {
  return (
    <div
      className="yd-practice-world"
      role="img"
      aria-label="Praxisablauf: Patientin sendet Fotos, Tracker empfängt, Team koordiniert in Relay, Aufgabe mit Erinnerung, Fall ruhig abgeschlossen"
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
        Ein ruhiger Tag in Ihrer Praxis
      </p>

      <div className="yd-practice-world-stage">
        <div className="yd-practice-world-stage-head">
          <div>
            <span className="yd-practice-world-label">Tracker · Einsendungen</span>
            <p className="yd-practice-world-stage-title">Patientin M. K. — Schmerz &amp; Foto</p>
          </div>
          <span className="yd-practice-world-pill">Sichtung</span>
        </div>

        <div className="yd-practice-world-stage-body">
          <div className="yd-practice-world-patient-chip">
            <span className="yd-practice-world-chip-label">Eingang</span>
            <p>3 Fotos sicher übermittelt · vor 12 Min.</p>
          </div>

          <div className="yd-practice-world-stage-main">
            <ul className="yd-practice-world-inbox">
              <li className="yd-practice-world-inbox-item yd-practice-world-inbox-item--focus">
                <div>
                  <p className="yd-practice-world-inbox-name">Rückfrage Labor — Implantat</p>
                  <p className="yd-practice-world-inbox-meta">Intern in Relay · Dr. Weber übernommen</p>
                </div>
                <span className="yd-practice-world-status yd-practice-world-status--wait">Team</span>
              </li>
              <li className="yd-practice-world-inbox-item">
                <div>
                  <p className="yd-practice-world-inbox-name">Erinnerung · Prophylaxe-Kontrolle</p>
                  <p className="yd-practice-world-inbox-meta">Wöchentliche Routine · morgen 08:00</p>
                </div>
                <span className="yd-practice-world-status">Geplant</span>
              </li>
            </ul>
            <p className="yd-practice-world-thread-line">
              <strong>Relay:</strong> „Passt Befund — Patientin heute zurückrufen?“
            </p>
          </div>
        </div>

        <p className="yd-practice-world-stage-foot">
          Kein Telefonchaos · keine verstreute E-Mail — alles am Fall
        </p>
      </div>

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
            <stop offset="45%" stopColor="rgba(47, 128, 237, 0.55)" />
            <stop offset="100%" stopColor="rgba(167, 139, 250, 0.35)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
