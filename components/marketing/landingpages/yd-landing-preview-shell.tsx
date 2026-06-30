import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

/** Sticky Hinweis auf geschützten Landingpage-Vorschauen (nur nach Anmeldung). */
export function YdLandingPreviewShell({ children }: Props) {
  return (
    <div className="yd-lp-preview-shell">
      <div className="yd-lp-preview-banner" role="status" aria-live="polite">
        <div className="yd-lp-preview-banner__inner">
          <div className="yd-lp-preview-banner__copy">
            <p className="yd-lp-preview-banner__eyebrow">Beispielvorlage</p>
            <p className="yd-lp-preview-banner__text">
              Texte, Bilder und Angaben werden individuell an Ihre Praxis angepasst.
            </p>
          </div>
          <Link href="/profile/solutions" className="yd-lp-preview-banner__back">
            <ArrowLeft size={14} aria-hidden />
            Landingpages
          </Link>
        </div>
      </div>
      <div className="yd-lp-preview-shell__content">{children}</div>
    </div>
  );
}
