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
  Send,
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
import { PUBLIC_BRAND_TAGLINE } from "@/lib/brand/constants";

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

/** Zählt einmalig hoch, sobald sichtbar — kein Dauerloop. Respektiert prefers-reduced-motion. */
function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
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
              setDisplay(Math.round(eased * value));
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
  }, [value, reduced]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
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
  "Foto trifft ein — Tracker übernimmt den Fall.",
  "Command AI bereitet Zusammenfassung vor.",
  "Arzt prüft — Freigabe statt Automatik.",
  "Command AI sendet die Antwort automatisch an den Patienten.",
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
    tag: "01 · Anfrage",
    icon: MessageSquareText,
    title: "Patientenanfrage trifft ein",
    body: "„Seit Tag 5 etwas Druckgefühl an der Implantatstelle, Foto im Anhang.“",
  },
  {
    tag: "02 · Zusammenfassung",
    icon: ScanLine,
    title: "Command AI fasst zusammen",
    body: "Heilung im erwarteten Bereich, kein Hinweis auf Komplikation.",
  },
  {
    tag: "03 · Freigabe",
    icon: Stethoscope,
    title: "Arzt prüft und gibt frei",
    body: "Entwurf geprüft — Freigabe statt automatischem Versand.",
  },
  {
    tag: "04 · Versand",
    icon: Send,
    title: "Command AI sendet an den Patienten",
    body: "Freigegebene Antwort geht automatisch raus — vollständig dokumentiert im Portal.",
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

const STATS = [
  { value: 8, label: "Schritte bis zur Antwort" },
  { value: 6, label: "Module in einer Plattform" },
  { value: 0, label: "Versand ohne ärztliche Freigabe" },
];

const MODULES = [
  {
    icon: ListChecks,
    title: "Atlas",
    text: "Überblick über Prioritäten, Entscheidungen und Praxisstatus.",
    preview: ["3 neue Einsendungen", "1 Aufgabe offen", "Keine Verzögerung"],
  },
  {
    icon: ClipboardCheck,
    title: "Tracker",
    text: "Strukturierte Patientenfälle mit Fotos, Verlauf und nächsten Schritten.",
    preview: ["Fall · Implantat Tag 7", "Status: Antwort vorbereitet"],
  },
  {
    icon: Users2,
    title: "Relay",
    text: "Der Arzt diktiert Aufgaben an Rezeption oder Assistenz per Command AI — dokumentiert im Portal statt über WhatsApp.",
    preview: ["Laborauftrag · Pat. M. Müller", "Diktiert von Dr. — nachverfolgbar"],
  },
  {
    icon: BookOpen,
    title: "Care Center",
    text: "Patientenwissen, Nachsorgeartikel und Wissensbasis für die Patienten-KI.",
    preview: ["Schmerzen nach OP", "Invisalign Pflege"],
  },
  {
    icon: Sparkles,
    title: "Command AI",
    text: "Vorarbeit, Entwürfe, Zusammenfassungen und Assistenz mit ärztlicher Kontrolle.",
    preview: ["Entwurf vorbereitet", "Wartet auf Freigabe"],
  },
  {
    icon: LayoutTemplate,
    title: "Landingpages",
    text: "Professionelle Kampagnen und Landingpages für Behandlungen, Schwerpunkte und Praxiswachstum.",
    preview: ["SmileScan Kampagne", "Implantologie Landingpage"],
  },
];

const COMMAND_POINTS = [
  "Keine automatische Diagnose",
  "Keine finale medizinische Entscheidung",
  "Klare Rückfragen bei Unsicherheit",
  "Ärztliche Freigabe bleibt Pflicht",
  "Nach Freigabe: Versand an den Patienten",
  "Team-Aufgaben per Diktat an Relay — nachverfolgbar im Portal",
];

const ARTICLES = [
  "Verhalten nach Implantation",
  "Schmerzen nach OP",
  "Kaffee nach Implantat",
  "Sport nach Eingriff",
  "Invisalign Pflege",
  "Bleaching Hinweise",
  "Schwellung normal?",
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
  "Patienten schreiben über verschiedene Kanäle.",
  "Fotos und Informationen kommen unstrukturiert an.",
  "Rückfragen landen am Telefon.",
  "Teamaufgaben sind nicht sauber verknüpft.",
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, text: "KI trifft keine Diagnose." },
  { icon: ClipboardCheck, text: "Ärztliche Freigabe bleibt zentral." },
  { icon: ListChecks, text: "Strukturierte Dokumentation." },
  { icon: Lock, text: "DSGVO-orientierte Produktlogik." },
  { icon: Users2, text: "Klare Rollen und Verantwortlichkeiten." },
  { icon: MessageSquareText, text: "Sichere Patientenkommunikation." },
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
          <Link href="/?welcome=1" aria-label="Your Dentist — Startseite">
            <YourDentistBrandLockup size="sm" tagline={PUBLIC_BRAND_TAGLINE} />
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
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
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
              Digitale Infrastruktur für Zahnarztpraxen
            </span>
            <h1 className="yd-os-hero-title">
              Ein ruhiger Workflow für <em>jede</em> Patientenanfrage.
            </h1>
            <p className="yd-os-hero-lead">
              Patientenanfragen, KI-Vorbereitung, ärztliche Freigabe und Teamarbeit — in einem System.
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
                <span>Fall · Implantat, Tag 7</span>
              </div>
              <HeroSnapshot />
            </div>
            <div className="yd-os-hero-chip yd-os-hero-chip--approval">
              <ShieldCheck size={14} />
              Ärztliche Freigabe aktiv
            </div>
          </div>
        </div>

        <div className="yd-os-container">
          <div className="yd-os-stat-strip">
            {STATS.map((s) => (
              <div key={s.label} className="yd-os-stat">
                <strong>
                  <CountUp value={s.value} />
                </strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="yd-os-section">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Ausgangslage</span>
              <h2 className="yd-os-title">Praxen verlieren Zeit, weil Kommunikation zerstreut ist.</h2>
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
      <section className="yd-os-section yd-os-section--flush" id="workflow" style={{ background: "var(--os-warm)" }}>
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head yd-os-head--left yd-os-head--workflow">
              <span className="yd-os-kicker">Workflow</span>
              <h2 className="yd-os-title">Ein Fall. Ein ruhiger Ablauf. Vom ersten Foto bis zur Antwort.</h2>
            </div>
          </Reveal>
        </div>
        <YdWorkflowKeynote />
      </section>

      {/* Module */}
      <section className="yd-os-section" id="module">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Plattform</span>
              <h2 className="yd-os-title">Eine Plattform. Klare Module. Ein Praxisbetrieb.</h2>
            </div>
            <div className="yd-os-module-grid yd-os-module-grid--bento">
              {MODULES.map((m, i) => {
                const Icon = m.icon;
                const featured = i === 0;
                return (
                  <GlowCard
                    key={m.title}
                    className={`yd-os-module-card ${featured ? "yd-os-module-card--featured" : ""}`}
                  >
                    <div className="yd-os-module-icon">
                      <Icon size={featured ? 22 : 19} strokeWidth={1.8} />
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
      <section className="yd-os-section" id="care-center" style={{ background: "var(--os-warm)" }}>
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Care Center</span>
              <h2 className="yd-os-title">Patientenwissen, das Ihr Team entlastet.</h2>
            </div>
            <div className="yd-os-article-grid">
              {ARTICLES.map((a) => (
                <div key={a} className="yd-os-article-card">
                  <span className="yd-os-article-tag">Care Center</span>
                  <h4>{a}</h4>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Landingpages & Kampagnen */}
      <section className="yd-os-section" id="landingpages">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Landingpages &amp; Kampagnen</span>
              <h2 className="yd-os-title">Landingpages für jede Praxis. Für jeden Schwerpunkt.</h2>
            </div>
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
      <section className="yd-os-section" id="command-ai" style={{ background: "var(--os-warm)" }}>
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Command AI</span>
              <h2 className="yd-os-title">KI unterstützt. Der Arzt entscheidet.</h2>
            </div>
            <div className="yd-os-command-split">
              <div className="yd-os-command-panel">
                <p className="yd-os-command-panel-label">Patientenanfrage</p>
                <div className="yd-os-bubble">
                  „Seit Tag 5 etwas Druckgefühl an der Implantatstelle, Foto im Anhang.“
                </div>
                <div className="yd-os-command-ai-row" style={{ marginTop: 18 }}>
                  <span className="yd-os-command-ai-row-icon">
                    <Camera size={14} />
                  </span>
                  <div className="yd-os-command-ai-row-text">
                    <h4>Anhang erkannt</h4>
                    <p>1 Foto · Implantatstelle, automatisch dem Fall zugeordnet.</p>
                  </div>
                </div>
              </div>
              <div className="yd-os-command-panel yd-os-command-panel--ai">
                <p className="yd-os-command-panel-label">Command AI — Ablauf</p>
                <CommandAiCycle />
                <button type="button" className="yd-os-command-approve" disabled>
                  <CheckCircle2 size={14} /> Freigeben
                </button>
              </div>
            </div>
            <ul className="yd-os-command-list" style={{ marginTop: 28, maxWidth: 760 }}>
              {COMMAND_POINTS.map((p) => (
                <li key={p}>
                  <CheckCircle2 size={16} />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Vorteile */}
      <section className="yd-os-section">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Nutzen</span>
              <h2 className="yd-os-title">Mehr Klarheit im Alltag. Weniger Reibung im Team.</h2>
            </div>
            <div className="yd-os-benefit-grid">
              <div className="yd-os-benefit-card">
                <h3>Für Ärzte</h3>
                <ul>
                  <li>Weniger Wiederholungen</li>
                  <li>Bessere Entscheidungsgrundlage</li>
                  <li>Weniger Kontextsuche</li>
                  <li>Klare Freigaben</li>
                </ul>
              </div>
              <div className="yd-os-benefit-card">
                <h3>Für Team</h3>
                <ul>
                  <li>Strukturierte Aufgaben</li>
                  <li>Weniger WhatsApp-Chaos</li>
                  <li>Klare Übergaben</li>
                  <li>Weniger Telefonlast</li>
                </ul>
              </div>
              <div className="yd-os-benefit-card">
                <h3>Für Patienten</h3>
                <ul>
                  <li>Bessere Orientierung</li>
                  <li>Schnellere Rückmeldung</li>
                  <li>Verständliche Nachsorge</li>
                  <li>Mehr Vertrauen</li>
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Sicherheit / Vertrauen */}
      <section className="yd-os-section" style={{ background: "var(--os-warm)" }}>
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Sicherheit &amp; Vertrauen</span>
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
      <section className="yd-os-section" id="pricing">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Preise</span>
              <h2 className="yd-os-title">Ein Rhythmus. Klar kalkulierbar.</h2>
              <p className="yd-os-lead">
                Nach Prüfung Ihrer Praxisdaten wird der geschützte Bereich freigeschaltet.
              </p>
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
      <section className="yd-os-section" id="demo">
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-cta-band">
              <div className="yd-os-cta-grid">
                <div>
                  <h2>Demo buchen oder direkt starten</h2>
                  <p>Kurzer Einblick in den Workflow — oder Registrierung mit Prüfung Ihrer Praxisdaten.</p>
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
