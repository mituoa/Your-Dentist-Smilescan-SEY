import Link from "next/link";
import type { ProfileEditorData } from "@/lib/types/profile-editor-data";
import { parsePracticeAddressBlock } from "@/lib/profile/practice-address-split";

function formatEditorialDate(foundingYear: number | null): string {
  if (foundingYear) {
    return `Seit ${foundingYear}`;
  }
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd} . ${mm} . ${yyyy}`;
}

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

function displayWebsite(url: string): string {
  try {
    const host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    return host.replace(/^www\./i, "").toLowerCase();
  } catch {
    return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
  }
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
};

export function CarreeEditorialHero({
  data,
  workspaceName,
  slug,
  appointmentLink = null,
  compact = false,
  showUploadCta = false,
}: CarreeEditorialHeroProps) {
  const addr = parsePracticeAddressBlock(data.practice_address);
  const city = addr.city.trim();
  const practiceName = (data.practice_name || workspaceName).trim();
  const headline = splitHeadline(data.practice_name, workspaceName);
  const capsName = buildCapsName(data);
  const roleLine = buildRoleLine(practiceName, city, data.practice_employment_status);

  const terminHref = appointmentLink?.trim() || (data.practice_phone ? `tel:${data.practice_phone}` : null);
  const terminLabel =
    appointmentLink?.trim() ||
    data.practice_phone?.trim() ||
    null;
  const webUrl = data.practice_website?.trim() || null;

  const tagline = city
    ? `ihre praxis in ${city.toLowerCase()}`
    : "willkommen in ihrer praxis";

  return (
    <header className={`yd-carree-hero${compact ? " yd-carree-hero--compact" : ""}`}>
      <div className="yd-carree-hero__top">
        {data.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.logo_url} alt="" className="yd-carree-hero__logo" />
        ) : (
          <span className="yd-carree-hero__logo-text">{practiceName}</span>
        )}
        <p className="yd-carree-hero__date">{formatEditorialDate(data.founding_year)}</p>
      </div>

      <div className="yd-carree-hero__inner">
        <p className="yd-carree-hero__tagline">{tagline}</p>
        <h1 className="yd-carree-hero__headline">
          {headline.lead}
          {headline.rest ? (
            <>
              <br />
              <em>{headline.rest}.</em>
            </>
          ) : (
            "."
          )}
        </h1>
        <p className="yd-carree-hero__name">{capsName}</p>
        <p className="yd-carree-hero__role">{roleLine}</p>

        {(terminLabel || webUrl) && (
          <div className="yd-carree-hero__contact">
            {terminLabel ? (
              <div className="yd-carree-hero__contact-row">
                <span className="yd-carree-hero__contact-label">Termin</span>
                {terminHref ? (
                  <a href={terminHref} className="yd-carree-hero__contact-value">
                    {terminLabel}
                  </a>
                ) : (
                  <span className="yd-carree-hero__contact-value">{terminLabel}</span>
                )}
              </div>
            ) : null}
            {webUrl ? (
              <div className="yd-carree-hero__contact-row">
                <span className="yd-carree-hero__contact-label">Web</span>
                <a
                  href={webUrl.startsWith("http") ? webUrl : `https://${webUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="yd-carree-hero__contact-value"
                >
                  {displayWebsite(webUrl)}
                </a>
              </div>
            ) : null}
          </div>
        )}

        {showUploadCta && slug ? (
          <div className="yd-carree-hero__cta-row">
            <Link href={`/doc/${slug}/upload`} className="yd-carree-hero__cta-link">
              Unterlagen einsenden
            </Link>
            {data.practice_email ? (
              <a href={`mailto:${data.practice_email}`} className="yd-carree-hero__cta-link">
                Kontakt
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="yd-carree-hero__portrait-stage" aria-hidden={!data.photo_url}>
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
