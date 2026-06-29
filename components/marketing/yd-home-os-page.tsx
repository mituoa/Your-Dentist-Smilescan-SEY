"use client";

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
  UserRound,
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

/** Zählt einmalig hoch, sobald sichtbar — kein Dauerloop. */
function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
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
  }, [value]);

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

/** Hero-Szene — exakt der Ablauf, der das Produkt erklärt. */
const FLOW_NODES = [
  { icon: UserRound, title: "Patient stellt Anfrage", detail: "Beschwerde wird geschildert." },
  { icon: Camera, title: "Foto trifft ein", detail: "Implantatstelle, Tag 7." },
  { icon: ClipboardCheck, title: "Tracker übernimmt Fall", detail: "Strukturiert, mit Kontext." },
  { icon: Sparkles, title: "Command AI bereitet vor", detail: "Zusammenfassung & Entwurf." },
  { icon: Stethoscope, title: "Arzt prüft", detail: "Freigabe statt Automatik." },
  { icon: Users2, title: "Relay erstellt Aufgabe", detail: "Empfang: Termin anbieten." },
  { icon: BookOpen, title: "Care Center verlinkt", detail: "Passender Nachsorge-Artikel." },
  { icon: Send, title: "Patient erhält Antwort", detail: "Klar, ruhig, verbindlich." },
] as const;

function LivingWorkflowScene() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const total = FLOW_NODES.length;

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setActive((v) => (v + 1) % total);
    }, 1900);
    return () => window.clearInterval(id);
  }, [reduced, total]);

  return (
    <div className="yd-os-flow-scene" aria-hidden>
      <div
        className="yd-os-flow-rail-fill"
        style={{ height: reduced ? "100%" : `${(active / (total - 1)) * 100}%` }}
      />
      {FLOW_NODES.map((node, i) => {
        const Icon = node.icon;
        const state = reduced ? "is-done" : i < active ? "is-done" : i === active ? "is-active" : "";
        return (
          <div key={node.title} className={`yd-os-flow-node ${state}`}>
            <span className="yd-os-flow-node-icon">
              <Icon size={16} strokeWidth={1.9} />
            </span>
            <div className="yd-os-flow-node-text">
              <p className="yd-os-flow-node-title">{node.title}</p>
              <p className="yd-os-flow-node-detail">{node.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const STATS = [
  { value: 8, label: "Schritte — vom Patientenkontakt bis zur Antwort" },
  { value: 6, label: "Module: Atlas, Tracker, Relay, Care Center, Command AI, Landingpages" },
  { value: 0, label: "Automatischer Versand ohne ärztliche Freigabe" },
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
    text: "Aufgaben, Teamnachrichten, Freigaben und Übergaben.",
    preview: ["Empfang · Termin anbieten", "Erledigt von: Lisa"],
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
  "Weniger Schreibarbeit",
  "Bessere Struktur für Team und Patient",
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

const CAMPAIGNS = [
  "SmileScan Landingpage",
  "Aligner / Invisalign",
  "Implantologie",
  "Prophylaxe",
  "Ästhetische Zahnmedizin",
  "Bleaching",
  "Kinderzahnheilkunde",
  "Parodontologie",
  "Endodontie",
  "Oral Health Pass",
];

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
          <Link href="/" aria-label="Your Dentist — Startseite">
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
            <button type="button" className="yd-os-btn yd-os-btn--primary yd-os-btn--sm" onClick={() => go("demo")}>
              Demo buchen
            </button>
            <button
              type="button"
              className="yd-os-menu-btn"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`yd-os-mobile-nav ${menuOpen ? "yd-os-mobile-nav--open" : ""}`}>
        <button type="button" className="yd-os-mobile-nav-backdrop" aria-label="Menü schließen" onClick={() => setMenuOpen(false)} />
        <nav className="yd-os-mobile-nav-panel">
          {NAV.map((item) => (
            <button key={item.id} type="button" onClick={() => go(item.id)}>
              {item.label}
            </button>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            Anmelden
          </Link>
        </nav>
      </div>

      {/* Hero */}
      <section className="yd-os-hero">
        <div className="yd-os-container yd-os-hero-grid">
          <div className="yd-os-hero-copy">
            <span className="yd-os-eyebrow">Digitale Infrastruktur für Zahnarztpraxen</span>
            <h1 className="yd-os-hero-title">Das digitale Betriebssystem für moderne Zahnarztpraxen.</h1>
            <p className="yd-os-hero-lead">
              Your Dentist verbindet Patientenanfragen, KI-gestützte Vorarbeit, ärztliche Freigabe,
              Teamaufgaben, Patientenwissen und digitale Kampagnen in einem ruhigen Praxis-Workflow.
            </p>
            <div className="yd-os-hero-ctas">
              <button type="button" className="yd-os-btn yd-os-btn--primary" onClick={() => go("demo")}>
                Demo buchen
              </button>
              <button type="button" className="yd-os-btn yd-os-btn--ghost" onClick={() => go("module")}>
                Plattform ansehen
              </button>
            </div>
            <p className="yd-os-hero-note">
              Für Praxen, die Patientenkommunikation, Nachsorge und digitale Abläufe professioneller
              strukturieren möchten.
            </p>
          </div>

          <LivingWorkflowScene />
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
            <div className="yd-os-head yd-os-head--left">
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
            <div className="yd-os-module-grid">
              {MODULES.map((m) => {
                const Icon = m.icon;
                return (
                  <GlowCard key={m.title} className="yd-os-module-card">
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
      <section className="yd-os-section" id="care-center" style={{ background: "var(--os-warm)" }}>
        <div className="yd-os-container">
          <Reveal>
            <div className="yd-os-head">
              <span className="yd-os-kicker">Care Center</span>
              <h2 className="yd-os-title">Patientenwissen, das Ihr Team entlastet.</h2>
              <p className="yd-os-lead">
                Beantworten Sie häufige Fragen einmal und nutzen Sie diese Inhalte für
                Patientenportal, Nachsorge, Landingpages und Patienten-KI.
              </p>
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
              <p className="yd-os-lead">
                Your Dentist kann für Praxen hochwertige Landingpages und Kampagnen erstellen, die
                auf Praxisprofil, Behandlungsangebot und Zielgruppe abgestimmt sind.
              </p>
            </div>
            <div className="yd-os-campaign-grid">
              {CAMPAIGNS.map((c) => (
                <div key={c} className="yd-os-campaign-card">
                  <div className="yd-os-campaign-preview" />
                  <p className="yd-os-campaign-name">{c}</p>
                </div>
              ))}
            </div>
            <div className="yd-os-campaign-cta-row">
              <p>
                Praxen können Landingpages direkt anfragen. Stammdaten werden aus dem Praxisprofil
                übernommen. Das Kreativteam erstellt daraus eine professionelle Kampagne.
              </p>
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
              <p className="yd-os-lead">
                Command AI bereitet Informationen vor, formuliert Entwürfe und erkennt fehlende
                Angaben. Medizinische Entscheidungen bleiben immer bei der Praxis.
              </p>
            </div>
            <div className="yd-os-command-split">
              <div className="yd-os-command-panel">
                <p className="yd-os-command-panel-label">Patientenanfrage</p>
                <div className="yd-os-bubble">
                  „Seit Tag 5 etwas Druckgefühl an der Implantatstelle, Foto im Anhang.“
                </div>
              </div>
              <div className="yd-os-command-panel yd-os-command-panel--ai">
                <p className="yd-os-command-panel-label">Command AI — Vorbereitung</p>
                <div className="yd-os-command-ai-row">
                  <span className="yd-os-command-ai-row-icon">
                    <ScanLine size={14} />
                  </span>
                  <div className="yd-os-command-ai-row-text">
                    <h4>Zusammenfassung</h4>
                    <p>Heilung im erwarteten Bereich, kein Hinweis auf Komplikation.</p>
                  </div>
                </div>
                <div className="yd-os-command-ai-row">
                  <span className="yd-os-command-ai-row-icon">
                    <MessageSquareText size={14} />
                  </span>
                  <div className="yd-os-command-ai-row-text">
                    <h4>Empfohlene Antwort</h4>
                    <p>„Verlauf unauffällig — bitte zur Kontrolle in dieser Woche vorbeikommen.“</p>
                  </div>
                </div>
                <div className="yd-os-command-ai-row">
                  <span className="yd-os-command-ai-row-icon">
                    <Camera size={14} />
                  </span>
                  <div className="yd-os-command-ai-row-text">
                    <h4>Nächster Schritt</h4>
                    <p>Terminlink vorbereitet, Aufgabe an Empfang erstellt.</p>
                  </div>
                </div>
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
                Praxisdaten und Nachweis einmal einreichen — nach Prüfung wird der geschützte
                Praxisbereich freigeschaltet.
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
                  <h2>Bereit für einen ruhigeren Praxisalltag?</h2>
                  <p>
                    Sehen Sie, wie Your Dentist Patientenkommunikation, KI-Vorarbeit, Teamaufgaben
                    und Praxiswissen in einem Workflow verbindet.
                  </p>
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
