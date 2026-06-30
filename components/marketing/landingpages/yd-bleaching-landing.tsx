"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Droplets, Home, Sparkles, Sun } from "lucide-react";

import { usePracticeOverride } from "@/lib/marketing/landingpages/use-practice-override";
import { useLandingPreviewContent } from "@/lib/marketing/landingpages/landing-preview-content";

/**
 * Vorlage "Bleaching" — eigenständiger Aufbau, eigene Farbidentität (Champagne-Gold/
 * Ivory, siehe app/yd-landingpage-bleaching.css). Methodenkarten statt Vergleichsliste,
 * Vorher/Nachher-Schieberegler statt Zeitleiste. Generisch (GENERIC_PRACTICE).
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
            entry.target.classList.add("yd-bl-reveal--in");
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
    <div ref={ref} className={`yd-bl-reveal ${className ?? ""}`}>
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
              child.classList.add("yd-bl-stagger-item--in");
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
        <div className="yd-bl-stagger-item" key={i}>
          {child}
        </div>
      ))}
    </div>
  );
}

const STATS = [
  { value: "2–4", label: "Helligkeitsstufen möglich" },
  { value: "60", label: "Min. pro In-Office-Sitzung" },
  { value: "1×", label: "Zahnärztliche Kontrolle vorab" },
] as const;

const METHODS = [
  {
    icon: Sun,
    title: "In-Office",
    text: "Behandlung in der Praxis, unter Aufsicht, mit kontrollierter Konzentration.",
    tag: "Schnellste Wirkung",
    featured: true,
  },
  {
    icon: Home,
    title: "Home Bleaching",
    text: "Individuell angefertigte Schiene für die Anwendung zuhause, mit Praxisbegleitung.",
    tag: "Flexibel im Alltag",
    featured: false,
  },
  {
    icon: Droplets,
    title: "Kombination mit Prophylaxe",
    text: "Professionelle Reinigung vor dem Bleaching für ein gleichmäßigeres Ergebnis.",
    tag: "Empfohlener Start",
    featured: false,
  },
] as const;

const FAQ = [
  { q: "Wie lange hält das Ergebnis?", a: "Je nach Ernährung und Pflege meist mehrere Monate bis über ein Jahr. Kaffee, Rotwein und Rauchen beschleunigen das Nachdunkeln." },
  { q: "Schadet Bleaching dem Zahnschmelz?", a: "Bei fachgerechter, zahnärztlich begleiteter Anwendung gilt Bleaching als verträglich. Wir prüfen vorab, ob Karies oder Füllungen behandelt werden müssen." },
  { q: "Werden Kronen oder Füllungen mit aufgehellt?", a: "Nein. Zahnersatz reagiert nicht auf das Bleaching-Mittel, das kann zu sichtbaren Farbunterschieden führen. Wir besprechen das vorab mit Ihnen." },
  { q: "Ist Bleaching schmerzhaft?", a: "Manche Patient:innen spüren vorübergehend empfindliche Zähne. Mit angepasster Konzentration und Pausen lässt sich das meist gut steuern." },
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="yd-bl-faq-item">
      <button type="button" className="yd-bl-faq-q" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {q}
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }} />
      </button>
      <p className={`yd-bl-faq-a ${open ? "yd-bl-faq-a--open" : ""}`}>{a}</p>
    </div>
  );
}

function CompareSlider() {
  const [clip, setClip] = useState(50);
  return (
    <div className="yd-bl-compare-slider" style={{ "--bl-clip": `${clip}%` } as React.CSSProperties}>
      <Image
        src={UNSPLASH("1606811841689-23dfddce3e95")}
        alt="Zähne vor dem Bleaching"
        fill
        sizes="640px"
      />
      <Image
        src={UNSPLASH("1581585095852-9550d2f04b3a")}
        alt="Zähne nach dem Bleaching"
        fill
        sizes="640px"
        className="yd-bl-compare-after"
      />
      <div className="yd-bl-compare-handle" />
      <input
        type="range"
        min={0}
        max={100}
        value={clip}
        onChange={(e) => setClip(Number(e.target.value))}
        className="yd-bl-compare-input"
        aria-label="Vorher-Nachher-Vergleich verschieben"
      />
      <span className="yd-bl-compare-label yd-bl-compare-label--before">Vorher</span>
      <span className="yd-bl-compare-label yd-bl-compare-label--after">Nachher</span>
    </div>
  );
}

export function YdBleachingLanding() {
  const PRACTICE = usePracticeOverride();
  const content = useLandingPreviewContent({
    eyebrow: `Bleaching · ${PRACTICE.city}`,
    headline: "Ein helleres Lächeln, fachlich begleitet.",
    subheadline:
      "Professionelles Bleaching hellt die natürliche Zahnfarbe sichtbar auf. Wir prüfen vorab, was zu Ihren Zähnen passt, und begleiten die Behandlung von Anfang bis Ende.",
    ctaLabel: "Bleaching-Beratung vereinbaren",
  });
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(".yd-bl-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="yd-bl">
      <header className="yd-bl-topbar">
        <div className="yd-bl-container yd-bl-topbar-inner">
          <span className="yd-bl-logo">
            <span className="yd-bl-logo-dot" />
            {PRACTICE.name}
          </span>
          <div className="yd-bl-topbar-cta">
            <a href={PRACTICE.phoneHref} className="yd-bl-btn yd-bl-btn--ghost yd-bl-btn--sm">
              {PRACTICE.phoneDisplay}
            </a>
            <a href={PRACTICE.contactUrl} className="yd-bl-btn yd-bl-btn--primary yd-bl-btn--sm">
              {content.ctaLabel}
            </a>
          </div>
        </div>
      </header>

      {/* 1 — Hero */}
      <section className="yd-bl-hero">
        <div className="yd-bl-container yd-bl-hero-grid">
          <div>
            <span className="yd-bl-eyebrow">{content.eyebrow}</span>
            <h1 className="yd-bl-hero-title">{content.headline}</h1>
            <p className="yd-bl-hero-lead">{content.subheadline}</p>
            <div className="yd-bl-hero-ctas">
              <a href={PRACTICE.contactUrl} className="yd-bl-btn yd-bl-btn--primary">
                {content.ctaLabel}
              </a>
              <button type="button" className="yd-bl-btn yd-bl-btn--ghost" onClick={() => scrollToId("methoden")}>
                Methoden ansehen
              </button>
            </div>
          </div>

          <div className="yd-bl-hero-visual">
            <div className="yd-bl-hero-frame">
              <Image
                src={UNSPLASH("1598256989800-fe5f95da9787")}
                alt="Strahlendes Lächeln nach professionellem Bleaching"
                width={800}
                height={720}
                priority
              />
              <span className="yd-bl-hero-badge">
                <Sparkles size={14} />
                Medizinisch begleitet
              </span>
              <div className="yd-bl-shade">
                <strong>B1</strong>
                <span>Zielfarbe</span>
              </div>
            </div>
          </div>
        </div>

        <div className="yd-bl-container">
          <div className="yd-bl-stat-strip">
            {STATS.map((s) => (
              <div key={s.label} className="yd-bl-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2 — Methodenkarten */}
      <section className="yd-bl-section" id="methoden">
        <div className="yd-bl-container">
          <Reveal>
            <div className="yd-bl-head">
              <span className="yd-bl-kicker">Methoden</span>
              <h2 className="yd-bl-title">Drei Wege zu einem helleren Lächeln.</h2>
            </div>
            <StaggerRow className="yd-bl-method-grid">
              {METHODS.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.title} className={`yd-bl-method-card ${m.featured ? "yd-bl-method-card--featured" : ""}`}>
                    <div className="yd-bl-method-icon">
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                    <span className="yd-bl-method-tag">{m.tag}</span>
                  </div>
                );
              })}
            </StaggerRow>
          </Reveal>
        </div>
      </section>

      {/* 3 — Vorher/Nachher */}
      <section className="yd-bl-section" style={{ background: "var(--bl-warm)" }} id="ergebnis">
        <div className="yd-bl-container">
          <Reveal>
            <div className="yd-bl-head">
              <span className="yd-bl-kicker">Sichtbares Ergebnis</span>
              <h2 className="yd-bl-title">Bewegen Sie den Regler.</h2>
              <p className="yd-bl-lead">Beispielhafte Darstellung, das tatsächliche Ergebnis hängt von Ihrer Ausgangszahnfarbe ab.</p>
            </div>
            <CompareSlider />
          </Reveal>
        </div>
      </section>

      {/* 4 — FAQ */}
      <section className="yd-bl-section" id="faq">
        <div className="yd-bl-container">
          <Reveal>
            <div className="yd-bl-head">
              <span className="yd-bl-kicker">Häufige Fragen</span>
              <h2 className="yd-bl-title">Was Patient:innen vor dem Bleaching wissen wollen.</h2>
            </div>
            <div className="yd-bl-faq">
              {FAQ.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5 — CTA */}
      <section className="yd-bl-section" id="cta">
        <div className="yd-bl-container">
          <Reveal>
            <div className="yd-bl-cta-band">
              <Sparkles size={20} style={{ marginBottom: 12, opacity: 0.85 }} />
              <h2>Bereit für ein helleres Lächeln?</h2>
              <p>Vereinbaren Sie eine Beratung. Wir klären gemeinsam, welche Methode zu Ihren Zähnen passt.</p>
              <div className="yd-bl-cta-buttons">
                <a href={PRACTICE.contactUrl} className="yd-bl-btn yd-bl-btn--primary">
                  Beratung vereinbaren
                </a>
                <a href={PRACTICE.phoneHref} className="yd-bl-btn yd-bl-btn--ghost">
                  {PRACTICE.phoneDisplay} anrufen
                </a>
              </div>
              <p className="yd-bl-cta-note">Ergebnis und Eignung werden vorab zahnärztlich geprüft.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="yd-bl-footer">
        <div className="yd-bl-container">
          <p>
            {PRACTICE.name} — {PRACTICE.address} · {PRACTICE.phoneDisplay}
          </p>
        </div>
      </footer>

      <div className={`yd-bl-sticky-cta ${stickyVisible ? "yd-bl-sticky-cta--visible" : ""}`}>
        <a href={PRACTICE.phoneHref} className="yd-bl-btn yd-bl-btn--ghost yd-bl-btn--sm">
          Anrufen
        </a>
        <a href={PRACTICE.contactUrl} className="yd-bl-btn yd-bl-btn--primary yd-bl-btn--sm">
          Beratung anfragen
        </a>
      </div>
    </main>
  );
}
