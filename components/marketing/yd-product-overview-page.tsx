"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  Bot,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  LayoutDashboard,
  Mic,
  MessageSquare,
  Send,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";

import {
  BentoBadge,
  BentoCard,
  BentoContainer,
  BentoCtaPair,
  BentoGrid,
  BentoPage,
  BentoScrollRow,
  BentoSectionHead,
} from "@/components/marketing/bento/bento-primitives";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";
import { YdPublicSiteDemoForm } from "@/components/marketing/yd-public-site-demo-form";
import { YdPublicSiteFooter } from "@/components/marketing/yd-public-site-footer";
import { buildRegisterEntryHref } from "@/lib/marketing/auth-access-copy";
import {
  PRODUCT_CTA,
  PRODUCT_HERO,
  PRODUCT_HIGHLIGHTS,
  PRODUCT_MODULES,
  PRODUCT_OVERVIEW_SECTIONS,
  PRODUCT_TRUST,
  PRODUCT_WORKFLOW,
} from "@/lib/marketing/product-overview-ia";

const WORKFLOW_ICONS = {
  patient: UserRound,
  struktur: ClipboardCheck,
  command: Sparkles,
  freigabe: Stethoscope,
  team: Users,
  antwort: Send,
  protokoll: FileCheck2,
} as const;

const MODULE_ICONS = {
  atlas: LayoutDashboard,
  tracker: Camera,
  relay: Users,
  journals: MessageSquare,
  command: Bot,
} as const;

/** Eine Reveal-Animation pro Section — kein Scroll-Reveal auf jedem Element. */
function SectionReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("yd-product-reveal--in");
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
    <div ref={ref} className={`yd-product-reveal ${className ?? ""}`}>
      {children}
    </div>
  );
}

function ProductOverviewHeader() {
  return (
    <header className="yd-bento-header">
      <div className="yd-bento-header__inner">
        <Link href="/" className="yd-bento-header__brand" aria-label="Startseite">
          <YourDentistBrandLockup size="sm" />
        </Link>
        <div className="yd-bento-header__actions">
          <Link href="/login" prefetch className="yd-bento-header__login">
            Anmelden
          </Link>
        </div>
      </div>
    </header>
  );
}

function ProductHeroSection() {
  return (
    <section className="yd-bento-section" id={PRODUCT_OVERVIEW_SECTIONS.hero} aria-label="Hero">
      <BentoContainer>
        <BentoGrid className="yd-bento-hero-grid">
          <BentoCard span={8} variant="elevated" className="yd-bento-hero-main">
            <BentoBadge>{PRODUCT_HERO.badge}</BentoBadge>
            <h1 className="yd-bento-hero-title">{PRODUCT_HERO.title}</h1>
            <p className="yd-bento-hero-sub">{PRODUCT_HERO.subtitle}</p>
            <BentoCtaPair
              primary={PRODUCT_HERO.primaryCta}
              secondary={PRODUCT_HERO.secondaryCta}
              primaryHref={PRODUCT_HERO.primaryCtaHref}
              secondaryHref={PRODUCT_HERO.secondaryCtaHref}
            />
            <p className="yd-bento-hero-signin">
              {PRODUCT_HERO.signInPrefix}{" "}
              <Link href="/login" prefetch className="yd-bento-link">
                {PRODUCT_HERO.signInLabel}
              </Link>
            </p>
          </BentoCard>

          <BentoCard span={4} variant="soft" className="yd-bento-hero-kpi-card yd-product-hero-mock-card">
            <div className="yd-bento-module-mock" style={{ height: "100%" }}>
              <p className="yd-bento-module-mock__tag" style={{ marginTop: 0, marginBottom: "0.625rem" }}>
                {PRODUCT_HERO.mock.label}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {PRODUCT_HERO.mock.rows.map((row) => (
                  <div key={row.tag}>
                    <div className="yd-bento-module-mock__bar" />
                    <div className="yd-bento-module-mock__lines">
                      <span className="yd-bento-module-mock__line--short" />
                    </div>
                    <p className="yd-bento-module-mock__tag" style={{ marginTop: "0.25rem" }}>
                      {row.tag} — {row.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>
        </BentoGrid>
      </BentoContainer>
    </section>
  );
}

function ProductWorkflowSection() {
  return (
    <section className="yd-bento-section" id={PRODUCT_OVERVIEW_SECTIONS.workflow} aria-label="Ablauf">
      <BentoContainer>
        <SectionReveal>
          <BentoSectionHead
            badge={PRODUCT_WORKFLOW.badge}
            title={PRODUCT_WORKFLOW.title}
            lead={PRODUCT_WORKFLOW.lead}
          />
          <BentoScrollRow label="Ablauf-Schritte">
            <ol className="yd-bento-journey-track">
              {PRODUCT_WORKFLOW.steps.map((step, i) => {
                const Icon = WORKFLOW_ICONS[step.id as keyof typeof WORKFLOW_ICONS];
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
                    {i < PRODUCT_WORKFLOW.steps.length - 1 ? (
                      <span className="yd-bento-journey-arrow" aria-hidden>
                        →
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </BentoScrollRow>
        </SectionReveal>
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

function ProductModulesSection() {
  return (
    <section className="yd-bento-section" id={PRODUCT_OVERVIEW_SECTIONS.module} aria-label="Module">
      <BentoContainer>
        <SectionReveal>
          <BentoSectionHead
            badge={PRODUCT_MODULES.badge}
            title={PRODUCT_MODULES.title}
            lead={PRODUCT_MODULES.lead}
          />
          <BentoScrollRow label="Plattform-Module">
            <BentoGrid className="yd-bento-platform-grid">
              {PRODUCT_MODULES.items.map((mod) => {
                const Icon = MODULE_ICONS[mod.id as keyof typeof MODULE_ICONS];
                return (
                  <BentoCard key={mod.id} span={4} variant="elevated" className="yd-bento-module-card">
                    <div className="yd-bento-module-card__icon" style={{ color: mod.accent }}>
                      <Icon className="h-4 w-4" aria-hidden />
                    </div>
                    <h3 className="yd-bento-module-card__name">{mod.name}</h3>
                    <p className="yd-bento-module-card__hint">{mod.hint}</p>
                    <ModuleMock id={mod.route} accent={mod.accent} />
                  </BentoCard>
                );
              })}
            </BentoGrid>
          </BentoScrollRow>
        </SectionReveal>
      </BentoContainer>
    </section>
  );
}

function HighlightMock({ kind }: { kind: (typeof PRODUCT_HIGHLIGHTS.items)[number]["kind"] }) {
  if (kind === "tracker") {
    return (
      <div className="yd-bento-module-mock">
        <p className="yd-bento-module-mock__tag" style={{ marginTop: 0, marginBottom: "0.5rem" }}>
          Implantat · Tag 7
        </p>
        <div className="yd-bento-module-mock__bar" />
        <div className="yd-bento-module-mock__lines">
          <span />
          <span className="yd-bento-module-mock__line--short" />
        </div>
      </div>
    );
  }
  if (kind === "device") {
    return (
      <div className="yd-bento-command-device">
        <div className="yd-bento-command-device__screen">
          <p className="yd-bento-command-device__label">Command AI</p>
          <p className="yd-bento-command-device__phrase">
            „Verlauf unauffällig — Kontrolle diese Woche empfehlen."
          </p>
          <ul className="yd-bento-command-device__checks">
            <li>✓ Antwortentwurf erstellt</li>
            <li>⏳ Freigabe ausstehend</li>
          </ul>
        </div>
      </div>
    );
  }
  return (
    <div className="yd-bento-feature-tile" style={{ padding: 0, border: "none", background: "transparent" }}>
      <Mic className="yd-bento-feature-tile__icon h-4 w-4" aria-hidden />
      <p className="yd-bento-feature-tile__desc">„Patientin informieren, Recall nächste Woche vorbereiten."</p>
    </div>
  );
}

function ProductHighlightsSection() {
  return (
    <section className="yd-bento-section" id={PRODUCT_OVERVIEW_SECTIONS.highlights} aria-label="Funktionen">
      <BentoContainer>
        <SectionReveal>
          <BentoSectionHead badge={PRODUCT_HIGHLIGHTS.badge} title={PRODUCT_HIGHLIGHTS.title} />
          <BentoGrid>
            {PRODUCT_HIGHLIGHTS.items.map((item) => (
              <BentoCard key={item.id} span={4} variant="elevated" className="yd-bento-feature-tile">
                <h3 className="yd-bento-feature-tile__title">{item.title}</h3>
                <p className="yd-bento-feature-tile__desc">{item.desc}</p>
                <div style={{ marginTop: "0.75rem" }}>
                  <HighlightMock kind={item.kind} />
                </div>
              </BentoCard>
            ))}
          </BentoGrid>
        </SectionReveal>
      </BentoContainer>
    </section>
  );
}

function ProductTrustSection() {
  return (
    <section className="yd-bento-section" id={PRODUCT_OVERVIEW_SECTIONS.trust} aria-label="Vertrauen">
      <BentoContainer>
        <SectionReveal>
          <BentoSectionHead badge={PRODUCT_TRUST.badge} title={PRODUCT_TRUST.title} />
          <BentoGrid>
            {PRODUCT_TRUST.items.map((item) => (
              <BentoCard key={item.label} span={6} variant="soft" className="yd-bento-warum-card">
                <span className="yd-bento-journey-card__icon" style={{ marginBottom: "0.625rem" }}>
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                </span>
                <h3 className="yd-bento-warum-card__label">{item.label}</h3>
                <p className="yd-bento-warum-card__detail">{item.desc}</p>
              </BentoCard>
            ))}
          </BentoGrid>
        </SectionReveal>
      </BentoContainer>
    </section>
  );
}

function ProductCtaSection() {
  const registerHref = buildRegisterEntryHref();
  return (
    <section className="yd-bento-section yd-bento-section--cta" id={PRODUCT_OVERVIEW_SECTIONS.demo} aria-label="Demo">
      <BentoContainer>
        <SectionReveal>
          <BentoGrid>
            <BentoCard span={6} variant="gradient" className="yd-bento-cta-card">
              <h2 className="yd-bento-cta-card__title">{PRODUCT_CTA.title}</h2>
              <p className="yd-bento-cta-card__lead">{PRODUCT_CTA.lead}</p>
              <BentoCtaPair
                primary={PRODUCT_CTA.secondaryCta}
                secondary="Zur Startseite"
                primaryHref={registerHref}
                secondaryHref="/"
              />
            </BentoCard>
            <BentoCard span={6} variant="elevated" className="yd-bento-demo-form-card">
              <h3 className="yd-bento-demo-form-card__title">Demo-Anfrage</h3>
              <YdPublicSiteDemoForm />
            </BentoCard>
          </BentoGrid>
        </SectionReveal>
      </BentoContainer>
    </section>
  );
}

export function YdProductOverviewPage() {
  return (
    <YdPublicOsEnvironment scroll mode="editorial" instantEnter>
      <BentoPage>
        <ProductOverviewHeader />
        <ProductHeroSection />
        <ProductWorkflowSection />
        <ProductModulesSection />
        <ProductHighlightsSection />
        <ProductTrustSection />
        <ProductCtaSection />
      </BentoPage>
      <YdPublicSiteFooter compact />
    </YdPublicOsEnvironment>
  );
}
