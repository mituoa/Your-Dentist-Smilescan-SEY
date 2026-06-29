"use client";

import * as React from "react";
import { Check } from "lucide-react";

import type { PracticeSolutionInquiryContext } from "@/lib/practice-solutions/inquiry-context";
import {
  buildLandingPreviewDraft,
  type LandingFieldValues,
  type LandingPageConfig,
} from "@/lib/practice-solutions/landing-configs";
import { LANDING_IMG } from "@/lib/practice-solutions/landing-configs/shared-images";
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

  const accent = profile.accentColor?.trim() || "#1a4f9c";
  const isStudio = variant === "studio";
  const [heroImage, setHeroImage] = React.useState(draft.heroImage);

  React.useEffect(() => {
    setHeroImage(draft.heroImage);
  }, [draft.heroImage]);

  return (
    <div
      className={cn(
        "yd-lp-config-preview",
        isStudio && "yd-lp-config-preview--studio",
        className
      )}
    >
      {isStudio ? (
        <div className="yd-lp-config-preview__frame-header">
          <span className="yd-lp-config-preview__live-dot" aria-hidden />
          <span className="yd-lp-config-preview__frame-title">Live-Vorschau</span>
        </div>
      ) : null}

      <div
        className="yd-lp-config-preview__browser"
        style={{ "--yd-lp-accent": accent } as React.CSSProperties}
      >
        <div className="yd-lp-config-preview__chrome" aria-hidden>
          <div className="yd-lp-config-preview__address-bar">
            {draft.slug}.yourdentist.de
          </div>
        </div>

        <div className="yd-lp-config-preview__viewport">
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
              {!isStudio ? (
                <nav className="yd-lp-config-preview__nav-links" aria-hidden>
                  <span>Leistungen</span>
                  <span>Team</span>
                  <span>Kontakt</span>
                </nav>
              ) : null}
              <span className="yd-lp-config-preview__nav-cta">{draft.ctaLabel}</span>
            </header>

            <section className="yd-lp-config-preview__hero">
              <div className="yd-lp-config-preview__hero-copy">
                <p className="yd-lp-config-preview__eyebrow">{draft.eyebrow}</p>
                <h1 className="yd-lp-config-preview__headline">{draft.headline}</h1>
                <p className="yd-lp-config-preview__subhead">{draft.subheadline}</p>
                {draft.trustBadges.length > 0 ? (
                  <ul className="yd-lp-config-preview__trust" role="list">
                    {draft.trustBadges.map((badge) => (
                      <li key={badge}>
                        <Check className="yd-lp-config-preview__trust-icon" aria-hidden />
                        <span>{badge}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <span className="yd-lp-config-preview__hero-cta">{draft.ctaLabel}</span>
              </div>
              <div className="yd-lp-config-preview__hero-visual">
                <div className="yd-lp-config-preview__hero-image-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImage}
                    alt=""
                    className="yd-lp-config-preview__hero-image"
                    onError={() => {
                      if (heroImage !== LANDING_IMG.default) {
                        setHeroImage(LANDING_IMG.default);
                      }
                    }}
                  />
                </div>
              </div>
            </section>

            {draft.services.length > 0 ? (
              <section className="yd-lp-config-preview__services" aria-label="Schwerpunkte">
                <h2 className="yd-lp-config-preview__section-title">Schwerpunkte</h2>
                <ul className="yd-lp-config-preview__service-list" role="list">
                  {draft.services.map((service) => (
                    <li key={service} className="yd-lp-config-preview__service-item">
                      {service}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {draft.testimonialQuote ? (
              <section className="yd-lp-config-preview__testimonial">
                <blockquote className="yd-lp-config-preview__testimonial-quote">
                  „{draft.testimonialQuote}"
                </blockquote>
                {draft.testimonialAuthor ? (
                  <cite className="yd-lp-config-preview__testimonial-author">
                    {draft.testimonialAuthor}
                  </cite>
                ) : null}
              </section>
            ) : null}

            <section className="yd-lp-config-preview__team">
              {profile.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photoUrl} alt="" className="yd-lp-config-preview__team-photo" />
              ) : (
                <div className="yd-lp-config-preview__team-placeholder" aria-hidden />
              )}
              <div className="yd-lp-config-preview__team-copy">
                <p className="yd-lp-config-preview__team-eyebrow">Behandlungsteam</p>
                <h2 className="yd-lp-config-preview__team-name">{draft.doctorName}</h2>
                <p className="yd-lp-config-preview__team-role">{draft.doctorRole}</p>
              </div>
            </section>

            <footer className="yd-lp-config-preview__footer">
              <div className="yd-lp-config-preview__footer-item">
                <span className="yd-lp-config-preview__footer-label">Standort</span>
                <span>{draft.locationLine ?? "—"}</span>
              </div>
              <div className="yd-lp-config-preview__footer-item">
                <span className="yd-lp-config-preview__footer-label">Kontakt</span>
                <span>{draft.phoneLine ?? profile.contactEmail}</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
