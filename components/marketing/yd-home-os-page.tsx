"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  LayoutTemplate,
  ListChecks,
  Lock,
  Menu,
  MessageSquareText,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users2,
  X,
} from "lucide-react";

import { YdRegisterPricing } from "@/components/auth/yd-register-pricing";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { YdPublicSiteDemoForm } from "@/components/marketing/yd-public-site-demo-form";
import { YdPublicSiteFooter } from "@/components/marketing/yd-public-site-footer";
import { YdWorkflowKeynote } from "@/components/marketing/yd-workflow-keynote";
import { coerceRegisterPlan } from "@/lib/auth/register-plans";
import { buildRegisterEntryHref } from "@/lib/marketing/auth-access-copy";
import { LANDING_HERO } from "@/lib/practice-solutions/landing-page-model";
import { JOURNAL_HUB, JOURNAL_KI } from "@/lib/journal/journal-hub-product";

type Props = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

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
            entry.target.classList.add("yd-os-reveal--in");
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
    <div ref={ref} className={`yd-os-reveal ${className ?? ""}`}>
      {children}
    </div>
  );
}

/** Karte mit Cursor-Licht: leichte radiale Aufhellung folgt der Maus. */
function GlowCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--gx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--gy", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div ref={ref} className={`yd-os-glow-card ${className ?? ""}`} onMouseMove={onMove}>
      {children}
    </div>
  );
}

const NAV = [
  { label: "Workflow", id: "workflow" },
  { label: "Module", id: "module" },
  { label: "Command AI", id: "command-ai" },
  { label: "Care Center", id: "care-center" },
  { label: "Preise", id: "pricing" },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Hero-Status-Snapshot — bewusst kein zweiter Schritt-Rail (der lebt in der Workflow-Sektion).
 *  Zeigt stattdessen den Praxisstatus eines Falls: Kennzahlen + eine ruhig rotierende Statuszeile. */
const HERO_SNAPSHOT_METRICS = [
  { label: "Eingänge heute", value: "3" },
  { label: "Offene Freigabe", value: "1" },
  { label: "Ø Antwortzeit", value: "11 Min." },
] as const;

const HERO_STATUS_LINES = [
  "Neues Foto im Tracker.",
  "Entwurf liegt zur Freigabe bereit.",
  "Antwort geht nach Ihrer Freigabe raus.",
] as const;

function HeroSnapshot() {
  const reduced = useReducedMotion();
  const [line, setLine] = useState(0);
  const total = HERO_STATUS_LINES.length;

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setLine((v) => (v + 1) % total), 2400);
    return () => window.clearInterval(id);
  }, [reduced, total]);

  return (
    <div className="yd-os-hero-snapshot" aria-hidden>
      <div className="yd-os-hero-snapshot-metrics">
        {HERO_SNAPSHOT_METRICS.map((m) => (
          <div key={m.label} className="yd-os-hero-snapshot-metric">
            <strong>{m.value}</strong>
            <span>{m.label}</span>
          </div>
        ))}
      </div>
      <div className="yd-os-hero-pulse">
        <span className="yd-os-hero-pulse-dot" />
        <span key={line} className="yd-os-hero-pulse-text">
          {HERO_STATUS_LINES[reduced ? 0 : line]}
        </span>
      </div>
    </div>
  );
}

/** Command AI — zyklische Demo: Anfrage → Zusammenfassung → Freigabe → Versand an den Patienten.
 *  Wichtig: Nach Freigabe sendet Command AI die Antwort direkt an den Patienten — kein Team-Task.
 *  Aufgaben ans Team laufen separat über Relay (siehe COMMAND_POINTS). */
const COMMAND_STAGES = [
  {
    tag: "Anfrage",
    icon: MessageSquareText,
    title: "Anfrage trifft ein",
    body: "„Stechende Schmerzen rechts unten — noch ohne Foto.“",
  },
  {
    tag: "Foto",
    icon: Camera,
    title: "KI fordert Foto an",
    body: "Patient sendet Bild — automatisch dem Fall zugeordnet.",
  },
  {
    tag: "Zusammenfassung",
    icon: ScanLine,
    title: "Command AI fasst zusammen",
    body: "Akute Schmerzen — Entwurf zur Kontrolle bereit.",
  },
  {
    tag: "Freigabe",
    icon: Stethoscope,
    title: "Arzt gibt frei",
    body: "Geprüft, versendet und im Portal dokumentiert.",
  },
] as const;

function CommandAiCycle() {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);
  const total = COMMAND_STAGES.length;

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setStage((v) => (v + 1) % total), 2600);
    return () => window.clearInterval(id);
  }, [reduced, total]);

  const current = COMMAND_STAGES[stage];
  const Icon = current.icon;

  return (
    <div className="yd-os-cmd-cycle">
      <div className="yd-os-cmd-cycle-tabs" role="tablist" aria-label="Command-AI-Ablauf">
        {COMMAND_STAGES.map((s, i) => (
          <button
            key={s.tag}
            type="button"
            role="tab"
            aria-selected={i === stage}
            className={`yd-os-cmd-cycle-tab ${i === stage ? "is-active" : ""}`}
            onClick={() => setStage(i)}
          >
            {s.tag}
          </button>
        ))}
      </div>
      <div className="yd-os-cmd-cycle-stage" key={stage}>
        <span className="yd-os-cmd-cycle-icon">
          <Icon size={18} strokeWidth={1.8} />
        </span>
        <div>
          <h4>{current.title}</h4>
          <p>{current.body}</p>
        </div>
      </div>
      <div className="yd-os-cmd-cycle-progress">
        {COMMAND_STAGES.map((s, i) => (
          <span key={s.tag} className={`yd-os-cmd-cycle-dot ${i <= stage ? "is-filled" : ""}`} />
        ))}
      </div>
    </div>
  );
}

const MODULES = [
  {
    icon: ListChecks,
    title: "Atlas",
    text: "Prioritäten, Entscheidungen, Praxisstatus.",
    preview: ["3 Einsendungen", "1 Freigabe offen"],
    accent: "blue",
  },
  {
    icon: ClipboardCheck,
    title: "Tracker",
    text: "Fälle mit Fotos, Verlauf und nächsten Schritten.",
    preview: ["Schmerzen rechts unten", "Foto · vor 12 Min."],
    accent: "indigo",
  },
  {
    icon: Users2,
    title: "Relay",
    text: "Teamaufgaben per Diktat — im Portal statt WhatsApp.",
    preview: ["Laborauftrag · nachverfolgbar"],
    accent: "navy",
  },
  {
    icon: BookOpen,
    title: "Care Center",
    text: "Patienten-KI beantwortet Routinefragen — weniger Telefonate.",
    preview: ["Schmerzen nach OP", "KI fordert Foto an"],
    accent: "violet",
  },
  {
    icon: Sparkles,
    title: "Command AI",
    text: "Entwürfe und Zusammenfassungen — mit Freigabe.",
    preview: ["Wartet auf Freigabe"],
    accent: "sky",
  },
  {
    icon: LayoutTemplate,
    title: "Landingpages",
    text: "Individuell für Ihre Praxis — mit Nachverfolgung Ihrer Anfragen.",
    preview: ["Implantologie", "Freigabe vor Live-Schaltung"],
    accent: "teal",
  },
] as const;

const CARE_KI_POINTS = [
  "Beantwortet viele Patientenfragen aus veröffentlichten Texten — weniger Standardanrufe.",
  "Bei Beschwerden fordert die KI gezielt eine Nachricht oder ein Foto an.",
  JOURNAL_KI.safetyLine,
];

const LANDING_FLOW_STEPS = [
  "Sie erhalten Ihre individuelle Landingpage zur Freigabe — angepasst an Ihre Praxis.",
  "Nach Freigabe schalten wir sie live — mit messbarer Nachverfolgung Ihrer Anfragen.",
] as const;

const COMMAND_POINTS = [
  "Keine automatische Diagnose",
  "Ärztliche Freigabe bleibt Pflicht",
  "Versand erst nach Freigabe",
  "Teamaufgaben über Relay",
];

const ARTICLES = [
  "Verhalten nach Implantation",
  "Schmerzen nach OP",
  "Invisalign Pflege",
  "Schwellung normal?",
  "Bleaching Hinweise",
  "Retainer verloren",
];

/** Bildquelle: Unsplash (lizenzfrei für kommerzielle Nutzung), ruhige klinische Aufnahmen. */
const CAMPAIGNS = [
  { name: "SmileScan Landingpage", image: "1667133295315-820bb6481730" },
  { name: "Aligner / Invisalign", image: "1598256989809-394fa4f6cd26" },
  { name: "Implantologie", image: "1593022356769-11f762e25ed9" },
  { name: "Prophylaxe", image: "1629909613654-28e377c37b09" },
  { name: "Ästhetische Zahnmedizin", image: "1677026010083-78ec7f1b84ed" },
  { name: "Bleaching", image: "1489278353717-f64c6ee8a4d2" },
  { name: "Kinderzahnheilkunde", image: "1565090568947-7293970ba471" },
  { name: "Parodontologie", image: "1606811971618-4486d14f3f99" },
  { name: "Endodontie", image: "1606811841689-23dfddce3e95" },
  { name: "Oral Health Pass", image: "1598256989800-fe5f95da9787" },
] as const;

const PROBLEMS = [
  "Anfragen über viele Kanäle",
  "Fotos ohne Struktur",
  "Rückfragen am Telefon",
  "Aufgaben ohne Verknüpfung",
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, text: "KI trifft keine Diagnose" },
  { icon: ClipboardCheck, text: "Freigabe bleibt beim Arzt" },
  { icon: Lock, text: "DSGVO-orientierte Logik" },
  { icon: ListChecks, text: "Nachvollziehbare Dokumentation" },
];

export function YdHomeOsPage({
  initialPlan = null,
  inviteToken = "",
  prefilledEmail = "",
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const registerHref = buildRegisterEntryHref();
  const selectedPlan = coerceRegisterPlan(initialPlan);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "preise" || hash === "pricing" || hash === "plans") {
      requestAnimationFrame(() => scrollToId("pricing"));
    }
  }, []);

  const go = useCallback((id: string) => {
    scrollToId(id);
    setMenuOpen(false);
  }, []);

  return (
    <main className="yd-os">
      <header className={`yd-os-header ${scrolled ? "yd-os-header--scrolled" : ""}`}>
        <div className="yd-os-container yd-os-header-inner">
          <Link href="/?welcome=1" className="yd-os-header-brand" aria-label="Your Dentist — Startseite">
            <YourDentistBrandLockup size="sm" tagline={null} />
          </Link>
          <nav className="yd-os-nav" aria-label="Hauptnavigation">
            {NAV.map((item) => (
              <button key={item.id} type="button" className="yd-os-nav-link" onClick={() => go(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="yd-os-header-actions">
            <Link href="/login" className="yd-os-login">
              Anmelden
            </Link>
            <button
              type="button"
              className="yd-os-btn yd-os-btn--primary yd-os-btn--sm yd-os-header-demo"
              onClick={() => go("demo")}
            >
              Demo buchen
            </button>
            <button
              type="button"
              className="yd-os-menu-btn"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Menü schließen" : "Bereiche"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`yd-os-mobile-nav ${menuOpen ? "yd-os-mobile-nav--open" : ""}`}>
        <button type="button" className="yd-os-mobile-nav-backdrop" aria-label="Menü schließen" onClick={() => setMenuOpen(false)} />
        <nav className="yd-os-mobile-nav-panel" aria-label="Bereiche">
          {NAV.map((item) => (
            <button key={item.id} type="button" onClick={() => go(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Hero */}
      <section className="yd-os-hero">
        <div className="yd-os-container yd-os-hero-grid">
          <div className="yd-os-hero-copy">
            <span className="yd-os-eyebrow">
              <span className="yd-os-eyebrow-dot" aria-hidden />
              Für Zahnarztpraxen
            </span>
            <h1 className="yd-os-hero-title">
              Ein ruhiger Workflow für <em>jede</em> Patientenanfrage.
            </h1>
            <p className="yd-os-hero-lead">
              Wenn eine Anfrage reinkommt, ist klar, was als Nächstes passiert. Vom Foto bis zur
              Antwort, alles an einem Ort.
            </p>
            <div className="yd-os-hero-ctas">
              <Link href="/login" className="yd-os-btn yd-os-btn--primary">
                Anmelden
              </Link>
              <button type="button" className="yd-os-btn yd-os-btn--ghost" onClick={() => go("demo")}>
                Demo buchen
              </button>
            </div>
          </div>

          <div className="yd-os-hero-visual">
            <div className="yd-os-hero-card yd-os-hero-card--back" aria-hidden />
            <div className="yd-os-hero-card yd-os-hero-card--mid" aria-hidden />
            <div className="yd-os-hero-card yd-os-hero-card--front">
              <div className="yd-os-hero-card-head">
                <span className="yd-os-hero-card-dot" />
                <span>Fall · Schmerzen + Foto</span>
              </div>
              <HeroSnapshot />
            </div>
            <div className="yd-os-hero-chip yd-os-hero-chip--approval">
              <ShieldCheck size={14} />
              Ärztliche Freigabe aktiv
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="yd-os-section yd-os-section--tight">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Ausgangslage</span>
              <h2 className="yd-os-title">Kommunikation ist oft zerstreut.</h2>
            </div>
            <div className="yd-os-problem-grid">
              {PROBLEMS.map((p, i) => (
                <div key={p} className="yd-os-problem-card">
                  <p className="yd-os-problem-card-num">{String(i + 1).padStart(2, "0")}</p>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Workflow — Keynote-Sequenz, scroll-gesteuert */}
      <section className="yd-os-section yd-os-section--alt yd-os-section--flush" id="workflow">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head yd-os-head--left yd-os-head--workflow">
              <span className="yd-os-kicker">Workflow</span>
              <h2 className="yd-os-title">Vom Foto bis zur Antwort.</h2>
            </div>
          </Reveal>
        </div>
        <YdWorkflowKeynote />
      </section>

      {/* Module */}
      <section className="yd-os-section yd-os-section--tight" id="module">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Plattform</span>
              <h2 className="yd-os-title">Klare Module. Ein Betrieb.</h2>
            </div>
            <div className="yd-os-module-grid yd-os-module-grid--uniform">
              {MODULES.map((m) => {
                const Icon = m.icon;
                return (
                  <GlowCard
                    key={m.title}
                    className={`yd-os-module-card yd-os-module-card--${m.accent}`}
                  >
                    <div className="yd-os-module-icon">
                      <Icon size={19} strokeWidth={1.8} />
                    </div>
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                    <div className="yd-os-module-preview">
                      {m.preview.map((row) => (
                        <div key={row} className="yd-os-module-preview-row">
                          <span className="yd-os-module-preview-dot" />
                          <span>{row}</span>
                        </div>
                      ))}
                    </div>
                  </GlowCard>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Care Center */}
      <section className="yd-os-section yd-os-section--alt yd-os-section--tight" id="care-center">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Care Center</span>
              <h2 className="yd-os-title">Wissen, das das Team entlastet.</h2>
              <p className="yd-os-lead">{JOURNAL_HUB.essence}</p>
            </div>
            <div className="yd-os-care-ki-panel">
              <div className="yd-os-care-ki-panel-head">
                <span className="yd-os-care-ki-icon" aria-hidden>
                  <Sparkles size={18} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="yd-os-care-ki-title">{JOURNAL_KI.title}</h3>
                  <p className="yd-os-care-ki-summary">{JOURNAL_KI.summary}</p>
                </div>
              </div>
              <ul className="yd-os-care-ki-points">
                {CARE_KI_POINTS.map((point) => (
                  <li key={point}>
                    <CheckCircle2 size={15} strokeWidth={1.75} aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="yd-os-article-grid">
              {ARTICLES.map((a) => (
                <div key={a} className="yd-os-article-card">
                  <h4>{a}</h4>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Landingpages & Kampagnen */}
      <section className="yd-os-section yd-os-section--tight" id="landingpages">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Landingpages</span>
              <h2 className="yd-os-title">Für jeden Schwerpunkt.</h2>
              <p className="yd-os-lead">{LANDING_HERO.subtitle}</p>
            </div>
            <ol className="yd-os-landing-flow">
              {LANDING_FLOW_STEPS.map((step, i) => (
                <li key={step} className="yd-os-landing-flow-step">
                  <span className="yd-os-landing-flow-num" aria-hidden>
                    {i + 1}
                  </span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
            <div className="yd-os-campaign-marquee">
              <div className="yd-os-campaign-track">
                {[...CAMPAIGNS, ...CAMPAIGNS].map((c, i) => {
                  const hidden = i >= CAMPAIGNS.length;
                  return (
                    <div
                      key={`${c.name}-${i}`}
                      className="yd-os-campaign-card yd-os-campaign-card--static"
                      aria-hidden={hidden}
                    >
                      <div className="yd-os-campaign-preview">
                        <Image
                          src={`https://images.unsplash.com/photo-${c.image}?q=80&w=480&auto=format&fit=crop`}
                          alt=""
                          fill
                          sizes="200px"
                          className="yd-os-campaign-preview-img"
                        />
                      </div>
                      <p className="yd-os-campaign-name">{c.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="yd-os-campaign-cta-row">
              <button type="button" className="yd-os-btn yd-os-btn--primary" onClick={() => go("demo")}>
                Landingpage anfragen <ArrowRight size={15} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Command AI */}
      <section className="yd-os-section yd-os-section--alt yd-os-section--tight" id="command-ai">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Command AI</span>
              <h2 className="yd-os-title">KI bereitet vor. Der Arzt entscheidet.</h2>
            </div>
            <div className="yd-os-command-split">
              <div className="yd-os-command-panel">
                <p className="yd-os-command-panel-label">Patientenanfrage</p>
                <div className="yd-os-command-panel-body">
                  <div className="yd-os-bubble">
                    „Seit heute Morgen stechende Schmerzen rechts unten — noch kein Foto im Anhang.“
                  </div>
                  <div className="yd-os-command-status-list">
                    <div className="yd-os-command-status">
                      <span className="yd-os-command-status-key">Status</span>
                      <span className="yd-os-command-status-val">Foto fehlt · dringend</span>
                    </div>
                    <div className="yd-os-command-status yd-os-command-status--highlight">
                      <span className="yd-os-command-status-icon" aria-hidden>
                        <Camera size={14} strokeWidth={1.75} />
                      </span>
                      <div className="yd-os-command-status-copy">
                        <strong>KI fordert Foto an</strong>
                        <p>
                          Bitte Nachricht oder Foto der Beschwerde senden — bevor die Praxis
                          entscheidet.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="yd-os-command-panel yd-os-command-panel--ai">
                <p className="yd-os-command-panel-label">Command AI — Ablauf</p>
                <div className="yd-os-command-panel-body">
                  <CommandAiCycle />
                </div>
                <div className="yd-os-command-panel-footer">
                  <div className="yd-os-command-panel-footer-copy">
                    <span className="yd-os-command-panel-footer-label">Ärztliche Freigabe</span>
                    <p>Entwurf prüfen — Versand erst nach Ihrer Bestätigung.</p>
                  </div>
                  <button type="button" className="yd-os-command-approve" disabled>
                    <CheckCircle2 size={14} /> Freigeben
                  </button>
                </div>
              </div>
            </div>
            <div className="yd-os-command-guarantees">
              <ul className="yd-os-command-list yd-os-command-list--balanced">
                {COMMAND_POINTS.map((p) => (
                  <li key={p}>
                    <CheckCircle2 size={16} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Sicherheit / Vertrauen */}
      <section className="yd-os-section yd-os-section--tight">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Vertrauen</span>
              <h2 className="yd-os-title">Medizinisch vorsichtig. Technisch sauber.</h2>
            </div>
            <div className="yd-os-trust">
              {TRUST_ITEMS.map((t) => {
                const Icon = t.icon;
                return (
                  <div key={t.text} className="yd-os-trust-item">
                    <Icon size={18} strokeWidth={1.8} />
                    <p>{t.text}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pricing */}
      <section className="yd-os-section yd-os-section--alt yd-os-section--tight" id="pricing">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Preise</span>
              <h2 className="yd-os-title">Klar kalkulierbar.</h2>
            </div>
            <div className="yd-os-pricing-shell">
              <YdRegisterPricing
                selectedPlan={selectedPlan}
                inviteToken={inviteToken}
                prefilledEmail={prefilledEmail}
                sectionId="plans"
                embedded
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Abschluss CTA */}
      <section className="yd-os-section yd-os-section--tight" id="demo">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-cta-band">
              <div className="yd-os-cta-grid">
                <div>
                  <h2>Demo oder Zugang anfordern</h2>
                  <div className="yd-os-hero-ctas">
                    <Link href={registerHref} className="yd-os-btn yd-os-btn--primary">
                      Demo buchen
                    </Link>
                    <button type="button" className="yd-os-btn yd-os-btn--ghost" onClick={() => go("module")}>
                      Plattform ansehen
                    </button>
                  </div>
                </div>
                <div className="yd-os-cta-form-shell">
                  <YdPublicSiteDemoForm />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <YdPublicSiteFooter />
    </main>
  );
}
