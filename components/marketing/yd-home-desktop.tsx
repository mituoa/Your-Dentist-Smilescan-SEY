"use client";

import Link from "next/link";

import { YdPracticeDemo } from "@/components/marketing/yd-practice-demo";
import { YdPracticeWorld } from "@/components/marketing/yd-practice-world";
import { YdPublicPricingStage } from "@/components/marketing/yd-public-pricing-stage";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";
import { PUBLIC_ENTRY_COPY } from "@/lib/marketing/public-entry-copy";

type YdHomeDesktopProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

export function YdHomeDesktop({
  initialPlan,
  inviteToken = "",
  prefilledEmail = "",
}: YdHomeDesktopProps) {
  const { benefitsSection } = PUBLIC_ENTRY_COPY;

  return (
    <article className="yd-clinical-page yd-clinical-desktop-only">
      <YdProductChrome showSetupInHeader={false} />

      <section
        className="yd-clinical-hero yd-clinical-hero--premium yd-clinical-hero--orchestrated yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "1" }}
        aria-labelledby="yd-clinical-hero-title"
      >
        <div className="yd-clinical-hero-lights" aria-hidden />
        <div className="yd-clinical-hero-vignette" aria-hidden />
        <div className="yd-clinical-hero-stage">
          <div className="yd-clinical-hero-grid">
            <div className="yd-clinical-hero-copy">
              <p className="yd-clinical-eyebrow">{PUBLIC_ENTRY_COPY.eyebrow}</p>
              <h1 id="yd-clinical-hero-title" className="yd-clinical-display yd-clinical-display--hero">
                <span className="yd-clinical-display-line">{PUBLIC_ENTRY_COPY.title}</span>
                <span className="yd-clinical-display-line yd-clinical-display-line--sans">
                  {PUBLIC_ENTRY_COPY.titleLine2}
                </span>
              </h1>
              <p className="yd-clinical-lead">{PUBLIC_ENTRY_COPY.lead}</p>
              <ul className="yd-clinical-hero-benefits">
                {PUBLIC_ENTRY_COPY.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div className="yd-clinical-hero-cta-stack">
                <Link href="/#pricing" className="yd-clinical-cta-primary">
                  Praxisbereich starten
                </Link>
                <Link href="/#einblick" className="yd-clinical-cta-secondary">
                  Live-Einblick ansehen
                </Link>
              </div>
            </div>
            <div className="yd-clinical-hero-world">
              <YdPracticeWorld />
            </div>
          </div>
        </div>
      </section>

      <YdPracticeDemo />

      <section
        className="yd-clinical-act yd-clinical-act--benefits yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "3" }}
        aria-labelledby="yd-clinical-benefits-title"
      >
        <p className="yd-clinical-eyebrow">{benefitsSection.eyebrow}</p>
        <h2 id="yd-clinical-benefits-title" className="yd-clinical-act-title yd-clinical-act-title--direct">
          {benefitsSection.title}
        </h2>
        <ul className="yd-clinical-benefits-grid">
          {benefitsSection.items.map((item) => (
            <li key={item.label} className="yd-clinical-benefit-card">
              <span className="yd-clinical-benefit-label">{item.label}</span>
              <p className="yd-clinical-benefit-body">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <YdPublicPricingStage
        fieldIndex={4}
        initialPlan={initialPlan}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
      />

      <footer
        className="yd-clinical-footer yd-public-os-awaken-field"
        style={{ ["--yd-public-field-i" as string]: "5" }}
      >
        <div className="yd-clinical-footer-links">
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <Link href="/agb">AGB</Link>
        </div>
        <p>{PUBLIC_ENTRY_COPY.footer}</p>
      </footer>
    </article>
  );
}
