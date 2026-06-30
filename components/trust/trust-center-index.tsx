import Link from "next/link";
import {
  ChevronRight,
  Cookie,
  FileText,
  Lock,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

import { TRUST_HOME_CARDS } from "@/lib/trust/navigation";
import { withTrustReturn } from "@/lib/trust/return-path";
import { cn } from "@/lib/utils";
import type { TrustHomeCard, TrustHomeSection } from "@/lib/trust/types";

const TRUST_ROW_ICONS: Record<string, typeof Shield> = {
  privacy: Shield,
  security: Lock,
  "ai-principles": Sparkles,
  terms: FileText,
  "patient-privacy": Users,
  imprint: FileText,
  cookies: Cookie,
};

type TrustCenterIndexProps = {
  sections: TrustHomeSection[];
  /** Nach Lesen zurück in die App (z. B. Einstellungen). */
  returnTo?: string;
  titleAs?: "h1" | "h2";
  className?: string;
};

function TrustCenterRow({
  card,
  returnTo,
}: {
  card: TrustHomeCard;
  returnTo?: string;
}) {
  const Icon = TRUST_ROW_ICONS[card.slug] ?? Shield;
  const href = withTrustReturn(card.href, returnTo);

  return (
    <Link href={href} className={`yd-trust-index-row yd-trust-index-row--${card.accent}`}>
      <span className="yd-trust-index-row__main">
        <span className="yd-trust-index-row__icon" aria-hidden>
          <Icon size={15} strokeWidth={1.75} />
        </span>
        <span className="yd-trust-index-row__title">{card.title}</span>
      </span>
      <ChevronRight className="yd-trust-index-row__chevron" size={16} strokeWidth={1.75} aria-hidden />
    </Link>
  );
}

export function TrustCenterIndex({
  sections,
  returnTo,
  titleAs = "h2",
  className,
}: TrustCenterIndexProps) {
  const cardBySlug = new Map(TRUST_HOME_CARDS.map((card) => [card.slug, card]));
  const TitleTag = titleAs;

  return (
    <div className={cn("yd-trust-index", className)}>
      <header className="yd-trust-index__head">
        <span className="yd-trust-index__mark" aria-hidden>
          <Shield size={18} strokeWidth={1.75} />
        </span>
        <TitleTag className="yd-trust-index__title">Trust Center</TitleTag>
      </header>

      {sections.map((section) => (
        <section key={section.id} className="yd-trust-index-block" aria-label={section.kicker}>
          <h3 className="yd-trust-index-block__label">{section.kicker}</h3>
          <ul className="yd-trust-index-list">
            {section.slugs.map((slug) => {
              const card = cardBySlug.get(slug);
              if (!card) return null;
              return (
                <li key={slug}>
                  <TrustCenterRow card={card} returnTo={returnTo} />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
