"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Award,
  CalendarClock,
  ChevronDown,
  Clock,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  Stethoscope,
  UserRoundPlus,
  Users2,
} from "lucide-react";

import { usePracticeOverride } from "@/lib/marketing/landingpages/use-practice-override";
import { useLandingPreviewContent } from "@/lib/marketing/landingpages/landing-preview-content";

/**
 * Vorlage "Personal gewinnen" (Recruiting) — eigenständiger Aufbau, eigene
 * Farbidentität (Petrol/Amber, siehe app/yd-landingpage-karriere.css). Rollen-Karten
 * statt Methodenkarten, Benefits-Raster statt Vergleichsliste. Generisch
 * (GENERIC_PRACTICE), gespeist aus karriereLandingConfig.
 */

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
            entry.target.classList.add("yd-kr-reveal--in");
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
    <div ref={ref} className={`yd-kr-reveal ${className ?? ""}`}>
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
              (child as HTMLElement).style.transitionDelay = `${i * 60}ms`;
              child.classList.add("yd-kr-stagger-item--in");
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
        <div className="yd-kr-stagger-item" key={i}>
          {child}
        </div>
      ))}
    </div>
  );
}

const STATS = [
  { value: "<48", label: "Std. bis zur Rückmeldung" },
  { value: "1", label: "Persönliches Kennenlernen" },
  { value: "0", label: "Anonyme Bewerbungsportale" },
] as const;

const ROLES = [
  { icon: Stethoscope, label: "ZFA" },
  { icon: HeartHandshake, label: "Prophylaxe / DH" },
  { icon: GraduationCap, label: "Ausbildung ZFA" },
  { icon: Users2, label: "Rezeption" },
  { icon: Award, label: "Praxismanagement" },
  { icon: UserRoundPlus, label: "Quereinsteiger:innen" },
] as const;

const BENEFITS = [
  { icon: HeartHandshake, title: "Familiäres Team" },
  { icon: GraduationCap, title: "Fort- & Weiterbildung" },
  { icon: Clock, title: "Faire Arbeitszeiten" },
  { icon: Award, title: "Attraktive Vergütung" },
] as const;

const FAQ = [
  { q: "Brauche ich Berufserfahrung?", a: "Nicht zwingend. Wir freuen uns über erfahrene Fachkräfte genauso wie über Auszubildende und Quereinsteiger:innen mit Motivation." },
  { q: "Wie läuft der Bewerbungsprozess ab?", a: "Sie senden uns eine kurze Nachricht mit Ihren Eckdaten. Wir melden uns persönlich zurück und vereinbaren ein erstes Kennenlernen." },
  { q: "Ist Teilzeit möglich?", a: "In den meisten Positionen ja. Sprechen Sie uns auf Ihren gewünschten Stundenumfang an." },
  { q: "Wann kann ich anfangen?", a: "Das klären wir gemeinsam im persönlichen Gespräch, abhängig von Ihrer aktuellen Situation." },
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="yd-kr-faq-item">
      <button type="button" className="yd-kr-faq-q" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {q}
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }} />
      </button>
      <p className={`yd-kr-faq-a ${open ? "yd-kr-faq-a--open" : ""}`}>{a}</p>
    </div>
  );
}

export function YdKarriereLanding() {
  const PRACTICE = usePracticeOverride();
  const content = useLandingPreviewContent({
    eyebrow: `Karriere · ${PRACTICE.city}`,
    headline: "Werden Sie Teil unseres Teams.",
    subheadline:
      "Wir suchen Verstärkung in einer modernen Zahnarztpraxis. Persönliches Kennenlernen statt anonymem Bewerbungsportal.",
    ctaLabel: "Jetzt bewerben",
  });
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(".yd-kr-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="yd-kr">
      <header className="yd-kr-topbar">
        <div className="yd-kr-container yd-kr-topbar-inner">
          <span className="yd-kr-logo">
            <span className="yd-kr-logo-dot" />
            {PRACTICE.name}
          </span>
          <div className="yd-kr-topbar-cta">
            <a href={PRACTICE.phoneHref} className="yd-kr-btn yd-kr-btn--ghost yd-kr-btn--sm">
              {PRACTICE.phoneDisplay}
            </a>
            <a href={PRACTICE.contactUrl} className="yd-kr-btn yd-kr-btn--primary yd-kr-btn--sm">
              Jetzt bewerben
            </a>
          </div>
        </div>
      </header>

      {/* 1 — Hero */}
      <section className="yd-kr-hero">
        <div className="yd-kr-container yd-kr-hero-grid">
          <div>
            <span className="yd-kr-eyebrow">{content.eyebrow}</span>
            <h1 className="yd-kr-hero-title">{content.headline}</h1>
            <p className="yd-kr-hero-lead">{content.subheadline}</p>
            <div className="yd-kr-hero-ctas">
              <a href={PRACTICE.contactUrl} className="yd-kr-btn yd-kr-btn--primary">
                {content.ctaLabel}
              </a>
              <button type="button" className="yd-kr-btn yd-kr-btn--ghost" onClick={() => scrollToId("rollen")}>
                Offene Profile ansehen
              </button>
            </div>
          </div>

          <div className="yd-kr-hero-visual">
            <div className="yd-kr-hero-frame">
              <Image
                src={UNSPLASH("1606811971618-4486d14f3f99")}
                alt="Team in einer modernen Zahnarztpraxis"
                width={800}
                height={720}
                priority
              />
              <span className="yd-kr-hero-badge">
                <Sparkles size={14} />
                Familiäres Team
              </span>
              <div className="yd-kr-team-ring">
                <strong>48h</strong>
                <span>Rückmeldung</span>
              </div>
            </div>
          </div>
        </div>

        <div className="yd-kr-container">
          <div className="yd-kr-stat-strip">
            {STATS.map((s) => (
              <div key={s.label} className="yd-kr-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2 — Rollen */}
      <section className="yd-kr-section" id="rollen">
        <div className="yd-kr-container">
          <Reveal>
            <div className="yd-kr-head">
              <span className="yd-kr-kicker">Wen wir suchen</span>
              <h2 className="yd-kr-title">Offene Profile in unserer Praxis.</h2>
            </div>
            <StaggerRow className="yd-kr-role-grid">
              {ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.label} className="yd-kr-role-card">
                    <span className="yd-kr-role-icon">
                      <Icon size={17} strokeWidth={1.8} />
                    </span>
                    <span>{r.label}</span>
                  </div>
                );
              })}
            </StaggerRow>
          </Reveal>
        </div>
      </section>

      {/* 3 — Benefits */}
      <section className="yd-kr-section" style={{ background: "var(--kr-warm)" }} id="benefits">
        <div className="yd-kr-container">
          <Reveal>
            <div className="yd-kr-head">
              <span className="yd-kr-kicker">Warum bei uns</span>
              <h2 className="yd-kr-title">Was unsere Praxis attraktiv macht.</h2>
            </div>
            <StaggerRow className="yd-kr-benefit-grid">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="yd-kr-benefit-card">
                    <span className="yd-kr-benefit-icon">
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                    <h3>{b.title}</h3>
                  </div>
                );
              })}
            </StaggerRow>
          </Reveal>
        </div>
      </section>

      {/* 4 — FAQ */}
      <section className="yd-kr-section" id="faq">
        <div className="yd-kr-container">
          <Reveal>
            <div className="yd-kr-head">
              <span className="yd-kr-kicker">Häufige Fragen</span>
              <h2 className="yd-kr-title">Was Bewerber:innen uns am häufigsten fragen.</h2>
            </div>
            <div className="yd-kr-faq">
              {FAQ.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5 — CTA */}
      <section className="yd-kr-section" id="cta">
        <div className="yd-kr-container">
          <Reveal>
            <div className="yd-kr-cta-band">
              <CalendarClock size={20} style={{ marginBottom: 12, opacity: 0.85 }} />
              <h2>Lust, uns kennenzulernen?</h2>
              <p>Schreiben Sie uns kurz, wer Sie sind und was Sie suchen. Wir melden uns persönlich zurück.</p>
              <div className="yd-kr-cta-buttons">
                <a href={PRACTICE.contactUrl} className="yd-kr-btn yd-kr-btn--primary">
                  Jetzt bewerben
                </a>
                <a href={PRACTICE.phoneHref} className="yd-kr-btn yd-kr-btn--ghost">
                  {PRACTICE.phoneDisplay} anrufen
                </a>
              </div>
              <p className="yd-kr-cta-note">Auch Initiativbewerbungen sind willkommen.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="yd-kr-footer">
        <div className="yd-kr-container">
          <p>
            {PRACTICE.name} — {PRACTICE.address} · {PRACTICE.phoneDisplay}
          </p>
        </div>
      </footer>

      <div className={`yd-kr-sticky-cta ${stickyVisible ? "yd-kr-sticky-cta--visible" : ""}`}>
        <a href={PRACTICE.phoneHref} className="yd-kr-btn yd-kr-btn--ghost yd-kr-btn--sm">
          Anrufen
        </a>
        <a href={PRACTICE.contactUrl} className="yd-kr-btn yd-kr-btn--primary yd-kr-btn--sm">
          Jetzt bewerben
        </a>
      </div>
    </main>
  );
}
