"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Calendar,
  Camera,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Mic,
  QrCode,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

import {
  BentoBadge,
  BentoCard,
  BentoContainer,
  BentoCtaPair,
  BentoGrid,
  BentoKpi,
  BentoScrollRow,
  BentoSectionHead,
} from "@/components/marketing/bento/bento-primitives";
import { YdPublicSiteDemoForm } from "@/components/marketing/yd-public-site-demo-form";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import {
  BENTO_AUTOMATION,
  BENTO_COMMAND,
  BENTO_CTA,
  BENTO_FAQ,
  BENTO_FOOTER,
  BENTO_HEALING,
  BENTO_HERO,
  BENTO_JOURNEY,
  BENTO_KPIS,
  BENTO_PLATFORM,
  BENTO_SECTIONS,
  BENTO_SERVICES,
  BENTO_WARUM,
} from "@/lib/marketing/public-bento-ia";
import { scrollToPublicSection } from "@/lib/marketing/public-site-scroll";
import { cn } from "@/lib/utils";

const MODULE_ICONS = {
  atlas: LayoutDashboard,
  tracker: Camera,
  relay: Users,
  journals: MessageSquare,
  command: Bot,
} as const;

const JOURNEY_ICONS = {
  qr: QrCode,
  upload: Camera,
  ai: Sparkles,
  review: Stethoscope,
  reply: MessageSquare,
  care: Calendar,
} as const;

function scrollTo(id: string) {
  scrollToPublicSection(id);
}

export function BentoHeroSection() {
  return (
    <section className="yd-bento-section" id={BENTO_SECTIONS.hero} aria-label="Hero">
      <BentoContainer>
        <BentoGrid className="yd-bento-hero-grid">
          <BentoCard span={8} variant="elevated" className="yd-bento-hero-main">
            <BentoBadge>{BENTO_HERO.badge}</BentoBadge>
            <h1 className="yd-bento-hero-title">{BENTO_HERO.title}</h1>
            <p className="yd-bento-hero-sub">{BENTO_HERO.subtitle}</p>
            <BentoCtaPair
              primary={BENTO_HERO.primaryCta}
              secondary={BENTO_HERO.secondaryCta}
              onPrimary={() => scrollTo(BENTO_SECTIONS.demo)}
              onSecondary={() => scrollTo(BENTO_SECTIONS.plattform)}
            />
            <p className="yd-bento-hero-signin">
              {BENTO_HERO.signInPrefix}{" "}
              <Link href="/login" prefetch className="yd-bento-link">
                {BENTO_HERO.signInLabel}
              </Link>
            </p>
          </BentoCard>
          <div className="yd-bento-hero-kpis">
            {BENTO_KPIS.map((kpi) => (
              <BentoCard key={kpi.label} span={6} variant="soft" className="yd-bento-hero-kpi-card">
                <BentoKpi {...kpi} />
              </BentoCard>
            ))}
          </div>
        </BentoGrid>
      </BentoContainer>
    </section>
  );
}

function ModuleMock({ id, accent }: { id: string; accent: string }) {
  return (
    <div className="yd-bento-module-mock" style={{ ["--module-accent" as string]: accent }}>
      <div className="yd-bento-module-mock__bar" />
      <div className="yd-bento-module-mock__lines">
        <span />
        <span />
        <span className="yd-bento-module-mock__line--short" />
      </div>
      <span className="yd-bento-module-mock__tag">{id}</span>
    </div>
  );
}

export function BentoPlatformSection() {
  return (
    <section className="yd-bento-section" id={BENTO_SECTIONS.plattform} aria-label="Plattform">
      <BentoContainer>
        <BentoSectionHead
          badge={BENTO_PLATFORM.badge}
          title={BENTO_PLATFORM.title}
          lead={BENTO_PLATFORM.lead}
        />
        <BentoScrollRow label="Plattform-Module">
          <BentoGrid className="yd-bento-platform-grid">
            {BENTO_PLATFORM.modules.map((mod) => {
              const Icon = MODULE_ICONS[mod.id as keyof typeof MODULE_ICONS];
              return (
                <BentoCard key={mod.id} span={4} variant="elevated" className="yd-bento-module-card">
                  <div className="yd-bento-module-card__icon" style={{ color: mod.accent }}>
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <h3 className="yd-bento-module-card__name">{mod.name}</h3>
                  <p className="yd-bento-module-card__hint">{mod.hint}</p>
                  <ModuleMock id={mod.id} accent={mod.accent} />
                </BentoCard>
              );
            })}
          </BentoGrid>
        </BentoScrollRow>
      </BentoContainer>
    </section>
  );
}

export function BentoJourneySection() {
  return (
    <section className="yd-bento-section" id={BENTO_SECTIONS.journey} aria-label="Patient Journey">
      <BentoContainer>
        <BentoSectionHead
          badge={BENTO_JOURNEY.badge}
          title={BENTO_JOURNEY.title}
          lead={BENTO_JOURNEY.lead}
        />
        <BentoScrollRow label="Patient Journey Schritte">
          <ol className="yd-bento-journey-track">
            {BENTO_JOURNEY.steps.map((step, i) => {
              const Icon = JOURNEY_ICONS[step.id as keyof typeof JOURNEY_ICONS];
              return (
                <li key={step.id} className="yd-bento-journey-step">
                  <BentoCard span={4} variant="soft" className="yd-bento-journey-card">
                    <span className="yd-bento-journey-card__num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="yd-bento-journey-card__icon">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <h3 className="yd-bento-journey-card__label">{step.label}</h3>
                    <p className="yd-bento-journey-card__desc">{step.desc}</p>
                  </BentoCard>
                  {i < BENTO_JOURNEY.steps.length - 1 ? (
                    <span className="yd-bento-journey-arrow" aria-hidden>
                      →
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </BentoScrollRow>
      </BentoContainer>
    </section>
  );
}

export function BentoHealingSection() {
  const [active, setActive] = useState<string>(BENTO_HEALING.cases[0]!.id);
  const current = BENTO_HEALING.cases.find((c) => c.id === active) ?? BENTO_HEALING.cases[0]!;

  return (
    <section className="yd-bento-section" id={BENTO_SECTIONS.heilung} aria-label="Heilungsverläufe">
      <BentoContainer>
        <BentoGrid>
          <BentoCard span={7} variant="elevated" className="yd-bento-healing-main">
            <BentoSectionHead
              badge={BENTO_HEALING.badge}
              title={BENTO_HEALING.title}
              lead={BENTO_HEALING.lead}
            />
            <div className="yd-bento-timeline">
              {current.phases.map((phase, i) => (
                <div key={phase} className="yd-bento-timeline__item">
                  <span className="yd-bento-timeline__dot" />
                  <div className="yd-bento-timeline__content">
                    <p className="yd-bento-timeline__phase">{phase}</p>
                    <div className="yd-bento-timeline__visual" aria-hidden />
                  </div>
                  {i < current.phases.length - 1 ? (
                    <span className="yd-bento-timeline__connector" aria-hidden />
                  ) : null}
                </div>
              ))}
            </div>
          </BentoCard>
          <BentoCard span={5} variant="soft" className="yd-bento-healing-tabs">
            <p className="yd-bento-healing-tabs__label">Behandlungsfall</p>
            <ul className="yd-bento-healing-tabs__list">
              {BENTO_HEALING.cases.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={cn(
                      "yd-bento-healing-tab",
                      active === c.id && "yd-bento-healing-tab--active"
                    )}
                    onClick={() => setActive(c.id)}
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </BentoCard>
        </BentoGrid>
      </BentoContainer>
    </section>
  );
}

export function BentoCommandSection() {
  return (
    <section className="yd-bento-section" id={BENTO_SECTIONS.command} aria-label="Command AI">
      <BentoContainer>
        <BentoGrid>
          <BentoCard span={6} variant="elevated" className="yd-bento-command-showcase">
            <BentoSectionHead
              badge={BENTO_COMMAND.badge}
              title={BENTO_COMMAND.title}
              lead={BENTO_COMMAND.lead}
            />
            <div className="yd-bento-command-device">
              <div className="yd-bento-command-device__screen">
                <p className="yd-bento-command-device__label">Command AI</p>
                <p className="yd-bento-command-device__phrase">„{BENTO_COMMAND.demoPhrase}"</p>
                <ul className="yd-bento-command-device__checks">
                  <li>✓ Antwortentwurf erstellt</li>
                  <li>✓ Aufgabe in Relay</li>
                  <li>⏳ Freigabe ausstehend</li>
                </ul>
              </div>
            </div>
          </BentoCard>
          <div className="yd-bento-command-features">
            {BENTO_COMMAND.features.map((f) => (
              <BentoCard key={f.label} span={6} variant="soft" className="yd-bento-feature-tile">
                <Mic className="yd-bento-feature-tile__icon h-4 w-4" aria-hidden />
                <h3 className="yd-bento-feature-tile__title">{f.label}</h3>
                <p className="yd-bento-feature-tile__desc">{f.desc}</p>
              </BentoCard>
            ))}
          </div>
        </BentoGrid>
      </BentoContainer>
    </section>
  );
}

export function BentoAutomationSection() {
  return (
    <section className="yd-bento-section" id={BENTO_SECTIONS.automation} aria-label="Automatisierung">
      <BentoContainer>
        <BentoSectionHead
          badge={BENTO_AUTOMATION.badge}
          title={BENTO_AUTOMATION.title}
          lead={BENTO_AUTOMATION.lead}
        />
        <BentoGrid className="yd-bento-automation-grid">
          {BENTO_AUTOMATION.items.map((item) => (
            <BentoCard key={item.label} span={4} variant="elevated" className="yd-bento-auto-card">
              <ClipboardList className="yd-bento-auto-card__icon h-4 w-4" aria-hidden />
              <h3 className="yd-bento-auto-card__title">{item.label}</h3>
              <p className="yd-bento-auto-card__desc">{item.desc}</p>
            </BentoCard>
          ))}
        </BentoGrid>
      </BentoContainer>
    </section>
  );
}

export function BentoServicesSection() {
  return (
    <section
      className="yd-bento-section yd-bento-section--services"
      id={BENTO_SECTIONS.services}
      aria-label="Landingpage Services"
    >
      <BentoContainer>
        <BentoSectionHead
          badge={BENTO_SERVICES.badge}
          title={BENTO_SERVICES.title}
          lead={BENTO_SERVICES.lead}
          action={
            <button
              type="button"
              className="yd-bento-btn yd-bento-btn--ghost"
              onClick={() => scrollTo(BENTO_SECTIONS.demo)}
            >
              Portfolio anfragen
            </button>
          }
        />
        <BentoGrid className="yd-bento-services-grid">
          {BENTO_SERVICES.cards.map((card) => (
            <BentoCard key={card.id} span={4} variant="elevated" className="yd-bento-service-card">
              <div className="yd-bento-service-card__image-wrap">
                <Image
                  src={card.image}
                  alt=""
                  width={400}
                  height={250}
                  className="yd-bento-service-card__image"
                  sizes="(max-width: 768px) 80vw, 33vw"
                  loading="lazy"
                  quality={75}
                />
              </div>
              <div className="yd-bento-service-card__body">
                <h3 className="yd-bento-service-card__title">{card.title}</h3>
                <p className="yd-bento-service-card__desc">{card.desc}</p>
                <button
                  type="button"
                  className="yd-bento-service-card__link"
                  onClick={() => scrollTo(BENTO_SECTIONS.demo)}
                >
                  Portfolio ansehen <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            </BentoCard>
          ))}
        </BentoGrid>
      </BentoContainer>
    </section>
  );
}

export function BentoWarumSection() {
  return (
    <section className="yd-bento-section" id={BENTO_SECTIONS.warum} aria-label="Warum Your Dentist">
      <BentoContainer>
        <BentoSectionHead badge={BENTO_WARUM.badge} title={BENTO_WARUM.title} />
        <BentoGrid className="yd-bento-warum-grid">
          {BENTO_WARUM.items.map((item) => (
            <BentoCard key={item.label} span={4} variant="soft" className="yd-bento-warum-card">
              <p className="yd-bento-warum-card__value">{item.value}</p>
              <h3 className="yd-bento-warum-card__label">{item.label}</h3>
              <p className="yd-bento-warum-card__detail">{item.detail}</p>
            </BentoCard>
          ))}
        </BentoGrid>
      </BentoContainer>
    </section>
  );
}

export function BentoFaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="yd-bento-section" id={BENTO_SECTIONS.faq} aria-label="FAQ">
      <BentoContainer>
        <BentoSectionHead badge={BENTO_FAQ.badge} title={BENTO_FAQ.title} />
        <div className="yd-bento-faq-list">
          {BENTO_FAQ.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <BentoCard key={item.q} span={12} variant="elevated" className="yd-bento-faq-item">
                <button
                  type="button"
                  className="yd-bento-faq-item__trigger"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="yd-bento-faq-item__q">{item.q}</span>
                  <ChevronDown
                    className={cn("yd-bento-faq-item__chevron", isOpen && "yd-bento-faq-item__chevron--open")}
                    aria-hidden
                  />
                </button>
                {isOpen ? <p className="yd-bento-faq-item__a">{item.a}</p> : null}
              </BentoCard>
            );
          })}
        </div>
      </BentoContainer>
    </section>
  );
}

export function BentoCtaSection() {
  return (
    <section className="yd-bento-section yd-bento-section--cta" id={BENTO_SECTIONS.demo} aria-label="Demo">
      <BentoContainer>
        <BentoGrid>
          <BentoCard span={6} variant="gradient" className="yd-bento-cta-card">
            <h2 className="yd-bento-cta-card__title">{BENTO_CTA.title}</h2>
            <p className="yd-bento-cta-card__lead">{BENTO_CTA.lead}</p>
            <BentoCtaPair
              primary={BENTO_CTA.primaryCta}
              secondary={BENTO_CTA.secondaryCta}
              onPrimary={() => scrollTo(BENTO_SECTIONS.demo)}
              onSecondary={() => scrollTo(BENTO_SECTIONS.demo)}
            />
          </BentoCard>
          <BentoCard span={6} variant="elevated" className="yd-bento-demo-form-card">
            <h3 className="yd-bento-demo-form-card__title">Demo-Anfrage</h3>
            <YdPublicSiteDemoForm />
          </BentoCard>
        </BentoGrid>
      </BentoContainer>
    </section>
  );
}

export function BentoFooter({ onPricingClick }: { onPricingClick?: () => void }) {
  return (
    <footer className="yd-bento-footer">
      <BentoContainer>
        <div className="yd-bento-footer__inner">
          <YourDentistBrandLockup size="sm" />
          <nav className="yd-bento-footer__nav" aria-label="Footer">
            {BENTO_FOOTER.links.map((link) =>
              link.label === "Preise" && onPricingClick ? (
                <Link
                  key={link.href}
                  href="/#preise"
                  className="yd-bento-footer__link"
                  onClick={(event) => {
                    event.preventDefault();
                    onPricingClick();
                  }}
                >
                  {link.label}
                </Link>
              ) : (
                <Link key={link.href} href={link.href} className="yd-bento-footer__link">
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>
      </BentoContainer>
    </footer>
  );
}
