"use client";

import * as React from "react";

import type { PracticeSolutionInquiryContext } from "@/lib/practice-solutions/inquiry-context";
import {
  buildLandingPreviewDraft,
  type LandingFieldValues,
  type LandingPageConfig,
} from "@/lib/practice-solutions/landing-configs";
import { cn } from "@/lib/utils";

export type LandingInquiryPreviewProps = {
  config: LandingPageConfig;
  fieldValues: LandingFieldValues;
  profile: PracticeSolutionInquiryContext;
  className?: string;
  variant?: "default" | "studio";
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function LandingInquiryLivePreview({
  config,
  fieldValues,
  profile,
  className,
  variant = "default",
}: LandingInquiryPreviewProps) {
  const draft = React.useMemo(
    () => buildLandingPreviewDraft(config, fieldValues, profile),
    [config, fieldValues, profile]
  );

  const accent = profile.accentColor?.trim() || "#2F80ED";
  const isStudio = variant === "studio";

  return (
    <div
      className={cn(
        "yd-lp-config-preview",
        isStudio && "yd-lp-config-preview--studio",
        className
      )}
    >
      <div
        className="yd-lp-config-preview__browser"
        style={{ "--yd-lp-accent": accent } as React.CSSProperties}
      >
        <div className="yd-lp-config-preview__chrome" aria-hidden>
          <div className="yd-lp-config-preview__dots">
            <span />
            <span />
            <span />
          </div>
          <div className="yd-lp-config-preview__address-bar">{draft.slug}.yourdentist.de</div>
        </div>

        <div className="yd-lp-config-preview__page">
          <header className="yd-lp-config-preview__nav">
            <div className="yd-lp-config-preview__brand">
              {profile.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.logoUrl} alt="" className="yd-lp-config-preview__logo" />
              ) : (
                <span className="yd-lp-config-preview__monogram">
                  {initialsFromName(draft.practiceName)}
                </span>
              )}
              <span className="yd-lp-config-preview__practice">{draft.practiceName}</span>
            </div>
            <nav className="yd-lp-config-preview__nav-links" aria-hidden>
              <span>Leistungen</span>
              <span>Team</span>
              <span>Kontakt</span>
            </nav>
            <span className="yd-lp-config-preview__nav-cta">{draft.ctaLabel}</span>
          </header>

          <section className="yd-lp-config-preview__hero yd-lp-config-preview__hero--premium">
            <div className="yd-lp-config-preview__hero-copy">
              <p className="yd-lp-config-preview__eyebrow" key={`eyebrow-${draft.eyebrow}`}>
                {draft.eyebrow}
              </p>
              <h1 className="yd-lp-config-preview__headline" key={`headline-${draft.headline}`}>
                {draft.headline}
              </h1>
              <p className="yd-lp-config-preview__subhead" key={`sub-${draft.subheadline}`}>
                {draft.subheadline}
              </p>
              <ul className="yd-lp-config-preview__trust" role="list">
                {draft.trustBadges.map((badge) => (
                  <li key={badge}>{badge}</li>
                ))}
              </ul>
              <span className="yd-lp-config-preview__hero-cta">{draft.ctaLabel}</span>
            </div>
            <div className="yd-lp-config-preview__hero-visual">
              <div className="yd-lp-config-preview__hero-image-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={draft.heroImage}
                  src={draft.heroImage}
                  alt=""
                  className="yd-lp-config-preview__hero-image"
                />
              </div>
            </div>
          </section>

          <section className="yd-lp-config-preview__services" aria-label="Leistungen">
            <h2 className="yd-lp-config-preview__section-title">Ihre Schwerpunkte</h2>
            <div className="yd-lp-config-preview__service-grid">
              {draft.services.map((service) => (
                <article key={service} className="yd-lp-config-preview__service-card">
                  <span className="yd-lp-config-preview__service-dot" aria-hidden />
                  <span>{service}</span>
                </article>
              ))}
            </div>
          </section>

          {draft.testimonialQuote ? (
            <section className="yd-lp-config-preview__testimonial">
              <blockquote className="yd-lp-config-preview__testimonial-quote">
                {draft.testimonialQuote}
              </blockquote>
              {draft.testimonialAuthor ? (
                <cite className="yd-lp-config-preview__testimonial-author">
                  {draft.testimonialAuthor}
                </cite>
              ) : null}
            </section>
          ) : null}

          <section className="yd-lp-config-preview__team">
            <div className="yd-lp-config-preview__team-visual">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photoUrl} alt="" className="yd-lp-config-preview__team-photo" />
              ) : (
                <div className="yd-lp-config-preview__team-placeholder" aria-hidden />
              )}
            </div>
            <div className="yd-lp-config-preview__team-copy">
              <p className="yd-lp-config-preview__eyebrow">Ihr Behandlungsteam</p>
              <h2 className="yd-lp-config-preview__team-name">{draft.doctorName}</h2>
              <p className="yd-lp-config-preview__team-role">{draft.doctorRole}</p>
            </div>
          </section>

          <footer className="yd-lp-config-preview__footer">
            <div>
              <span className="yd-lp-config-preview__footer-label">Standort</span>
              <span>{draft.locationLine ?? "—"}</span>
            </div>
            <div>
              <span className="yd-lp-config-preview__footer-label">Kontakt</span>
              <span>{draft.phoneLine ?? profile.contactEmail}</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
