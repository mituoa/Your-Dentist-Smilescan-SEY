"use client";

import Image from "next/image";

import { PUBLIC_EDITORIAL_IMAGES } from "@/lib/marketing/public-editorial-images";

const ambient = PUBLIC_EDITORIAL_IMAGES.practiceWorldAmbient;

/**
 * Hero narrative — one coordinated practice day, not floating UI demos.
 * Patient path → structured inbox → internal team handoff.
 */
export function YdPracticeWorld() {
  return (
    <div
      className="yd-practice-world"
      role="img"
      aria-label="Praxisablauf: strukturierte Patientenanfrage, Einsendungen im Team und klare interne Übergabe"
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
      <div className="yd-practice-world-atmosphere" aria-hidden />
      <svg className="yd-practice-world-flow" viewBox="0 0 400 320" aria-hidden>
        <path
          d="M 72 248 C 120 220, 140 200, 168 188"
          fill="none"
          stroke="rgba(90, 154, 200, 0.35)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <path
          d="M 232 168 C 268 155, 300 140, 328 108"
          fill="none"
          stroke="rgba(72, 178, 188, 0.38)"
          strokeWidth="1.5"
        />
        <circle cx="168" cy="188" r="3" fill="rgba(47, 128, 237, 0.45)" />
        <circle cx="232" cy="168" r="3" fill="rgba(56, 189, 198, 0.5)" />
      </svg>

      <p className="yd-practice-world-kicker">
        <span className="yd-practice-world-kicker-dot" aria-hidden />
        Heute in Ihrer Praxis
      </p>

      {/* Center spine — inbox / coordination */}
      <article className="yd-practice-world-core">
        <header className="yd-practice-world-core-head">
          <div>
            <span className="yd-practice-world-label">Einsendungen</span>
            <p className="yd-practice-world-core-title">Alles an einem Ort</p>
          </div>
          <span className="yd-practice-world-pill">3 offen</span>
        </header>
        <ul className="yd-practice-world-inbox">
          <li className="yd-practice-world-inbox-item yd-practice-world-inbox-item--focus">
            <div className="yd-practice-world-inbox-main">
              <p className="yd-practice-world-inbox-name">Patientin M. K. · Schmerz & Foto</p>
              <p className="yd-practice-world-inbox-meta">Strukturiert eingegangen · vor 12 Min.</p>
            </div>
            <span className="yd-practice-world-status yd-practice-world-status--wait">Sichtung</span>
          </li>
          <li className="yd-practice-world-inbox-item">
            <div className="yd-practice-world-inbox-main">
              <p className="yd-practice-world-inbox-name">Überweisung · Laborbefund</p>
              <p className="yd-practice-world-inbox-meta">Teamkommentar · Dr. Weber</p>
            </div>
            <span className="yd-practice-world-status">In Arbeit</span>
          </li>
        </ul>
        <p className="yd-practice-world-core-note">
          <span aria-hidden>↳</span> Interner Kommentar am Fall — kein separates Postfach
        </p>
      </article>

      {/* Patient channel — left */}
      <article className="yd-practice-world-lane yd-practice-world-lane--patient">
        <span className="yd-practice-world-label">Patientenweg</span>
        <p className="yd-practice-world-lane-title">Anfrage & Fotos</p>
        <p className="yd-practice-world-lane-meta">Über Ihren Praxislink — sicher, verständlich</p>
        <div className="yd-practice-world-photo-row" aria-hidden>
          <span />
          <span />
          <span className="yd-practice-world-photo-row-more">+2</span>
        </div>
      </article>

      {/* Team handoff — right top */}
      <article className="yd-practice-world-lane yd-practice-world-lane--handoff">
        <span className="yd-practice-world-label">Übergabe · Relay</span>
        <p className="yd-practice-world-lane-title">Rückfrage klären</p>
        <p className="yd-practice-world-lane-meta">Zahnärztin · Status: übernommen</p>
        <div className="yd-practice-world-assignee" aria-hidden>
          <span className="yd-practice-world-avatar">ZW</span>
          <span className="yd-practice-world-assignee-name">Klare Verantwortung</span>
        </div>
      </article>

      {/* Internal thread — right bottom */}
      <aside className="yd-practice-world-thread">
        <span className="yd-practice-world-label">Intern · Team</span>
        <p className="yd-practice-world-thread-line">
          <strong>Prophylaxe:</strong> „Röntgen anbei, bitte Rückruf“
        </p>
        <p className="yd-practice-world-thread-line yd-practice-world-thread-line--reply">
          <strong>MFAs:</strong> „Erledigt — Patientin informiert“
        </p>
      </aside>

      <p className="yd-practice-world-caption">
        Strukturierter Eingang → ruhige Sichtung → klare Teamarbeit → professionelle Antwort
      </p>
    </div>
  );
}
