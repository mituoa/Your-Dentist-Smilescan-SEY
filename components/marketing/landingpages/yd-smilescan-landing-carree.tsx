"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarCheck,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  MessageCircle,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

/**
 * Vorlage "SmileScan" — zweites reales Beispiel auf Basis der Aligner-Premium-Vorlage
 * (gleiches .yd-al-* Design-System aus app/yd-landingpage-aligner.css).
 * Carree Dental, Köln Brück. SmileScan ist ein unverbindlicher Foto-Check vor der
 * Erstberatung — ausdrücklich KEIN automatisiertes Diagnosetool und KEIN Ersatz für
 * eine zahnärztliche Untersuchung.
 */

const PHONE_DISPLAY = "0221 9842700";
const PHONE_HREF = "tel:+492219842700";
const CONTACT_URL = "https://carree-dental.de/kontakt/";
const ADDRESS = "Brücker Mauspfad 611, 51109 Köln (Brück)";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
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
            entry.target.classList.add("yd-al-reveal--in");
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
    <div ref={ref} className={`yd-al-reveal ${className ?? ""}`}>
      {children}
    </div>
  );
}

/** Staggert die Kinder eines Grids beim Sichtbarwerden — 60ms pro Karte. */
function StaggerGrid({ children, className }: { children: React.ReactNode[]; className?: string }) {
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
              child.classList.add("yd-al-stagger-item--in");
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
        <div className="yd-al-stagger-item" key={i}>
          {child}
        </div>
      ))}
    </div>
  );
}

/** Karte mit dezentem Cursor-Licht — folgt der Maus, navy/blau getönt. */
function GlowCard({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--gx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--gy", `${e.clientY - rect.top}px`);
  }, []);
  return (
    <div ref={ref} className={`yd-al-glow-card ${className ?? ""}`} onMouseMove={onMove}>
      {children}
    </div>
  );
}

/** Zählt den numerischen Anteil eines Werts wie "24h" oder "4,9★" hoch, Rest bleibt statisch. */
function CountUpStat({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const match = value.match(/^([\d.,]+)(.*)$/);
  const numPart = match?.[1] ?? "";
  const suffix = match?.[2] ?? "";
  const isDecimal = numPart.includes(",");
  const target = parseFloat(numPart.replace(/\./g, "").replace(",", "."));
  const [display, setDisplay] = useState(reduced || !match ? numPart : "0");
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !match || reduced) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const duration = 900;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              const current = eased * target;
              setDisplay(
                isDecimal
                  ? current.toFixed(1).replace(".", ",")
                  : Math.round(current).toLocaleString("de-DE")
              );
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced, match, target, isDecimal]);

  if (!match) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/** Swipebare Slideshow (Touch + Pfeile + Dots + Auto-Advance, pausiert bei Interaktion). */
function ScanCarousel({
  slides,
}: {
  slides: { title: string; text: string; img: string }[];
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const total = slides.length;

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setIndex((v) => (v + 1) % total), 4500);
    return () => window.clearInterval(id);
  }, [reduced, total]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      setIndex((v) => (delta < 0 ? (v + 1) % total : (v - 1 + total) % total));
    }
    touchStartX.current = null;
  };

  return (
    <div className="yd-al-carousel">
      <div className="yd-al-carousel-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="yd-al-carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((s) => (
            <div key={s.title} className="yd-al-carousel-slide">
              <Image src={s.img} alt={s.title} width={760} height={480} />
              <div className="yd-al-carousel-slide-body">
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="yd-al-carousel-arrow yd-al-carousel-arrow--prev"
        aria-label="Vorheriges Bild"
        onClick={() => setIndex((v) => (v - 1 + total) % total)}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        className="yd-al-carousel-arrow yd-al-carousel-arrow--next"
        aria-label="Nächstes Bild"
        onClick={() => setIndex((v) => (v + 1) % total)}
      >
        <ChevronRight size={18} />
      </button>

      <div className="yd-al-carousel-dots">
        {slides.map((s, i) => (
          <button
            key={s.title}
            type="button"
            className={`yd-al-carousel-dot ${i === index ? "is-active" : ""}`}
            aria-label={`Zu Bild ${i + 1} springen`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

const TRUST_PILLS = [
  { icon: ShieldCheck, label: "Kein Ersatz für Untersuchung" },
  { icon: CalendarCheck, label: "Rückmeldung in 24h" },
  { icon: MessageCircle, label: "Kostenlos & unverbindlich" },
  { icon: Lock, label: "Datenschutzkonform" },
];

const BENEFITS = [
  { icon: Camera, title: "Ein Foto genügt", text: "Ein einfaches Selfie Ihres Lächelns reicht für die erste Einordnung." },
  { icon: ScanLine, title: "Strukturierte Einschätzung", text: "Unser Praxisteam sichtet Ihr Foto und ordnet es fachlich ein." },
  { icon: CalendarCheck, title: "Klare nächste Schritte", text: "Sie erhalten eine Rückmeldung und einen passenden Terminvorschlag." },
  { icon: ShieldCheck, title: "Ärztlich verantwortet", text: "Keine automatisierte Diagnose — die fachliche Einordnung bleibt beim Praxisteam." },
] as const;

const PROCESS = [
  { title: "Foto hochladen", text: "Senden Sie ein Foto Ihres Lächelns über das SmileScan-Formular." },
  { title: "Kurzer Fragebogen", text: "Ein paar Angaben zu Ihrem Anliegen — dauert unter zwei Minuten." },
  { title: "Praxisteam sichtet", text: "Carree Dental ordnet Ihr Foto strukturiert ein, ohne Ferndiagnose." },
  { title: "Persönliche Rückmeldung", text: "Sie erhalten eine erste Einschätzung und einen Terminvorschlag." },
] as const;

const UNSPLASH = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=760&auto=format&fit=crop`;

const SEGMENTS = [
  { title: "Zahnstellung", text: "Erste Einordnung sichtbarer Engstände oder Lücken.", img: UNSPLASH("1670250492416-570b5b7343b1") },
  { title: "Verfärbungen", text: "Hinweise zu Verfärbungen, die optisch auffallen.", img: UNSPLASH("1677026010083-78ec7f1b84ed") },
  { title: "Symmetrie & Lächeln", text: "Wie Lächeln und Zahnreihen im Gesamtbild wirken.", img: UNSPLASH("1489278353717-f64c6ee8a4d2") },
] as const;

const FAQ = [
  { q: "Ist SmileScan eine Diagnose?", a: "Nein. SmileScan ist eine erste, unverbindliche Einordnung anhand eines Fotos durch unser Praxisteam — keine automatisierte oder zahnärztliche Diagnose. Diese erfolgt ausschließlich bei einer persönlichen Untersuchung in der Praxis." },
  { q: "Was passiert mit meinem Foto?", a: "Ihr Foto wird ausschließlich zur Beratung im Rahmen von SmileScan verwendet und vertraulich behandelt. Details erläutern wir Ihnen gerne im persönlichen Gespräch." },
  { q: "Wie schnell bekomme ich eine Rückmeldung?", a: "In der Regel innerhalb von 24 Stunden an Werktagen." },
  { q: "Kostet SmileScan etwas?", a: "Nein, die erste Foto-Einordnung ist kostenlos und unverbindlich." },
  { q: "Brauche ich trotzdem einen Termin?", a: "Ja. SmileScan ersetzt keine zahnärztliche Untersuchung — es hilft Ihnen, vorab einzuschätzen, ob und welcher Termin sinnvoll ist." },
  { q: "Welches Foto eignet sich am besten?", a: "Ein gut beleuchtetes Foto mit offenem, entspanntem Lächeln frontal zur Kamera — ähnlich einem Selfie." },
] as const;

const TRUST_NOTES = [
  { icon: Stethoscope, text: "Fachliche Einordnung durch das Praxisteam, nicht durch eine Software." },
  { icon: ShieldCheck, text: "Keine automatisierte Diagnose." },
  { icon: Lock, text: "Vertrauliche, datenschutzkonforme Verarbeitung." },
  { icon: CalendarCheck, text: "Ersetzt keine zahnärztliche Untersuchung." },
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="yd-al-faq-item">
      <button type="button" className="yd-al-faq-q" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {q}
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }} />
      </button>
      <p className={`yd-al-faq-a ${open ? "yd-al-faq-a--open" : ""}`}>{a}</p>
    </div>
  );
}

export function YdSmileScanLandingCarree() {
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(".yd-al-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="yd-al">
      <header className="yd-al-topbar">
        <div className="yd-al-container yd-al-topbar-inner">
          <Image src="/landingpages/aligner/logo.png" alt="Carree Dental" width={140} height={35} className="yd-al-logo" priority />
          <div className="yd-al-topbar-cta">
            <a href={PHONE_HREF} className="yd-al-btn yd-al-btn--ghost yd-al-btn--sm">
              {PHONE_DISPLAY}
            </a>
            <a href={CONTACT_URL} target="_blank" rel="noopener" className="yd-al-btn yd-al-btn--primary yd-al-btn--sm">
              SmileScan starten
            </a>
          </div>
        </div>
      </header>

      {/* 1 — Hero */}
      <section className="yd-al-hero">
        <div className="yd-al-container yd-al-hero-grid">
          <div>
            <span className="yd-al-eyebrow yd-al-hero-stagger" style={{ transitionDelay: "0ms" }}>
              SmileScan · Köln Brück
            </span>
            <h1 className="yd-al-hero-title yd-al-hero-stagger" style={{ transitionDelay: "70ms" }}>
              Ein Foto. <em>Eine ehrliche erste Einordnung.</em>
            </h1>
            <p className="yd-al-hero-lead yd-al-hero-stagger" style={{ transitionDelay: "140ms" }}>
              Mit SmileScan schicken Sie uns ein Foto Ihres Lächelns — unser Praxisteam ordnet es
              persönlich ein und meldet sich mit einer ersten Einschätzung, bevor Sie einen Termin
              vereinbaren.
            </p>
            <div className="yd-al-hero-ctas yd-al-hero-stagger" style={{ transitionDelay: "210ms" }}>
              <a href={CONTACT_URL} target="_blank" rel="noopener" className="yd-al-btn yd-al-btn--glow">
                <span>SmileScan jetzt starten</span>
              </a>
              <button type="button" className="yd-al-btn yd-al-btn--ghost" onClick={() => scrollToId("ablauf")}>
                So funktioniert's
              </button>
            </div>
            <div className="yd-al-pill-row yd-al-hero-stagger" style={{ transitionDelay: "280ms" }}>
              {TRUST_PILLS.map((p) => {
                const Icon = p.icon;
                return (
                  <span key={p.label} className="yd-al-pill">
                    <Icon size={13} strokeWidth={2} />
                    {p.label}
                  </span>
                );
              })}
            </div>
            <div className="yd-al-hero-stats yd-al-hero-stagger" style={{ transitionDelay: "340ms" }}>
              <div className="yd-al-hero-stat">
                <strong><CountUpStat value="24h" /></strong>
                <span>Antwortzeit</span>
              </div>
              <div className="yd-al-hero-stat">
                <strong><CountUpStat value="0€" /></strong>
                <span>Kosten für SmileScan</span>
              </div>
              <div className="yd-al-hero-stat">
                <strong><CountUpStat value="4,9★" /></strong>
                <span>Google-Bewertung</span>
              </div>
            </div>
          </div>

          <div className="yd-al-hero-visual">
            <div className="yd-al-hero-frame">
              <Image
                src="https://images.unsplash.com/photo-1713812956759-371b4e8fc468?q=80&w=800&auto=format&fit=crop"
                alt="Patientin macht ein Foto ihres Lächelns für SmileScan"
                width={760}
                height={874}
                priority
              />
              <span className="yd-al-hero-badge">Kostenlos &amp; unverbindlich</span>
            </div>
            <div className="yd-al-hero-caption">
              <span className="yd-al-hero-caption-icon">
                <Sparkles size={15} />
              </span>
              <div>
                <p>SmileScan — Foto-Check vor der Erstberatung</p>
                <span>Carree Dental · Köln Brück</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Warum SmileScan */}
      <section className="yd-al-section" id="warum">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Warum SmileScan</span>
              <h2 className="yd-al-title">Bevor Sie einen Termin vereinbaren, wissen Sie schon mehr.</h2>
              <p className="yd-al-lead">
                SmileScan ist ein einfacher erster Schritt — unverbindlich, kostenlos und ohne
                automatisierte Diagnose.
              </p>
            </div>
            <StaggerGrid className="yd-al-benefit-grid">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <GlowCard key={b.title} className="yd-al-benefit-card">
                    <span className="yd-al-benefit-icon">
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                    <h3>{b.title}</h3>
                    <p>{b.text}</p>
                  </GlowCard>
                );
              })}
            </StaggerGrid>
          </Reveal>
        </div>
      </section>

      {/* 3 — Was SmileScan einordnet (Diashow) */}
      <section className="yd-al-section" style={{ background: "var(--al-warm)" }} id="was-wir-pruefen">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Was SmileScan einordnet</span>
              <h2 className="yd-al-title">Vier Aspekte, ein erster Überblick.</h2>
            </div>
            <ScanCarousel slides={[...SEGMENTS]} />
          </Reveal>
        </div>
      </section>

      {/* 4 — Ablauf */}
      <section className="yd-al-section" id="ablauf">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">So funktioniert's</span>
              <h2 className="yd-al-title">Vier Schritte bis zur Rückmeldung.</h2>
            </div>
            <StaggerGrid className="yd-al-process">
              {PROCESS.map((p, i) => (
                <div key={p.title} className="yd-al-process-step">
                  <span className="yd-al-process-num">{i + 1}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              ))}
            </StaggerGrid>
          </Reveal>
        </div>
      </section>

      {/* 5 — Vertrauen & Grenzen */}
      <section className="yd-al-section" style={{ background: "var(--al-warm)" }} id="vertrauen">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Wichtig zu wissen</span>
              <h2 className="yd-al-title">Ehrlich eingeordnet, nicht automatisch diagnostiziert.</h2>
              <p className="yd-al-lead">
                SmileScan ist ein erster Anhaltspunkt von Menschen für Menschen — keine
                Software-Diagnose und kein Ersatz für eine zahnärztliche Untersuchung.
              </p>
            </div>
            <div className="yd-al-trust-grid">
              {TRUST_NOTES.map((t) => {
                const Icon = t.icon;
                return (
                  <div key={t.text} className="yd-al-trust-item">
                    <Icon size={18} strokeWidth={1.8} />
                    <p>{t.text}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6 — FAQ */}
      <section className="yd-al-section" id="faq">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Häufige Fragen</span>
              <h2 className="yd-al-title">Was Patient:innen zu SmileScan am häufigsten fragen.</h2>
            </div>
            <div className="yd-al-faq">
              {FAQ.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7 — Praxis */}
      <section className="yd-al-section" id="praxis">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Praxis</span>
              <h2 className="yd-al-title">Carree Dental, Köln Brück.</h2>
            </div>
            <div className="yd-al-practice-room">
              <Image src="/landingpages/aligner/practice-room.jpg" alt="Behandlungsraum bei Carree Dental mit Gartenblick" fill style={{ objectFit: "cover" }} />
              <div className="yd-al-practice-room-overlay">
                <p>Helle, moderne Behandlungsräume mit Gartenblick — Brücker Mauspfad, Köln Brück.</p>
              </div>
            </div>
            <div className="yd-al-team-strip">
              <Image src="/landingpages/aligner/team-banner.png" alt="Team von Carree Dental" width={2560} height={751} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8 — CTA Abschluss */}
      <section className="yd-al-section" id="cta">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-cta-band">
              <h2>Bereit für Ihren SmileScan?</h2>
              <p>
                Senden Sie uns ein Foto Ihres Lächelns und erhalten Sie eine erste, unverbindliche
                Einschätzung von Carree Dental in Köln Brück.
              </p>
              <div className="yd-al-cta-buttons">
                <a href={CONTACT_URL} target="_blank" rel="noopener" className="yd-al-btn yd-al-btn--glow yd-al-btn--glow-light">
                  <span>SmileScan jetzt starten</span>
                </a>
                <a href={PHONE_HREF} className="yd-al-btn yd-al-btn--ghost">
                  {PHONE_DISPLAY} anrufen
                </a>
              </div>
              <p className="yd-al-cta-note">Kostenlos &amp; unverbindlich · ersetzt keine zahnärztliche Untersuchung</p>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="yd-al-footer">
        <div className="yd-al-container">
          <p>
            Carree Dental — {ADDRESS} · {PHONE_DISPLAY} ·{" "}
            <a href="https://carree-dental.de/impressum/" target="_blank" rel="noopener">
              Impressum
            </a>{" "}
            ·{" "}
            <a href="https://carree-dental.de/datenschutzerklaerung/" target="_blank" rel="noopener">
              Datenschutz
            </a>
          </p>
        </div>
      </footer>

      <div className={`yd-al-sticky-cta ${stickyVisible ? "yd-al-sticky-cta--visible" : ""}`}>
        <a href={PHONE_HREF} className="yd-al-btn yd-al-btn--ghost yd-al-btn--sm">
          Anrufen
        </a>
        <a href={CONTACT_URL} target="_blank" rel="noopener" className="yd-al-btn yd-al-btn--primary yd-al-btn--sm">
          SmileScan starten
        </a>
      </div>
    </main>
  );
}
