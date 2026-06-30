"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Bone,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Layers,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { GENERIC_PRACTICE } from "@/lib/marketing/landingpages/generic-practice";

/**
 * Vorlage "Implantologie" — generisch, praxisunabhängig (siehe GENERIC_PRACTICE).
 * Gleiches .yd-al-* Design-System wie die Aligner-/SmileScan-Vorlagen. Wird pro
 * Praxis individualisiert, indem `GENERIC_PRACTICE` durch echte Praxisdaten ersetzt
 * bzw. ein Praxis-Objekt vom Typ `LandingpagePractice` injiziert wird.
 */

const PRACTICE = GENERIC_PRACTICE;
const UNSPLASH = (id: string) => `https://images.unsplash.com/photo-${id}?q=80&w=760&auto=format&fit=crop`;

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
                isDecimal ? current.toFixed(1).replace(".", ",") : Math.round(current).toLocaleString("de-DE")
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

function SegmentCarousel({ slides }: { slides: { title: string; text: string; img: string }[] }) {
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
      <button type="button" className="yd-al-carousel-arrow yd-al-carousel-arrow--prev" aria-label="Vorheriges Bild" onClick={() => setIndex((v) => (v - 1 + total) % total)}>
        <ChevronLeft size={18} />
      </button>
      <button type="button" className="yd-al-carousel-arrow yd-al-carousel-arrow--next" aria-label="Nächstes Bild" onClick={() => setIndex((v) => (v + 1) % total)}>
        <ChevronRight size={18} />
      </button>
      <div className="yd-al-carousel-dots">
        {slides.map((s, i) => (
          <button key={s.title} type="button" className={`yd-al-carousel-dot ${i === index ? "is-active" : ""}`} aria-label={`Zu Bild ${i + 1} springen`} onClick={() => setIndex(i)} />
        ))}
      </div>
    </div>
  );
}

const TRUST_PILLS = [
  { icon: ScanLine, label: "3D-Diagnostik vorab" },
  { icon: Stethoscope, label: "Individuelle Eignungsprüfung" },
  { icon: ShieldCheck, label: "Transparente Kostenübersicht" },
  { icon: ClipboardCheck, label: "Persönliche Nachsorge" },
] as const;

const BENEFITS = [
  { icon: Bone, title: "Knochenerhalt", text: "Implantate stützen den Kieferknochen und beugen Knochenabbau vor." },
  { icon: Layers, title: "Natürliches Ergebnis", text: "Form und Farbe stimmen wir auf Ihr Gebiss ab." },
  { icon: ScanLine, title: "Digital geplant", text: "3D-Diagnostik zeigt vorab, wie Implantat und Versorgung sitzen." },
  { icon: Stethoscope, title: "Persönlich begleitet", text: "Von der Eignungsprüfung bis zur Nachsorge an Ihrer Seite." },
] as const;

const PROCESS = [
  { title: "Eignungsprüfung", text: "Untersuchung und 3D-Diagnostik klären, ob und welches Implantat passt." },
  { title: "Implantation", text: "Das Implantat wird unter örtlicher Betäubung in den Kieferknochen gesetzt." },
  { title: "Einheilphase", text: "Das Implantat verwächst über mehrere Wochen mit dem Kieferknochen." },
  { title: "Versorgung", text: "Krone, Brücke oder Prothese wird passgenau auf das Implantat gesetzt." },
] as const;

const SEGMENTS = [
  { title: "Einzelzahnimplantat", text: "Ersatz für einen einzelnen fehlenden Zahn, ohne Nachbarzähne zu beschleifen.", img: UNSPLASH("1593022356769-11f762e25ed9") },
  { title: "Implantatbrücke", text: "Mehrere fehlende Zähne werden auf wenigen Implantaten fest ersetzt.", img: UNSPLASH("1606811971618-4486d14f3f99") },
  { title: "Festsitzender Zahnersatz", text: "Ein zahnloser Kiefer kann auf mehreren Implantaten fest versorgt werden.", img: UNSPLASH("1629909613654-28e377c37b09") },
] as const;

const FAQ = [
  { q: "Wie lange dauert die Behandlung insgesamt?", a: "Von der Eignungsprüfung bis zur fertigen Versorgung vergehen je nach Einheilzeit meist mehrere Monate. Den genauen Ablauf besprechen wir individuell." },
  { q: "Tut die Implantation weh?", a: "Der Eingriff erfolgt unter örtlicher Betäubung. Danach können leichte Beschwerden auftreten, die sich in der Regel gut behandeln lassen." },
  { q: "Was kostet ein Implantat?", a: "Die Kosten hängen von Anzahl der Implantate, Versorgung und individueller Ausgangslage ab. Sie erhalten vorab eine transparente Kostenübersicht." },
  { q: "Übernimmt die Krankenkasse die Kosten?", a: "Gesetzliche Krankenkassen übernehmen in der Regel nur einen Festzuschuss. Die genaue Erstattung klären wir gemeinsam vor Behandlungsbeginn." },
  { q: "Für wen sind Implantate nicht geeignet?", a: "Bestimmte gesundheitliche Voraussetzungen können gegen ein Implantat sprechen. Das klärt die Eignungsprüfung vor Behandlungsbeginn." },
] as const;

const TRUST_NOTES = [
  { icon: ScanLine, text: "3D-Diagnostik vor jeder Behandlungsplanung." },
  { icon: ShieldCheck, text: "Individuelle Einschätzung statt pauschaler Erfolgsversprechen." },
  { icon: ClipboardCheck, text: "Transparente Kostenübersicht vor Behandlungsbeginn." },
  { icon: Stethoscope, text: "Persönliche Nachsorge nach der Implantation." },
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

export function YdImplantologieLanding() {
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(".yd-al-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="yd-al yd-al--implant">
      <header className="yd-al-topbar">
        <div className="yd-al-container yd-al-topbar-inner">
          <span className="yd-al-logo-text">
            <span className="yd-al-logo-text-dot" />
            {PRACTICE.name}
          </span>
          <div className="yd-al-topbar-cta">
            <a href={PRACTICE.phoneHref} className="yd-al-btn yd-al-btn--ghost yd-al-btn--sm">
              {PRACTICE.phoneDisplay}
            </a>
            <a href={PRACTICE.contactUrl} className="yd-al-btn yd-al-btn--primary yd-al-btn--sm">
              Termin vereinbaren
            </a>
          </div>
        </div>
      </header>

      {/* 1 — Hero */}
      <section className="yd-al-hero">
        <div className="yd-al-container yd-al-hero-grid">
          <div>
            <span className="yd-al-eyebrow yd-al-hero-stagger" style={{ transitionDelay: "0ms" }}>
              Implantologie · {PRACTICE.city}
            </span>
            <h1 className="yd-al-hero-title yd-al-hero-stagger" style={{ transitionDelay: "70ms" }}>
              Zahnimplantate. <em>Fest verankert, ruhig geplant.</em>
            </h1>
            <p className="yd-al-hero-lead yd-al-hero-stagger" style={{ transitionDelay: "140ms" }}>
              Ein Zahnimplantat ersetzt die Zahnwurzel und trägt festsitzenden Zahnersatz.
              Wir klären in der Eignungsprüfung, welches Vorgehen zu Ihrer Situation passt.
            </p>
            <div className="yd-al-hero-ctas yd-al-hero-stagger" style={{ transitionDelay: "210ms" }}>
              <a href={PRACTICE.contactUrl} className="yd-al-btn yd-al-btn--glow">
                <span>Eignungsprüfung anfragen</span>
              </a>
              <button type="button" className="yd-al-btn yd-al-btn--ghost" onClick={() => scrollToId("ablauf")}>
                Behandlung ansehen
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
                <strong><CountUpStat value="4" /></strong>
                <span>Behandlungsschritte</span>
              </div>
              <div className="yd-al-hero-stat">
                <strong><CountUpStat value="3D" /></strong>
                <span>Diagnostik vor Planung</span>
              </div>
              <div className="yd-al-hero-stat">
                <strong><CountUpStat value="1" /></strong>
                <span>Individuelle Eignungsprüfung</span>
              </div>
            </div>
          </div>

          <div className="yd-al-hero-visual">
            <div className="yd-al-hero-frame">
              <Image
                src={UNSPLASH("1667133295315-820bb6481730")}
                alt="Zahnärztliche Beratung zur Implantatplanung"
                width={760}
                height={874}
                priority
              />
              <span className="yd-al-hero-badge">3D-Diagnostik inklusive</span>
            </div>
            <div className="yd-al-hero-caption">
              <span className="yd-al-hero-caption-icon">
                <Sparkles size={15} />
              </span>
              <div>
                <p>Implantologie, individuell geplant</p>
                <span>{PRACTICE.name} · {PRACTICE.city}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Warum Implantate */}
      <section className="yd-al-section" id="warum">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Warum Implantate</span>
              <h2 className="yd-al-title">Fest, natürlich, individuell geplant.</h2>
              <p className="yd-al-lead">
                Implantate ersetzen die Zahnwurzel und tragen festsitzenden Zahnersatz.
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

      {/* 3 — Möglichkeiten (Diashow) */}
      <section className="yd-al-section" style={{ background: "var(--al-warm)" }} id="moeglichkeiten">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Möglichkeiten</span>
              <h2 className="yd-al-title">Welche Versorgung passt zu Ihrer Situation?</h2>
            </div>
            <SegmentCarousel slides={[...SEGMENTS]} />
          </Reveal>
        </div>
      </section>

      {/* 4 — Ablauf */}
      <section className="yd-al-section" id="ablauf">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Ablauf der Behandlung</span>
              <h2 className="yd-al-title">Vier Schritte, klar begleitet.</h2>
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

      {/* 5 — Vertrauen */}
      <section className="yd-al-section" style={{ background: "var(--al-warm)" }} id="vertrauen">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Wichtig zu wissen</span>
              <h2 className="yd-al-title">Sorgfältig geplant, nicht pauschal versprochen.</h2>
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
              <h2 className="yd-al-title">Was Patient:innen zu Implantaten am häufigsten fragen.</h2>
            </div>
            <div className="yd-al-faq">
              {FAQ.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7 — CTA Abschluss */}
      <section className="yd-al-section" id="cta">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-cta-band">
              <h2>Bereit für Ihre Eignungsprüfung?</h2>
              <p>
                Vereinbaren Sie eine unverbindliche Beratung. Wir klären, welches Vorgehen zu
                Ihrer Situation passt.
              </p>
              <div className="yd-al-cta-buttons">
                <a href={PRACTICE.contactUrl} className="yd-al-btn yd-al-btn--glow yd-al-btn--glow-light">
                  <span>Eignungsprüfung anfragen</span>
                </a>
                <a href={PRACTICE.phoneHref} className="yd-al-btn yd-al-btn--ghost">
                  {PRACTICE.phoneDisplay} anrufen
                </a>
              </div>
              <p className="yd-al-cta-note">Individuelle Beratung · transparente Kostenübersicht vor Behandlungsbeginn</p>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="yd-al-footer">
        <div className="yd-al-container">
          <p>
            {PRACTICE.name} — {PRACTICE.address} · {PRACTICE.phoneDisplay}
          </p>
        </div>
      </footer>

      <div className={`yd-al-sticky-cta ${stickyVisible ? "yd-al-sticky-cta--visible" : ""}`}>
        <a href={PRACTICE.phoneHref} className="yd-al-btn yd-al-btn--ghost yd-al-btn--sm">
          Anrufen
        </a>
        <a href={PRACTICE.contactUrl} className="yd-al-btn yd-al-btn--primary yd-al-btn--sm">
          Termin vereinbaren
        </a>
      </div>
    </main>
  );
}
