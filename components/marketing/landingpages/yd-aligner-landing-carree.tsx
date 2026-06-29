"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Vorlage "Aligner" — erstes reales Beispiel: Carree Dental, Köln Brück.
 * Eigenständige Ads-Landingpage (kein /relay-Workflow), echte Inhalte/Fotos
 * von carree-dental.de übernommen (mit Freigabe der Praxis).
 */

const PHONE_DISPLAY = "0221 9842700";
const PHONE_HREF = "tel:+492219842700";
const CONTACT_URL = "https://carree-dental.de/kontakt/";
const ADDRESS = "Brücker Mauspfad 611, 51109 Köln (Brück)";

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

/** Staggert die Kinder eines Grids beim Sichtbarwerden — 50ms pro Karte. */
function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode[];
  className?: string;
}) {
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

/** Zählt einmalig hoch, sobald sichtbar. */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const duration = 1000;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              setDisplay(Math.round(eased * to));
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
  }, [to]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
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

const PRESS = [
  { src: "press-focus.png", alt: "Focus" },
  { src: "press-faz.png", alt: "FAZ" },
  { src: "press-rtl.png", alt: "RTL" },
  { src: "press-bunte.png", alt: "Bunte" },
  { src: "press-gq.png", alt: "GQ" },
  { src: "press-gala.png", alt: "Gala" },
  { src: "press-sz.png", alt: "Süddeutsche Zeitung" },
  { src: "press-brigitte.png", alt: "Brigitte" },
];

const BENEFITS = [
  { title: "Fast unsichtbar", text: "Hauchdünne, transparente Aligner — diskret im Beruf, Studium und Alltag." },
  { title: "Herausnehmbar", text: "Zum Essen, Trinken und für wichtige Anlässe einfach herausnehmen." },
  { title: "Schmerzarm", text: "Sanfte Bewegungen von max. 0,3mm pro Schiene — ohne Drücken oder Reiben." },
  { title: "Gute Mundhygiene", text: "Zähneputzen und Zahnseide wie gewohnt, ohne Einschränkungen durch Brackets." },
  { title: "Komplikationsfrei", text: "Keine gelösten Brackets, kein Hängenbleiben an Drähten." },
  { title: "Allergikerfreundlich", text: "Vollständig aus Kunststoff — kein Risiko für Metallallergien." },
];

const SEGMENTS = [
  { title: "Invisalign First", text: "Für Kinder ab ca. 6–7 Jahren — frühzeitige Korrektur von Fehlstellungen.", img: "invisalign-first.png" },
  { title: "Invisalign Teen", text: "Speziell für Jugendliche — flexibel im Schul- und Vereinsalltag.", img: "invisalign-teen.png" },
  { title: "Invisalign Erwachsene", text: "Diskrete Korrektur für Beruf und Alltag — ohne Kompromisse.", img: "invisalign-erwachsene.png" },
];

const PROCESS = [
  { title: "Beratung & Diagnostik", text: "Digitaler Abdruck, DVT-Röntgen und Funktionsanalyse — kostenlose Erstberatung." },
  { title: "Digitale Planung", text: "3D-Simulation Ihres zukünftigen Lächelns, individuell modellierte Aligner." },
  { title: "Aligner-Wechsel", text: "Alle 1–2 Wochen ein neuer Aligner — mindestens 22 Stunden täglich tragen." },
  { title: "Ergebnis & Retention", text: "Nach wenigen Monaten die Zielposition erreicht — Stabilisierung durch Retainer." },
];

const TESTIMONIALS = [
  {
    quote: "Nach fast 2 Jahren Invisalign Behandlung bei Frau Dr. Andersson bin ich mit dem Ergebnis wirklich super zufrieden! Kompetent ist ne nette Kieferorthopädin! Sehr zu empfehlen!",
  },
  {
    quote: "War wegen massiver Kieferprobleme bei Frau Andersson in Behandlung. Sie hat mich sehr gut aufgeklärt, nahm sich viel Zeit für meine Fragen und konnte mir sehr kompetent Auskunft über die Behandlungsoptionen geben.",
  },
  {
    quote: "Ich fühlte mich vom ersten Termin an gut aufgehoben, sowohl von der Kieferorthopädin als auch Mitarbeitern. Frau Dr. Andersson hat eine sehr angenehme Art mit ihren Patienten zu sprechen.",
  },
];

const FAQ = [
  { q: "Wie lange dauert eine Invisalign-Behandlung?", a: "Die Dauer hängt von der Schwere der Zahnfehlstellung ab, typischerweise zwischen 3 und 18 Monaten." },
  { q: "Kann ich die Aligner zum Essen herausnehmen?", a: "Ja. Die Aligner können zum Essen, Trinken und Zähneputzen herausgenommen werden. Wichtig ist, die empfohlene Tragezeit von mindestens 22 Stunden täglich einzuhalten." },
  { q: "Tut die Behandlung weh?", a: "Es kann zu leichten Druckgefühlen kommen, die nach wenigen Tagen verschwinden. Aligner sind durch das Smart-Track-Material deutlich komfortabler als klassische Zahnspangen." },
  { q: "Was kostet die unsichtbare Zahnspange?", a: "Eine einfache Korrektur beginnt ab 150€ monatlich zzgl. Laborkosten. Im kostenlosen Beratungsgespräch erhalten Sie eine genaue Kostenübersicht und mögliche Finanzierungsoptionen." },
  { q: "Übernimmt die Krankenkasse die Kosten?", a: "Gesetzliche Krankenkassen bezuschussen Invisalign grundsätzlich nicht — die Behandlung ist privat zu finanzieren. Privat Versicherte erhalten je nach Vertrag eine vollständige oder teilweise Erstattung." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="yd-al-faq-item">
      <button type="button" className="yd-al-faq-q" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {q}
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
      </button>
      {open ? <p className="yd-al-faq-a">{a}</p> : null}
    </div>
  );
}

export function YdAlignerLandingCarree() {
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
              Termin vereinbaren
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="yd-al-hero">
        <div className="yd-al-container yd-al-hero-grid">
          <div>
            <span className="yd-al-eyebrow yd-al-hero-stagger" style={{ transitionDelay: "0ms" }}>
              Invisalign® · Köln Brück
            </span>
            <h1 className="yd-al-hero-title yd-al-hero-stagger" style={{ transitionDelay: "70ms" }}>
              Unsichtbare Zahnkorrektur — <em>sichtbarer Erfolg.</em>
            </h1>
            <p className="yd-al-hero-lead yd-al-hero-stagger" style={{ transitionDelay: "140ms" }}>
              Transparente, herausnehmbare Aligner statt klassischer Zahnspange. Bei Carree Dental in
              Köln Brück begleitet Sie Kieferorthopädin Frau Dr. Andersson mit über 30 Jahren Erfahrung
              und mehr als 2.000 erfolgreichen Aligner-Behandlungen.
            </p>
            <div className="yd-al-hero-ctas yd-al-hero-stagger" style={{ transitionDelay: "210ms" }}>
              <a href={CONTACT_URL} target="_blank" rel="noopener" className="yd-al-btn yd-al-btn--glow">
                <span>Kostenlose Erstberatung</span>
              </a>
              <a href={PHONE_HREF} className="yd-al-btn yd-al-btn--ghost">
                {PHONE_DISPLAY} anrufen
              </a>
            </div>
            <div className="yd-al-trust-row yd-al-hero-stagger" style={{ transitionDelay: "280ms" }}>
              <Image src="/landingpages/aligner/google-49.png" alt="4.9 Sterne auf Google" width={120} height={40} />
              <Image src="/landingpages/aligner/jameda.png" alt="Bewertung auf Jameda" width={90} height={20} />
              <Image src="/landingpages/aligner/invisalign-logo.png" alt="Invisalign Platinum Elite II Provider" width={110} height={28} />
            </div>
          </div>

          <div className="yd-al-hero-visual">
            <Image
              src="/landingpages/aligner/hero-lifestyle.png"
              alt="Patientin setzt einen unsichtbaren Invisalign-Aligner ein"
              width={800}
              height={555}
              priority
            />
            <div className="yd-al-hero-float yd-al-hero-float--top">
              <strong>
                <CountUp to={30} suffix="+" />
              </strong>
              <span>
                Jahre kieferorth.
                <br />
                Erfahrung
              </span>
            </div>
            <div className="yd-al-hero-float yd-al-hero-float--mid">
              <strong>
                <CountUp to={2000} suffix="+" />
              </strong>
              <span>
                erfolgreiche
                <br />
                Behandlungen
              </span>
            </div>
            <span className="yd-al-hero-badge">Invisalign Platinum Elite II Provider</span>
          </div>
        </div>
      </section>

      {/* Press */}
      <section className="yd-al-press">
        <div className="yd-al-container">
          <p className="yd-al-press-label">Bekannt aus</p>
          <StaggerGrid className="yd-al-press-row">
            {PRESS.map((p) => (
              <Image key={p.src} src={`/landingpages/aligner/${p.src}`} alt={p.alt} width={100} height={24} />
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Benefits */}
      <section className="yd-al-section" style={{ background: "var(--al-warm)" }}>
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Vorteile</span>
              <h2 className="yd-al-title">Komfortabel. Alltagstauglich. Fast unsichtbar.</h2>
              <p className="yd-al-lead">
                Invisalign® bewegt Ihre Zähne in kleinen, behutsamen Schritten — ohne Ihren Alltag zu
                beeinträchtigen.
              </p>
            </div>
            <StaggerGrid className="yd-al-benefit-grid">
              {BENEFITS.map((b) => (
                <GlowCard key={b.title} className="yd-al-benefit-card">
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </GlowCard>
              ))}
            </StaggerGrid>
          </Reveal>
        </div>
      </section>

      {/* Segments — echte Fotokarten */}
      <section className="yd-al-section">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Für jedes Alter</span>
              <h2 className="yd-al-title">Zahnkorrekturen sind in jedem Alter möglich.</h2>
            </div>
            <StaggerGrid className="yd-al-segment-grid">
              {SEGMENTS.map((s) => (
                <div key={s.title} className="yd-al-segment-photo-card">
                  <Image src={`/landingpages/aligner/${s.img}`} alt={s.title} width={400} height={220} />
                  <div className="yd-al-segment-photo-body">
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </div>
              ))}
            </StaggerGrid>
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section className="yd-al-section" style={{ background: "var(--al-warm)" }}>
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Ablauf</span>
              <h2 className="yd-al-title">Der Weg zu Ihrem neuen Lächeln.</h2>
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

      {/* SmileView Simulation */}
      <section className="yd-al-section">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-smileview">
              <div>
                <span className="yd-al-kicker">Invisalign® SmileView™</span>
                <h2 className="yd-al-title">Sehen Sie Ihr mögliches Lächeln — in 60 Sekunden.</h2>
                <p className="yd-al-lead">
                  Mit einem einfachen Selfie zeigt Ihnen die offizielle Invisalign SmileView-Simulation,
                  wie Ihr Lächeln nach einer Behandlung aussehen könnte. Unverbindlich und kostenlos.
                </p>
              </div>
              <div className="yd-al-smileview-qr">
                <Image src="/landingpages/aligner/qr-smileview.png" alt="QR-Code zur Invisalign SmileView Simulation" width={160} height={160} />
                <span>QR-Code scannen &amp; starten</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Praxis-Atmosphäre — full-bleed */}
      <section className="yd-al-section" style={{ paddingTop: 0 }}>
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-atmosphere">
              <Image src="/landingpages/aligner/practice-room.jpg" alt="Behandlungsraum bei Carree Dental mit Gartenblick" fill style={{ objectFit: "cover" }} />
              <div className="yd-al-atmosphere-overlay">
                <p>Helle, moderne Behandlungsräume mit Gartenblick — mitten in Köln Brück.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Doctor */}
      <section className="yd-al-section" style={{ background: "var(--al-warm)" }}>
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-doctor">
              <div className="yd-al-doctor-photo">
                <Image src="/landingpages/aligner/dr-andersson.jpg" alt="Frau Dr. Andersson" width={500} height={600} />
              </div>
              <div>
                <p className="yd-al-doctor-name">Frau Dr. Andersson</p>
                <p className="yd-al-doctor-role">Fachzahnärztin für Kieferorthopädie</p>
                <p className="yd-al-doctor-bio">
                  Seit 1999 habe ich über 2.000 Patient:innen mit Hilfe glasklarer Aligner zu einem
                  strahlenden Lächeln verholfen — verliehen mit dem Invisalign Platinum Elite II Status.
                  Ich nehme mir Zeit für jede individuelle Situation, von einfachen Korrekturen bis zu
                  komplexen CMD-Fällen.
                </p>
                <div className="yd-al-doctor-stats">
                  <div className="yd-al-doctor-stat">
                    <strong>30+</strong>
                    <span>Jahre Erfahrung</span>
                  </div>
                  <div className="yd-al-doctor-stat">
                    <strong>2.000+</strong>
                    <span>Aligner-Behandlungen</span>
                  </div>
                  <div className="yd-al-doctor-stat">
                    <strong>Platinum</strong>
                    <span>Elite II Provider</span>
                  </div>
                </div>
                <div className="yd-al-award-row" style={{ justifyContent: "flex-start", marginTop: 20 }}>
                  <Image src="/landingpages/aligner/award-focus.png" alt="Focus-Auszeichnung für hervorragende Zahnmedizin" width={70} height={64} />
                  <Image src="/landingpages/aligner/award-plusx.png" alt="Plus X Award" width={70} height={64} />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Team */}
      <section className="yd-al-section">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Ihr Team</span>
              <h2 className="yd-al-title">Ein erfahrenes Team an Ihrer Seite.</h2>
            </div>
            <div className="yd-al-team-banner">
              <Image src="/landingpages/aligner/team-banner.png" alt="Team von Carree Dental" width={2560} height={751} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pricing */}
      <section className="yd-al-section" style={{ background: "var(--al-warm)" }}>
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Kosten</span>
              <h2 className="yd-al-title">Transparent kalkulierbar.</h2>
            </div>
            <div className="yd-al-pricing-card">
              <p className="yd-al-pricing-value">
                ab 150€ <span>/ Monat zzgl. Laborkosten</span>
              </p>
              <p className="yd-al-pricing-note">
                Gesetzliche Krankenkassen bezuschussen Invisalign-Behandlungen grundsätzlich nicht.
                Privat Versicherte erhalten je nach Vertrag eine vollständige oder teilweise Erstattung.
                Im kostenlosen Beratungsgespräch erstellen wir Ihnen einen persönlichen Kostenvoranschlag.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="yd-al-section">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Patientenstimmen</span>
              <h2 className="yd-al-title">Das sagen unsere Patient:innen.</h2>
            </div>
            <StaggerGrid className="yd-al-testimonial-grid">
              {TESTIMONIALS.map((t) => (
                <GlowCard key={t.quote.slice(0, 24)} className="yd-al-testimonial-card">
                  <p className="yd-al-testimonial-stars">★★★★★</p>
                  <p>„{t.quote}"</p>
                </GlowCard>
              ))}
            </StaggerGrid>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="yd-al-section" style={{ background: "var(--al-warm)" }}>
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">FAQ</span>
              <h2 className="yd-al-title">Häufige Fragen zur unsichtbaren Zahnspange.</h2>
            </div>
            <div className="yd-al-faq">
              {FAQ.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="yd-al-section">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-cta-band">
              <h2>Bereit für Ihr neues Lächeln?</h2>
              <p>
                Vereinbaren Sie jetzt Ihre kostenlose und unverbindliche Erstberatung bei Carree Dental
                in Köln Brück.
              </p>
              <div className="yd-al-cta-buttons">
                <a href={CONTACT_URL} target="_blank" rel="noopener" className="yd-al-btn yd-al-btn--glow yd-al-btn--glow-light">
                  <span>Termin vereinbaren</span>
                </a>
                <a href={PHONE_HREF} className="yd-al-btn yd-al-btn--ghost">
                  {PHONE_DISPLAY} anrufen
                </a>
              </div>
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

      <div className="yd-al-sticky-cta">
        <a href={PHONE_HREF} className="yd-al-btn yd-al-btn--ghost yd-al-btn--sm">
          Anrufen
        </a>
        <a href={CONTACT_URL} target="_blank" rel="noopener" className="yd-al-btn yd-al-btn--primary yd-al-btn--sm">
          Termin vereinbaren
        </a>
      </div>
    </main>
  );
}
