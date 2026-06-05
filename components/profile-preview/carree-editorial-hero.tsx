import Link from "next/link";
import { Camera, Mail, MapPin, Phone } from "lucide-react";

import { CarreeMonogramMark } from "@/components/profile-preview/carree-monogram-mark";
import { CarreeWatermarkLetters } from "@/components/profile-preview/carree-watermark-letters";
import { practiceMonogram, practiceNameCaps } from "@/lib/profile/practice-monogram";
import type { ProfileEditorData } from "@/lib/types/profile-editor-data";
import { parsePracticeAddressBlock } from "@/lib/profile/practice-address-split";

function buildCapsName(data: ProfileEditorData): string {
  const first = (data.first_name || "").trim();
  const last = (data.last_name || "").trim();
  const title = (data.title || "").trim();
  const core = [first, last].filter(Boolean).join(" ").toUpperCase();
  if (!core) return (data.display_name || "Ihre Praxis").toUpperCase();
  if (/^dr\.?\s/i.test(title)) {
    return `DR. ${core}`;
  }
  if (title) return `${title.toUpperCase()} ${core}`;
  return core;
}

function splitHeadline(practiceName: string | null, workspaceName: string): {
  lead: string;
  rest: string | null;
} {
  const raw = (practiceName || workspaceName).trim();
  const words = raw.split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return { lead: raw || "Ihre Praxis", rest: null };
  }
  return { lead: words[0]!, rest: words.slice(1).join(" ") };
}

function defaultEyebrow(city: string): string {
  return city ? `Ihre Praxis in ${city}` : "Willkommen in Ihrer Praxis";
}

function initials(data: ProfileEditorData): string {
  const first = (data.first_name || "").trim();
  const last = (data.last_name || "").trim();
  if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  const name = (data.display_name || "PR").trim();
  return name.slice(0, 2).toUpperCase();
}

function buildRoleLine(
  practiceName: string,
  city: string,
  employmentStatus: string | null,
): string {
  const parts = ["Zahnarzt"];
  const status = (employmentStatus || "").trim();
  if (status) parts.push(status);
  if (practiceName) parts.push(practiceName);
  if (city) parts.push(city);
  return parts.join(" · ");
}

export type CarreeEditorialHeroProps = {
  data: ProfileEditorData;
  workspaceName: string;
  slug?: string;
  appointmentLink?: string | null;
  compact?: boolean;
  showUploadCta?: boolean;
  onPortraitEdit?: () => void;
  portraitEditPending?: boolean;
};

export function CarreeEditorialHero({
  data,
  workspaceName,
  slug,
  appointmentLink = null,
  compact = false,
  showUploadCta = false,
  onPortraitEdit,
  portraitEditPending = false,
}: CarreeEditorialHeroProps) {
  const addr = parsePracticeAddressBlock(data.practice_address);
  const city = addr.city.trim();
  const practiceName = (data.practice_name || workspaceName).trim();
  const headline = splitHeadline(data.practice_name, workspaceName);
  const capsName = buildCapsName(data);
  const roleLine = buildRoleLine(practiceName, city, data.practice_employment_status);
  const monogram = practiceMonogram(practiceName);
  const eyebrow = (data.practice_subtitle || "").trim() || defaultEyebrow(city);

  const terminHref = appointmentLink?.trim() || (data.practice_phone ? `tel:${data.practice_phone}` : null);
  const terminLabel =
    appointmentLink?.trim() ||
    data.practice_phone?.trim() ||
    null;
  const email = data.practice_email?.trim() || null;
  const addressLine = [addr.street, [addr.postalCode, addr.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  const hasContact = Boolean(terminLabel || email || addressLine);

  return (
    <header className={`yd-carree-hero${compact ? " yd-carree-hero--compact" : ""}`}>
      {(data.logo_url || monogram) ? (
        <div className="yd-carree-hero__watermark" aria-hidden>
          {data.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logo_url} alt="" className="yd-carree-hero__watermark-logo" />
          ) : (
            <CarreeWatermarkLetters letters={monogram} className="yd-carree-hero__watermark-letters" />
          )}
        </div>
      ) : null}

      <div className="yd-carree-hero__top">
        <div className="yd-carree-hero__brand">
          {data.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logo_url} alt="" className="yd-carree-hero__logo-mark" />
          ) : (
            <CarreeMonogramMark letters={monogram} className="yd-carree-hero__logo-mark-svg" />
          )}
          <span className="yd-carree-hero__logo-text">{practiceNameCaps(practiceName)}</span>
        </div>
      </div>

      <div className="yd-carree-hero__inner">
        <p className="yd-carree-hero__eyebrow">{eyebrow}</p>
        <h1 className="yd-carree-hero__headline">
          <span className="yd-carree-hero__headline-first">{headline.lead}</span>
          {headline.rest ? (
            <span className="yd-carree-hero__headline-line">{headline.rest}.</span>
          ) : (
            <span className="yd-carree-hero__headline-line">.</span>
          )}
        </h1>
        <p className="yd-carree-hero__name">{capsName}</p>
        <p className="yd-carree-hero__role">{roleLine}</p>

        {hasContact ? (
          <div className="yd-carree-hero__contact-block">
            <div className="yd-carree-hero__contact-chips">
              {terminLabel ? (
                <div className="yd-carree-hero__chip">
                  <Phone className="yd-carree-hero__chip-icon" strokeWidth={1.5} aria-hidden />
                  {terminHref ? (
                    <a href={terminHref} className="yd-carree-hero__chip-value">
                      {terminLabel}
                    </a>
                  ) : (
                    <span className="yd-carree-hero__chip-value">{terminLabel}</span>
                  )}
                </div>
              ) : null}
              {email ? (
                <div className="yd-carree-hero__chip">
                  <Mail className="yd-carree-hero__chip-icon" strokeWidth={1.5} aria-hidden />
                  <a href={`mailto:${email}`} className="yd-carree-hero__chip-value">
                    {email}
                  </a>
                </div>
              ) : null}
            </div>
            {addressLine ? (
              <p className="yd-carree-hero__address-line">
                <MapPin className="yd-carree-hero__address-icon" strokeWidth={1.5} aria-hidden />
                <span>{addressLine}</span>
              </p>
            ) : null}
          </div>
        ) : null}

        {showUploadCta && slug ? (
          <div className="yd-carree-hero__cta-row">
            <Link href={`/doc/${slug}/upload`} className="yd-carree-hero__cta-link">
              Unterlagen einsenden
            </Link>
          </div>
        ) : null}
      </div>

      <div className="yd-carree-hero__portrait-stage" aria-hidden={!data.photo_url && !onPortraitEdit}>
        {onPortraitEdit ? (
          <button
            type="button"
            className="yd-carree-hero__portrait-edit"
            onClick={onPortraitEdit}
            disabled={portraitEditPending}
            aria-busy={portraitEditPending}
          >
            <Camera className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            {portraitEditPending ? "Wird hochgeladen…" : "Porträt ändern"}
          </button>
        ) : null}
        <div className="yd-carree-hero__portrait">
          {data.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photo_url} alt="" />
          ) : (
            <div className="yd-carree-hero__portrait-placeholder">
              <span>{initials(data)}</span>
              <span>Porträt</span>
            </div>
          )}
          <div className="yd-carree-hero__portrait-fade" />
        </div>
      </div>
    </header>
  );
}
