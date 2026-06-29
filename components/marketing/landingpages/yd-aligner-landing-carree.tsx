"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarCheck,
  ChevronDown,
  MessageCircle,
  ScanLine,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

/**
 * Vorlage "Aligner" — erstes reales Beispiel: Carree Dental, Köln Brück.
 * Eigenständige Ads-Landingpage, echte Inhalte/Fotos von carree-dental.de
 * (mit Freigabe der Praxis). Dient als Premium-Referenzvorlage für weitere
 * Your-Dentist-Landingpages.
 */

const PHONE_DISPLAY = "0221 9842700";
const PHONE_HREF = "tel:+492219842700";
const CONTACT_URL = "https://carree-dental.de/kontakt/";
const ADDRESS = "Brücker Mauspfad 611, 51109 Köln (Brück)";

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

const TRUST_PILLS = [
  { icon: Stethoscope, label: "Kieferorthopädisch begleitet" },
  { icon: ScanLine, label: "Digitale Planung" },
  { icon: MessageCircle, label: "Transparente Beratung" },
  { icon: Users, label: "Für Erwachsene & Jugendliche" },
];

const BENEFITS = [
  { icon: Sparkles, title: "Fast unsichtbar", text: "Hauchdünne, transparente Aligner — diskret im Beruf und Alltag." },
  { icon: CalendarCheck, title: "Planbarer Ablauf", text: "Digitale Planung zeigt vorab, wie viele Schienen nötig sind." },
  { icon: Stethoscope, title: "Schmerzarm", text: "Sanfte Bewegungen pro Schiene, ohne Drücken oder Reiben." },
  { icon: ScanLine, title: "Komplikationsfrei", text: "Keine Brackets, keine losen Drähte, herausnehmbar zum Essen." },
];

const SEGMENTS = [
  { title: "Invisalign First", text: "Für Kinder ab ca. 6–7 Jahren — frühzeitige Korrektur von Fehlstellungen.", img: "invisalign-first.png" },
  { title: "Invisalign Teen", text: "Speziell für Jugendliche — flexibel im Schul- und Vereinsalltag.", img: "invisalign-teen.png" },
  { title: "Invisalign Erwachsene", text: "Diskrete Korrektur für Beruf und Alltag — ohne Kompromisse.", img: "invisalign-erwachsene.png" },
];

const PROCESS = [
  { title: "Eignungsprüfung", text: "Erste Untersuchung und Beratung — wir prüfen, ob Aligner für Ihre Zahnsituation geeignet sind." },
  { title: "Digitale Planung", text: "3D-Scan und Simulation Ihres Behandlungsverlaufs, individuell modellierte Aligner." },
  { title: "Aligner-Wechsel", text: "Alle 1–2 Wochen ein neues Set — empfohlene Tragedauer mind. 22 Stunden täglich." },
  { title: "Nachsorge & Retainer", text: "Regelmäßige Kontrolle, danach Stabilisierung des Ergebnisses mit Retainer." },
];

const SYSTEMS = [
  { name: "Invisalign", text: "Marktführer für transparente Aligner — bei uns im Einsatz.", current: true },
  { name: "Spark", text: "Hochästhetische Aligner-Therapie mit besonders klarem Material." },
  { name: "SureSmile", text: "Digitale Zahnkorrektur mit präziser Verlaufsplanung." },
  { name: "ClearCorrect", text: "Transparente Schienen-Therapie für sanfte Korrekturen." },
  { name: "Angel Aligner", text: "Moderne Aligner-Technologie für individuelle Fälle." },
  { name: "Eigenes System", text: "Nach Eignungsprüfung besprechen wir die passende Option." },
];

const TESTIMONIALS = [
  { quote: "Nach fast 2 Jahren Invisalign Behandlung bei Frau Dr. Andersson bin ich mit dem Ergebnis wirklich super zufrieden! Kompetent ist ne nette Kieferorthopädin! Sehr zu empfehlen!" },
  { quote: "War wegen massiver Kieferprobleme bei Frau Andersson in Behandlung. Sie hat mich sehr gut aufgeklärt, nahm sich viel Zeit für meine Fragen und konnte mir sehr kompetent Auskunft über die Behandlungsoptionen geben." },
  { quote: "Ich fühlte mich vom ersten Termin an gut aufgehoben, sowohl von der Kieferorthopädin als auch Mitarbeitern. Frau Dr. Andersson hat eine sehr angenehme Art mit ihren Patienten zu sprechen." },
];

const FAQ = [
  { q: "Wie lange dauert eine Invisalign-Behandlung?", a: "Die Dauer hängt von der Schwere der Zahnfehlstellung ab, typischerweise zwischen 3 und 18 Monaten." },
  { q: "Kann ich die Aligner zum Essen herausnehmen?", a: "Ja. Die Aligner können zum Essen, Trinken und Zähneputzen herausgenommen werden. Wichtig ist, die empfohlene Tragezeit von mindestens 22 Stunden täglich einzuhalten." },
  { q: "Tut die Behandlung weh?", a: "Es kann zu leichten Druckgefühlen kommen, die nach wenigen Tagen verschwinden. Aligner sind durch das Smart-Track-Material deutlich komfortabler als klassische Zahnspangen." },
  { q: "Was kostet die unsichtbare Zahnspange?", a: "Eine einfache Korrektur beginnt ab 150€ monatlich zzgl. Laborkosten. Im kostenlosen Beratungsgespräch erhalten Sie eine genaue Kostenübersicht und mögliche Finanzierungsoptionen." },
  { q: "Übernimmt die Krankenkasse die Kosten?", a: "Gesetzliche Krankenkassen bezuschussen Invisalign grundsätzlich nicht — die Behandlung ist privat zu finanzieren. Privat Versicherte erhalten je nach Vertrag eine vollständige oder teilweise Erstattung." },
  { q: "Was passiert nach der Eignungsprüfung?", a: "Sie erhalten eine individuelle Einschätzung, ob und welches Aligner-System für Ihre Zahnsituation geeignet ist — unverbindlich und ohne Diagnose vor der Untersuchung." },
];

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

export function YdAlignerLandingCarree() {
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
              Invisalign® · Köln Brück
            </span>
            <h1 className="yd-al-hero-title yd-al-hero-stagger" style={{ transitionDelay: "70ms" }}>
              Unsichtbare Zahnkorrektur. <em>Sichtbar mehr Sicherheit.</em>
            </h1>
            <p className="yd-al-hero-lead yd-al-hero-stagger" style={{ transitionDelay: "140ms" }}>
              Transparente Aligner können Zahnfehlstellungen diskret korrigieren. In unserer Praxis
              prüfen wir individuell, welches System zu Ihren Zähnen, Ihrem Alltag und Ihrem
              Behandlungsziel passt.
            </p>
            <div className="yd-al-hero-ctas yd-al-hero-stagger" style={{ transitionDelay: "210ms" }}>
              <a href={CONTACT_URL} target="_blank" rel="noopener" className="yd-al-btn yd-al-btn--glow">
                <span>Kostenlose Erstberatung anfragen</span>
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
                <strong>30+</strong>
                <span>Jahre kieferorth. Erfahrung</span>
              </div>
              <div className="yd-al-hero-stat">
                <strong>2.000+</strong>
                <span>begleitete Aligner-Fälle</span>
              </div>
              <div className="yd-al-hero-stat">
                <strong>4,9★</strong>
                <span>Google-Bewertung</span>
              </div>
            </div>
          </div>

          <div className="yd-al-hero-visual">
            <div className="yd-al-hero-frame">
              <Image
                src="/landingpages/aligner/hero-lifestyle.png"
                alt="Patientin setzt einen unsichtbaren Invisalign-Aligner ein"
                width={760}
                height={874}
                priority
              />
            </div>
            <div className="yd-al-hero-caption">
              <span className="yd-al-hero-caption-icon">
                <Sparkles size={15} />
              </span>
              <div>
                <p>Invisalign Platinum Elite II Provider</p>
                <span>Frau Dr. Andersson · Fachzahnärztin für Kieferorthopädie</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — Warum Aligner */}
      <section className="yd-al-section" id="warum">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Warum Aligner</span>
              <h2 className="yd-al-title">Komfortabel im Alltag, präzise in der Planung.</h2>
              <p className="yd-al-lead">
                Transparente Aligner bewegen Ihre Zähne in kleinen, digital geplanten Schritten —
                ohne feste Brackets oder Drähte.
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

      {/* 3 — Für wen geeignet */}
      <section className="yd-al-section" style={{ background: "var(--al-warm)" }} id="fuer-wen">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Für wen geeignet</span>
              <h2 className="yd-al-title">Zahnkorrekturen sind in jedem Alter möglich.</h2>
            </div>
            <StaggerGrid className="yd-al-segment-grid">
              {SEGMENTS.map((s) => (
                <div key={s.title} className="yd-al-segment-photo-card">
                  <Image src={`/landingpages/aligner/${s.img}`} alt={s.title} width={400} height={200} />
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

      {/* 4 — Ablauf der Behandlung */}
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

      {/* 5 — Systeme / Möglichkeiten */}
      <section className="yd-al-section" style={{ background: "var(--al-warm)" }} id="systeme">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Systeme &amp; Möglichkeiten</span>
              <h2 className="yd-al-title">Welches Aligner-System passt zu Ihnen?</h2>
              <p className="yd-al-lead">
                Wir arbeiten überwiegend mit Invisalign®, prüfen aber je nach Befund auch
                Alternativen — die endgültige Empfehlung erfolgt erst nach Ihrer Eignungsprüfung.
              </p>
            </div>
            <StaggerGrid className="yd-al-system-grid">
              {SYSTEMS.map((s) => (
                <div key={s.name} className={`yd-al-system-card ${s.current ? "yd-al-system-card--current" : ""}`}>
                  {s.current ? <span className="yd-al-system-tag">Bei uns im Einsatz</span> : null}
                  <h3>{s.name}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </StaggerGrid>
          </Reveal>
        </div>
      </section>

      {/* 6 — Behandlungsbeispiele (SmileView statt Vorher/Nachher) */}
      <section className="yd-al-section" id="smileview">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-smileview">
              <div>
                <span className="yd-al-kicker">Invisalign® SmileView™</span>
                <h2 className="yd-al-title">Sehen Sie Ihr mögliches Lächeln — in 60 Sekunden.</h2>
                <p className="yd-al-lead">
                  Mit einem einfachen Selfie zeigt Ihnen die offizielle Invisalign SmileView-Simulation,
                  wie Ihr Lächeln nach einer Behandlung aussehen könnte. Unverbindlich und kostenlos —
                  ersetzt keine zahnärztliche Eignungsprüfung.
                </p>
              </div>
              <div className="yd-al-smileview-qr">
                <Image src="/landingpages/aligner/qr-smileview.png" alt="QR-Code zur Invisalign SmileView Simulation" width={150} height={150} />
                <span>QR-Code scannen &amp; starten</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7 — FAQ */}
      <section className="yd-al-section" style={{ background: "var(--al-warm)" }} id="faq">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Häufige Fragen</span>
              <h2 className="yd-al-title">Was Patient:innen am häufigsten fragen.</h2>
            </div>
            <div className="yd-al-faq">
              {FAQ.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8 — Praxis & Behandlerin */}
      <section className="yd-al-section" id="praxis">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Praxis &amp; Behandlerin</span>
              <h2 className="yd-al-title">Persönlich begleitet, fachlich erfahren.</h2>
            </div>
            <div className="yd-al-practice">
              <div className="yd-al-practice-photo">
                <Image src="/landingpages/aligner/dr-andersson.jpg" alt="Frau Dr. Andersson" width={480} height={600} />
              </div>
              <div>
                <p className="yd-al-practice-name">Frau Dr. Andersson</p>
                <p className="yd-al-practice-role">Fachzahnärztin für Kieferorthopädie</p>
                <p className="yd-al-practice-bio">
                  Seit 1999 begleite ich Patient:innen mit Aligner-Therapien — vom einfachen
                  Korrekturfall bis zu komplexen kieferorthopädischen Situationen. Jede Behandlung
                  beginnt mit einer individuellen Eignungsprüfung, nicht mit einem Versprechen.
                </p>
                <div className="yd-al-practice-stats">
                  <div className="yd-al-practice-stat">
                    <strong>30+</strong>
                    <span>Jahre Erfahrung</span>
                  </div>
                  <div className="yd-al-practice-stat">
                    <strong>2.000+</strong>
                    <span>Aligner-Behandlungen</span>
                  </div>
                  <div className="yd-al-practice-stat">
                    <strong>Platinum</strong>
                    <span>Elite II Provider</span>
                  </div>
                </div>
                <div className="yd-al-practice-awards">
                  <Image src="/landingpages/aligner/award-focus.png" alt="Focus-Auszeichnung für hervorragende Zahnmedizin" width={56} height={52} />
                  <Image src="/landingpages/aligner/award-plusx.png" alt="Plus X Award" width={56} height={52} />
                </div>
              </div>
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

      {/* 9 — CTA Abschluss */}
      <section className="yd-al-section" id="cta">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-cta-band">
              <h2>Bereit für Ihre Eignungsprüfung?</h2>
              <p>
                Vereinbaren Sie jetzt Ihre kostenlose und unverbindliche Erstberatung bei Carree Dental
                in Köln Brück.
              </p>
              <div className="yd-al-cta-buttons">
                <a href={CONTACT_URL} target="_blank" rel="noopener" className="yd-al-btn yd-al-btn--glow yd-al-btn--glow-light">
                  <span>Kostenlose Erstberatung anfragen</span>
                </a>
                <a href={PHONE_HREF} className="yd-al-btn yd-al-btn--ghost">
                  {PHONE_DISPLAY} anrufen
                </a>
              </div>
              <p className="yd-al-cta-note">Behandlung ab 150€/Monat zzgl. Laborkosten · individueller Kostenvoranschlag im Beratungsgespräch</p>
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
          Termin vereinbaren
        </a>
      </div>
    </main>
  );
}
