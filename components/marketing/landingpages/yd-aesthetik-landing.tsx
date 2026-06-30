"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

import { GENERIC_PRACTICE } from "@/lib/marketing/landingpages/generic-practice";

/**
 * Vorlage "Ästhetische Zahnmedizin" — eigenständiger Aufbau, eigene Farbidentität
 * (warmes Anthrazit + gedämpftes Gold, siehe app/yd-landingpage-aesthetik.css).
 * Bewusst anders als Aligner/Implantologie (Navy) und Prophylaxe (Emerald):
 * zentrierter editorialer Hero ohne Split-Grid, Pill-Cloud statt Karten,
 * Zitat-Statement-Block, schlanke horizontale Prozess-Zeile. Generisch (GENERIC_PRACTICE).
 */

const PRACTICE = GENERIC_PRACTICE;
const UNSPLASH = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=1200&auto=format&fit=crop`;

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
            entry.target.classList.add("yd-ae-reveal--in");
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
    <div ref={ref} className={`yd-ae-reveal ${className ?? ""}`}>
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
              (child as HTMLElement).style.transitionDelay = `${i * 50}ms`;
              child.classList.add("yd-ae-stagger-item--in");
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
        <div className="yd-ae-stagger-item" key={i}>
          {child}
        </div>
      ))}
    </div>
  );
}

const TREATMENTS = [
  "Veneers",
  "Bleaching",
  "Smile Design",
  "Keramik-Inlays",
  "Lückenschluss",
  "Zahnformkorrektur",
  "Kontaktpunkt-Optimierung",
  "Gingiva-Kontur",
] as const;

const PROCESS = [
  { step: "Beratung", title: "Wünsche & Ausgangssituation", text: "Gemeinsam besprechen wir, was Sie sich für Ihr Lächeln wünschen." },
  { step: "Planung", title: "Individuelles Behandlungskonzept", text: "Material, Umfang und Ablauf werden auf Ihre Zahnsituation abgestimmt." },
  { step: "Umsetzung", title: "Schrittweise, kontrolliert", text: "Die Behandlung erfolgt in begleiteten Schritten mit Zwischenkontrollen." },
] as const;

const FAQ = [
  { q: "Wie lange hält das Ergebnis?", a: "Die Haltbarkeit hängt vom gewählten Verfahren und Ihrer Pflege ab. Das besprechen wir individuell im Beratungsgespräch." },
  { q: "Ist die Behandlung schmerzhaft?", a: "Die meisten ästhetischen Verfahren sind schmerzarm. Details zum jeweiligen Verfahren erläutern wir vorab." },
  { q: "Was kostet eine ästhetische Behandlung?", a: "Die Kosten richten sich nach Umfang und Verfahren. Sie erhalten vorab eine transparente Kostenübersicht." },
  { q: "Wie viele Termine sind nötig?", a: "Das hängt vom gewählten Verfahren ab, von einer einzelnen Sitzung bis zu mehreren begleiteten Schritten." },
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="yd-ae-faq-item">
      <button type="button" className="yd-ae-faq-q" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {q}
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }} />
      </button>
      <p className={`yd-ae-faq-a ${open ? "yd-ae-faq-a--open" : ""}`}>{a}</p>
    </div>
  );
}

export function YdAesthetikLanding() {
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(".yd-ae-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="yd-ae">
      <header className="yd-ae-topbar">
        <div className="yd-ae-container yd-ae-topbar-inner">
          <span className="yd-ae-logo">
            <span className="yd-ae-logo-mark" />
            {PRACTICE.name}
          </span>
          <div className="yd-ae-topbar-cta">
            <a href={PRACTICE.phoneHref} className="yd-ae-btn yd-ae-btn--ghost yd-ae-btn--sm">
              {PRACTICE.phoneDisplay}
            </a>
            <a href={PRACTICE.contactUrl} className="yd-ae-btn yd-ae-btn--primary yd-ae-btn--sm">
              Beratung
            </a>
          </div>
        </div>
      </header>

      {/* 1 — Hero (zentriert, editorial) */}
      <section className="yd-ae-hero">
        <div className="yd-ae-container">
          <Reveal>
            <span className="yd-ae-eyebrow">Ästhetische Zahnmedizin · {PRACTICE.city}</span>
            <h1 className="yd-ae-hero-title">
              Ein Lächeln, das <strong>zu Ihnen</strong> passt.
            </h1>
            <p className="yd-ae-hero-lead">
              Ästhetische Zahnmedizin verbindet Funktion und Form. Wir planen individuell,
              ausgehend von Ihrer Zahnsituation und Ihren Wünschen.
            </p>
            <div className="yd-ae-hero-ctas">
              <a href={PRACTICE.contactUrl} className="yd-ae-btn yd-ae-btn--primary">
                Beratung anfragen
              </a>
              <button type="button" className="yd-ae-btn yd-ae-btn--ghost" onClick={() => scrollToId("ablauf")}>
                Ablauf ansehen
              </button>
            </div>
            <div className="yd-ae-hero-frame">
              <Image
                src={UNSPLASH("1489278353717-f64c6ee8a4d2")}
                alt="Ästhetisches, natürlich wirkendes Lächeln"
                width={1200}
                height={638}
                priority
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2 — Behandlungsspektrum (Pill-Cloud) */}
      <section className="yd-ae-section" id="spektrum">
        <div className="yd-ae-container">
          <Reveal>
            <div className="yd-ae-head">
              <span className="yd-ae-kicker">Behandlungsspektrum</span>
              <h2 className="yd-ae-title">Verfahren, die zu Ihrer Situation passen.</h2>
            </div>
            <div className="yd-ae-pill-cloud">
              {TREATMENTS.map((t) => (
                <span key={t} className="yd-ae-pill">
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3 — Statement */}
      <section className="yd-ae-section" style={{ background: "var(--ae-warm)" }}>
        <div className="yd-ae-container">
          <Reveal>
            <div className="yd-ae-statement">
              <blockquote>
                „Ästhetik beginnt mit gesunder Funktion. Die Form folgt danach.“
              </blockquote>
              <cite>Behandlungsphilosophie</cite>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4 — Ablauf (schlanke Zeile) */}
      <section className="yd-ae-section" id="ablauf">
        <div className="yd-ae-container">
          <Reveal>
            <div className="yd-ae-head">
              <span className="yd-ae-kicker">Ablauf</span>
              <h2 className="yd-ae-title">Drei Schritte zu Ihrem Ergebnis.</h2>
            </div>
            <StaggerRow className="yd-ae-process">
              {PROCESS.map((p) => (
                <div key={p.title} className="yd-ae-process-step">
                  <span>{p.step}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              ))}
            </StaggerRow>
          </Reveal>
        </div>
      </section>

      {/* 5 — FAQ */}
      <section className="yd-ae-section" style={{ background: "var(--ae-warm)" }} id="faq">
        <div className="yd-ae-container">
          <Reveal>
            <div className="yd-ae-head">
              <span className="yd-ae-kicker">Häufige Fragen</span>
              <h2 className="yd-ae-title">Was Patient:innen häufig fragen.</h2>
            </div>
            <div className="yd-ae-faq">
              {FAQ.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6 — CTA */}
      <section className="yd-ae-section" id="cta">
        <div className="yd-ae-container">
          <Reveal>
            <div className="yd-ae-cta-band">
              <h2>Bereit für Ihre Beratung?</h2>
              <p>Vereinbaren Sie ein persönliches Gespräch. Unverbindlich, auf Ihre Situation abgestimmt.</p>
              <div className="yd-ae-cta-buttons">
                <a href={PRACTICE.contactUrl} className="yd-ae-btn yd-ae-btn--primary">
                  Beratung anfragen
                </a>
                <a href={PRACTICE.phoneHref} className="yd-ae-btn yd-ae-btn--ghost">
                  {PRACTICE.phoneDisplay} anrufen
                </a>
              </div>
              <p className="yd-ae-cta-note">Individuelle Planung · transparente Kostenübersicht</p>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="yd-ae-footer">
        <div className="yd-ae-container">
          <p>
            {PRACTICE.name} — {PRACTICE.address} · {PRACTICE.phoneDisplay}
          </p>
        </div>
      </footer>

      <div className={`yd-ae-sticky-cta ${stickyVisible ? "yd-ae-sticky-cta--visible" : ""}`}>
        <a href={PRACTICE.phoneHref} className="yd-ae-btn yd-ae-btn--ghost yd-ae-btn--sm">
          Anrufen
        </a>
        <a href={PRACTICE.contactUrl} className="yd-ae-btn yd-ae-btn--primary yd-ae-btn--sm">
          Beratung
        </a>
      </div>
    </main>
  );
}
