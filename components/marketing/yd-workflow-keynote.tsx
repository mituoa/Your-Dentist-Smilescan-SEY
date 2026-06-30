"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  BookOpen,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Send,
  Sparkles,
  Stethoscope,
  UserRound,
  Users2,
} from "lucide-react";

/**
 * Workflow-Keynote — eine fortlaufende, scroll-gesteuerte Sequenz statt einer
 * Kartenreihe. Eine Bühne rechts verändert ihre Form je Schritt (Nachricht →
 * Datensatz → KI-Entwurf → Freigabe-Stempel → Care-Center-Verknüpfung → Versand-Haken → Relay-Diktat).
 * Eine schmale Schrittleiste links zeichnet die Verbindung mit dem Scrollfortschritt.
 *
 * Wichtig (Produktlogik): Nach der ärztlichen Freigabe sendet Command AI die Antwort
 * automatisch an den Patienten — das ist KEIN Team-Task. Relay ist ein separater Kanal:
 * der Arzt diktiert darüber Aufgaben an Rezeption/Assistenz (z. B. Laborauftrag), komplett
 * im Portal dokumentiert statt über WhatsApp.
 */

const STEPS = [
  {
    title: "Patient sendet Foto",
    detail: "Implantatstelle, Tag 7 — mit kurzer Beschreibung.",
    icon: UserRound,
  },
  {
    title: "Tracker übernimmt den Fall",
    detail: "Nachricht wird zu einem strukturierten Fall.",
    icon: ClipboardCheck,
  },
  {
    title: "Command AI bereitet vor",
    detail: "Zusammenfassung und Antwortentwurf entstehen.",
    icon: Sparkles,
  },
  {
    title: "Arzt prüft",
    detail: "Freigabe statt automatischer Entscheidung.",
    icon: Stethoscope,
  },
  {
    title: "Care Center wird verknüpft",
    detail: "Passender Nachsorge-Artikel ergänzt die Antwort.",
    icon: BookOpen,
  },
  {
    title: "Patient erhält Antwort",
    detail: "Command AI versendet automatisch nach Freigabe.",
    icon: Send,
  },
  {
    title: "Relay: Aufgabe diktiert",
    detail: "Laborauftrag für Pat. M. Müller — im Portal, nicht per WhatsApp.",
    icon: Users2,
  },
] as const;

function useChoreography(ref: RefObject<HTMLDivElement | null>, steps: number, enabled: boolean) {
  const [state, setState] = useState({ activeIndex: 0, stepProgress: 0, overallProgress: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      const scaled = progress * steps;
      const activeIndex = Math.min(steps - 1, Math.floor(scaled));
      const stepProgress = Math.min(1, Math.max(0, scaled - activeIndex));
      setState({ activeIndex, stepProgress, overallProgress: progress });
    };
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        measure();
        rafRef.current = 0;
      });
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ref, steps, enabled]);

  return state;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** Typewriter, dessen Fortschritt direkt am Scroll hängt — kein Timer. */
function ScrollTypewriter({ text, progress }: { text: string; progress: number }) {
  const visible = text.slice(0, Math.round(text.length * Math.min(1, progress * 1.4)));
  return (
    <p className="yd-wk-typewriter">
      {visible}
      <span className="yd-wk-caret" />
    </p>
  );
}

function StageContent({ index, progress }: { index: number; progress: number }) {
  switch (index) {
    case 0:
      return (
        <div className="yd-wk-stage-inner">
          <p className="yd-wk-stage-label">Eingehende Nachricht</p>
          <div className="yd-wk-bubble" style={{ opacity: Math.min(1, progress * 2) }}>
            <span className="yd-wk-bubble-photo" aria-hidden>
              <Camera size={15} />
            </span>
            „Seit Tag 5 etwas Druckgefühl an der Implantatstelle, Foto im Anhang.“
          </div>
        </div>
      );
    case 1: {
      const fields = [
        { k: "Patient", v: "Fall #1042" },
        { k: "Anliegen", v: "Implantat · Tag 7" },
        { k: "Status", v: "Neu" },
      ];
      return (
        <div className="yd-wk-stage-inner">
          <p className="yd-wk-stage-label">Fall im Tracker</p>
          <div className="yd-wk-record">
            {fields.map((f, i) => (
              <div
                key={f.k}
                className="yd-wk-record-row"
                style={{
                  opacity: progress > i / fields.length ? 1 : 0,
                  transform: progress > i / fields.length ? "translateY(0)" : "translateY(6px)",
                }}
              >
                <span>{f.k}</span>
                <strong>{f.v}</strong>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 2:
      return (
        <div className="yd-wk-stage-inner">
          <p className="yd-wk-stage-label">Command AI — Entwurf</p>
          <ScrollTypewriter
            text="Heilung im erwarteten Bereich. Empfehlung: Kontrolle in dieser Woche."
            progress={progress}
          />
        </div>
      );
    case 3:
      return (
        <div className="yd-wk-stage-inner yd-wk-stage-inner--center">
          <p className="yd-wk-stage-label">Ärztliche Freigabe</p>
          <div
            className="yd-wk-stamp"
            style={{
              opacity: progress,
              transform: `scale(${0.7 + progress * 0.3}) rotate(${-8 + progress * 8}deg)`,
            }}
          >
            <CheckCircle2 size={22} />
            Freigegeben
          </div>
        </div>
      );
    case 4:
      return (
        <div className="yd-wk-stage-inner">
          <p className="yd-wk-stage-label">Care Center</p>
          <div
            className="yd-wk-chip"
            style={{ opacity: progress, transform: `scale(${0.92 + progress * 0.08})` }}
          >
            <BookOpen size={14} />
            Schwellung nach Implantation — was ist normal?
          </div>
        </div>
      );
    case 5: {
      const dash = 44 - progress * 44;
      return (
        <div className="yd-wk-stage-inner">
          <p className="yd-wk-stage-label">Automatisch an den Patienten gesendet</p>
          <div className="yd-wk-sent">
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
              <circle cx="11" cy="11" r="10" fill="none" stroke="var(--os-blue)" strokeWidth="1.6" />
              <path
                d="M6 11.5l3.2 3.2L16 8"
                fill="none"
                stroke="var(--os-blue)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="44"
                strokeDashoffset={dash}
              />
            </svg>
            <p>„Verlauf unauffällig — bitte zur Kontrolle in dieser Woche vorbeikommen.“</p>
          </div>
        </div>
      );
    }
    case 6:
    default:
      return (
        <div className="yd-wk-stage-inner">
          <p className="yd-wk-stage-label">Relay — per Diktat beauftragt</p>
          <div
            className="yd-wk-task"
            style={{
              opacity: progress,
              transform: `translateX(${(1 - progress) * 18}px)`,
            }}
          >
            <span className="yd-wk-task-tag">Assistenz · Fall #1042</span>
            <p>„Laborauftrag für Patient M. Müller erstellen.“ — dokumentiert im Portal.</p>
          </div>
        </div>
      );
  }
}

export function YdWorkflowKeynote() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 900px)");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  const enabled = isDesktop && !reduced;
  const { activeIndex, stepProgress, overallProgress } = useChoreography(
    wrapperRef,
    STEPS.length,
    enabled
  );

  if (!enabled) {
    return (
      <div className="yd-wk-fallback">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="yd-wk-fallback-row">
              <span className="yd-wk-fallback-icon">
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <div>
                <p className="yd-wk-fallback-title">
                  {i + 1}. {step.title}
                </p>
                <p className="yd-wk-fallback-detail">{step.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="yd-wk-wrapper" style={{ height: `${STEPS.length * 22}vh` }}>
      <div className="yd-wk-pin">
        <div className="yd-wk-grid">
          <div className="yd-wk-rail">
            <div
              className="yd-wk-rail-fill"
              style={{ height: `${(overallProgress) * 100}%` }}
            />
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const state = i < activeIndex ? "is-done" : i === activeIndex ? "is-active" : "";
              return (
                <div key={step.title} className={`yd-wk-rail-item ${state}`}>
                  <span className="yd-wk-rail-icon">
                    <Icon size={14} strokeWidth={1.9} />
                  </span>
                  <div>
                    <p className="yd-wk-rail-title">{step.title}</p>
                    <p className="yd-wk-rail-detail">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="yd-wk-stage">
            <StageContent index={activeIndex} progress={stepProgress} />
          </div>
        </div>
      </div>
    </div>
  );
}
