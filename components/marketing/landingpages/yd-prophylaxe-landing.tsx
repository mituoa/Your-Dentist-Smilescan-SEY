"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, ChevronDown, MinusCircle, ShieldCheck, Sparkles } from "lucide-react";

import { GENERIC_PRACTICE } from "@/lib/marketing/landingpages/generic-practice";

/**
 * Vorlage "Prophylaxe" — eigenständiger Aufbau, eigene Farbidentität (Emerald/Teal,
 * siehe app/yd-landingpage-prophylaxe.css). Bewusst NICHT 1:1 wie die Aligner-/
 * Implantologie-Vorlage: gespiegelter Hero, Vergleichsliste statt Karten-Grid,
 * horizontale Zeitleiste statt vertikalem Prozess. Generisch (GENERIC_PRACTICE).
 */

const PRACTICE = GENERIC_PRACTICE;
const UNSPLASH = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=800&auto=format&fit=crop`;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("yd-pr-reveal--in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`yd-pr-reveal ${className ?? ""}`}>
      {children}
    </div>
  );
}

function StaggerRow({ children, className }: { children: React.ReactNode[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            [...entry.target.children].forEach((child, i) => {
              (child as HTMLElement).style.transitionDelay = `${i * 70}ms`;
              child.classList.add("yd-pr-stagger-item--in");
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <div className="yd-pr-stagger-item" key={i}>
          {child}
        </div>
      ))}
    </div>
  );
}

const STATS = [
  { value: "2×", label: "empfohlen pro Jahr" },
  { value: "30", label: "Min. pro Sitzung" },
  { value: "0", label: "Schmerzen bei normaler Anwendung" },
] as const;

const COMPARE_WITH = [
  "Zahnstein und Beläge werden gründlich entfernt",
  "Frühzeichen von Karies oder Zahnfleischproblemen fallen schneller auf",
  "Zähne fühlen sich spürbar glatter und sauberer an",
  "Empfehlung für individuelle Pflege zuhause",
] as const;

const COMPARE_WITHOUT = [
  "Beläge bauen sich in schwer erreichbaren Bereichen auf",
  "Erste Anzeichen von Problemen bleiben oft unbemerkt",
  "Höheres Risiko für spätere, aufwendigere Behandlungen",
] as const;

const TIMELINE = [
  { title: "Befund", text: "Kurze Kontrolle von Zahnfleisch, Belägen und Auffälligkeiten." },
  { title: "Reinigung", text: "Zahnstein und Beläge werden schonend entfernt." },
  { title: "Politur", text: "Glatte Oberflächen erschweren neue Belagsbildung." },
  { title: "Pflegetipps", text: "Individuelle Hinweise für die Mundhygiene zuhause." },
] as const;

const FAQ = [
  { q: "Wie oft sollte ich zur Prophylaxe?", a: "In der Regel ein- bis zweimal jährlich, je nach individueller Risikoeinschätzung." },
  { q: "Tut eine professionelle Zahnreinigung weh?", a: "Bei normaler Anwendung ist sie schmerzarm. Bei empfindlichem Zahnfleisch sprechen Sie uns vorab an." },
  { q: "Übernimmt die Krankenkasse die Kosten?", a: "Die Bezuschussung unterscheidet sich von Kasse zu Kasse. Wir legen Ihnen die Kostenübersicht vorab vor." },
  { q: "Ersetzt Prophylaxe das Zähneputzen zuhause?", a: "Nein. Prophylaxe ergänzt die tägliche Mundhygiene, ersetzt sie aber nicht." },
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="yd-pr-faq-item">
      <button type="button" className="yd-pr-faq-q" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {q}
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }} />
      </button>
      <p className={`yd-pr-faq-a ${open ? "yd-pr-faq-a--open" : ""}`}>{a}</p>
    </div>
  );
}

export function YdProphylaxeLanding() {
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(".yd-pr-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="yd-pr">
      <header className="yd-pr-topbar">
        <div className="yd-pr-container yd-pr-topbar-inner">
          <span className="yd-pr-logo">
            <span className="yd-pr-logo-dot" />
            {PRACTICE.name}
          </span>
          <div className="yd-pr-topbar-cta">
            <a href={PRACTICE.phoneHref} className="yd-pr-btn yd-pr-btn--ghost yd-pr-btn--sm">
              {PRACTICE.phoneDisplay}
            </a>
            <a href={PRACTICE.contactUrl} className="yd-pr-btn yd-pr-btn--primary yd-pr-btn--sm">
              Termin vereinbaren
            </a>
          </div>
        </div>
      </header>

      {/* 1 — Hero (Bild links) */}
      <section className="yd-pr-hero">
        <div className="yd-pr-container yd-pr-hero-grid">
          <div className="yd-pr-hero-visual">
            <div className="yd-pr-hero-frame">
              <Image
                src={UNSPLASH("1629909613654-28e377c37b09")}
                alt="Professionelle Zahnreinigung in moderner Praxis"
                width={800}
                height={720}
                priority
              />
              <span className="yd-pr-hero-badge">
                <ShieldCheck size={14} />
                Sanft &amp; gründlich
              </span>
              <div className="yd-pr-cadence">
                <strong>2×</strong>
                <span>pro Jahr</span>
              </div>
            </div>
          </div>

          <div>
            <span className="yd-pr-eyebrow">Prophylaxe · {PRACTICE.city}</span>
            <h1 className="yd-pr-hero-title">
              Vorsorgen statt <em>nachsorgen.</em>
            </h1>
            <p className="yd-pr-hero-lead">
              Professionelle Zahnreinigung entfernt Beläge, die beim Putzen zuhause
              zurückbleiben. Veränderungen am Zahnfleisch oder Zahnschmelz fallen früh auf,
              oft bevor sie spürbar werden.
            </p>
            <div className="yd-pr-hero-ctas">
              <a href={PRACTICE.contactUrl} className="yd-pr-btn yd-pr-btn--primary">
                Termin zur Prophylaxe
              </a>
              <button type="button" className="yd-pr-btn yd-pr-btn--ghost" onClick={() => scrollToId("ablauf")}>
                Ablauf ansehen
              </button>
            </div>
          </div>
        </div>

        <div className="yd-pr-container">
          <Reveal>
            <StaggerRow className="yd-pr-stat-strip">
              {STATS.map((s) => (
                <div key={s.label} className="yd-pr-stat">
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </StaggerRow>
          </Reveal>
        </div>
      </section>

      {/* 2 — Vergleichsliste */}
      <section className="yd-pr-section" id="vergleich">
        <div className="yd-pr-container">
          <Reveal>
            <div className="yd-pr-head">
              <span className="yd-pr-kicker">Der Unterschied</span>
              <h2 className="yd-pr-title">So wirkt sich regelmäßige Prophylaxe aus.</h2>
            </div>
            <StaggerRow className="yd-pr-compare">
              <div className="yd-pr-compare-col yd-pr-compare-col--positive">
                <h3>Mit regelmäßiger Prophylaxe</h3>
                <ul>
                  {COMPARE_WITH.map((item) => (
                    <li key={item}>
                      <CheckCircle2 size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="yd-pr-compare-col">
                <h3>Ohne regelmäßige Kontrolle</h3>
                <ul>
                  {COMPARE_WITHOUT.map((item) => (
                    <li key={item}>
                      <MinusCircle size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerRow>
          </Reveal>
        </div>
      </section>

      {/* 3 — Horizontale Zeitleiste */}
      <section className="yd-pr-section" style={{ background: "var(--pr-warm)" }} id="ablauf">
        <div className="yd-pr-container">
          <Reveal>
            <div className="yd-pr-head">
              <span className="yd-pr-kicker">Ablauf einer Sitzung</span>
              <h2 className="yd-pr-title">Vier Schritte in rund 30 Minuten.</h2>
            </div>
            <StaggerRow className="yd-pr-timeline">
              {TIMELINE.map((t, i) => (
                <div key={t.title} className="yd-pr-timeline-step">
                  <span className="yd-pr-timeline-num">{i + 1}</span>
                  <h3>{t.title}</h3>
                  <p>{t.text}</p>
                </div>
              ))}
            </StaggerRow>
          </Reveal>
        </div>
      </section>

      {/* 4 — FAQ */}
      <section className="yd-pr-section" id="faq">
        <div className="yd-pr-container">
          <Reveal>
            <div className="yd-pr-head">
              <span className="yd-pr-kicker">Häufige Fragen</span>
              <h2 className="yd-pr-title">Fragen zur Prophylaxe.</h2>
            </div>
            <div className="yd-pr-faq">
              {FAQ.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5 — CTA */}
      <section className="yd-pr-section" id="cta">
        <div className="yd-pr-container">
          <Reveal>
            <div className="yd-pr-cta-band">
              <Sparkles size={20} style={{ marginBottom: 12, opacity: 0.85 }} />
              <h2>Zeit für Ihre nächste Prophylaxe?</h2>
              <p>Ein Termin, rund 30 Minuten, ein spürbar saubereres Gefühl danach.</p>
              <div className="yd-pr-cta-buttons">
                <a href={PRACTICE.contactUrl} className="yd-pr-btn yd-pr-btn--primary">
                  Termin vereinbaren
                </a>
                <a href={PRACTICE.phoneHref} className="yd-pr-btn yd-pr-btn--ghost">
                  {PRACTICE.phoneDisplay} anrufen
                </a>
              </div>
              <p className="yd-pr-cta-note">Ergänzt die tägliche Mundhygiene, ersetzt sie nicht.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="yd-pr-footer">
        <div className="yd-pr-container">
          <p>
            {PRACTICE.name} — {PRACTICE.address} · {PRACTICE.phoneDisplay}
          </p>
        </div>
      </footer>

      <div className={`yd-pr-sticky-cta ${stickyVisible ? "yd-pr-sticky-cta--visible" : ""}`}>
        <a href={PRACTICE.phoneHref} className="yd-pr-btn yd-pr-btn--ghost yd-pr-btn--sm">
          Anrufen
        </a>
        <a href={PRACTICE.contactUrl} className="yd-pr-btn yd-pr-btn--primary yd-pr-btn--sm">
          Termin vereinbaren
        </a>
      </div>
    </main>
  );
}
