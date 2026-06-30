"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CalendarCheck, ChevronDown, Phone, Sparkles } from "lucide-react";

import {
  LEISTUNGEN_FAQ,
  LEISTUNGEN_HIGHLIGHTS,
  LEISTUNGEN_LANDING_META,
  LEISTUNGEN_PILLARS,
} from "@/lib/marketing/leistungen-landing-data";

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
      { threshold: 0.08 }
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

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="yd-al-faq-item">
      <button type="button" className="yd-al-faq-q" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {q}
        <ChevronDown
          size={16}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.3s ease" }}
        />
      </button>
      <p className={`yd-al-faq-a ${open ? "yd-al-faq-a--open" : ""}`}>{a}</p>
    </div>
  );
}

export function YdLeistungenLandingCarree() {
  const [stickyVisible, setStickyVisible] = useState(false);
  const meta = LEISTUNGEN_LANDING_META;

  useEffect(() => {
    const hero = document.querySelector(".yd-leistungen-hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="yd-al yd-leistungen">
      <header className="yd-al-topbar">
        <div className="yd-al-container yd-al-topbar-inner">
          <Image
            src="/landingpages/aligner/logo.png"
            alt={meta.practiceName}
            width={140}
            height={35}
            className="yd-al-logo"
            priority
          />
          <div className="yd-al-topbar-cta">
            <a href={meta.phoneHref} className="yd-al-btn yd-al-btn--ghost yd-al-btn--sm">
              {meta.phoneDisplay}
            </a>
            <a
              href={meta.appointmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="yd-al-btn yd-al-btn--primary yd-al-btn--sm yd-leistungen-btn--warm"
            >
              Online Termin
            </a>
          </div>
        </div>
      </header>

      <section className="yd-al-section yd-leistungen-hero">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-leistungen-hero-inner">
              <span className="yd-al-eyebrow">
                <Sparkles size={14} aria-hidden />
                Leistungen · {meta.city}
              </span>
              <h1 className="yd-al-hero-title yd-leistungen-hero-title">{meta.heroTitle}</h1>
              <p className="yd-al-hero-lead">{meta.heroLead}</p>
              <div className="yd-al-hero-ctas">
                <a
                  href={meta.appointmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="yd-al-btn yd-al-btn--glow yd-leistungen-btn--warm"
                >
                  Termin online buchen
                </a>
                <a href={meta.contactUrl} target="_blank" rel="noopener noreferrer" className="yd-al-btn yd-al-btn--ghost">
                  Beratung anfragen
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="yd-al-section yd-leistungen-pillars" id="leistungen">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Behandlungsschwerpunkte</span>
              <h2 className="yd-al-title">Alles Wichtige auf einen Blick</h2>
              <p className="yd-al-lead">
                Vier Bereiche, von Praxisbesonderheiten über Zahnerhalt und Ästhetik bis zu Implantaten
                und neuem Zahnersatz.
              </p>
            </div>
          </Reveal>

          <div className="yd-leistungen-grid">
            {LEISTUNGEN_PILLARS.map((pillar, index) => (
              <Reveal key={pillar.id}>
                <article className="yd-leistungen-card" style={{ transitionDelay: `${index * 40}ms` }}>
                  <div className="yd-leistungen-card__media">
                    <Image
                      src={pillar.image}
                      alt={pillar.imageAlt}
                      fill
                      sizes="(max-width: 767px) 100vw, 25vw"
                      className="yd-leistungen-card__img"
                    />
                    <div className="yd-leistungen-card__media-overlay" />
                    <h3 className="yd-leistungen-card__title">{pillar.title}</h3>
                  </div>
                  <div className="yd-leistungen-card__body">
                    <p className="yd-leistungen-card__intro">{pillar.intro}</p>
                    <ul className="yd-leistungen-list">
                      {pillar.services.map((item) => (
                        <li
                          key={item.label}
                          className={item.featured ? "yd-leistungen-list__item--featured" : undefined}
                        >
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="yd-al-section yd-leistungen-highlights">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Häufig gesucht</span>
              <h2 className="yd-al-title">Weitere Schwerpunkte</h2>
              <p className="yd-al-lead">
                Themen, die Patientinnen und Patienten besonders oft anfragen, ergänzend zu unserem
                Kernspektrum.
              </p>
            </div>
            <div className="yd-leistungen-highlight-grid">
              {LEISTUNGEN_HIGHLIGHTS.map((item) => (
                <div key={item.title} className="yd-leistungen-highlight-card">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="yd-al-section" id="faq">
        <div className="yd-al-container yd-leistungen-faq-wrap">
          <Reveal>
            <div className="yd-al-head">
              <span className="yd-al-kicker">Fragen & Antworten</span>
              <h2 className="yd-al-title">Gut zu wissen vor dem Termin</h2>
            </div>
            <div className="yd-leistungen-faq">
              {LEISTUNGEN_FAQ.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="yd-al-section" id="termin">
        <div className="yd-al-container">
          <Reveal>
            <div className="yd-al-cta-band yd-leistungen-cta-band">
              <h2>Passende Behandlung finden?</h2>
              <p>
                Vereinbaren Sie einen Termin bei {meta.practiceName} in {meta.city}. Wir nehmen uns Zeit
                für Ihre Fragen, persönlich und ohne Druck.
              </p>
              <div className="yd-al-cta-buttons">
                <a
                  href={meta.appointmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="yd-al-btn yd-al-btn--glow yd-al-btn--glow-light yd-leistungen-btn--warm"
                >
                  <CalendarCheck size={18} aria-hidden />
                  <span>Online Termin buchen</span>
                </a>
                <a href={meta.phoneHref} className="yd-al-btn yd-al-btn--ghost">
                  <Phone size={16} aria-hidden />
                  {meta.phoneDisplay}
                </a>
              </div>
              <p className="yd-al-cta-note">{meta.address}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="yd-al-footer">
        <div className="yd-al-container">
          <p>
            {meta.practiceName} · {meta.address} · {meta.phoneDisplay} ·{" "}
            <a href="https://carree-dental.de/impressum/" target="_blank" rel="noopener noreferrer">
              Impressum
            </a>{" "}
            ·{" "}
            <a href="https://carree-dental.de/datenschutzerklaerung/" target="_blank" rel="noopener noreferrer">
              Datenschutz
            </a>
          </p>
        </div>
      </footer>

      <div className={`yd-al-sticky-cta ${stickyVisible ? "yd-al-sticky-cta--visible" : ""}`}>
        <a href={meta.phoneHref} className="yd-al-btn yd-al-btn--ghost yd-al-btn--sm">
          Anrufen
        </a>
        <a
          href={meta.appointmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="yd-al-btn yd-al-btn--primary yd-al-btn--sm yd-leistungen-btn--warm"
        >
          Online Termin
        </a>
      </div>
    </main>
  );
}
