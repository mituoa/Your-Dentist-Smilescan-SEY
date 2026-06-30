"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PREVIEW_PRACTICE_PARAMS } from "@/lib/marketing/landingpages/generic-practice";

type Props = {
  children: React.ReactNode;
};

function PreviewBanner() {
  const params = useSearchParams();
  const hasOwnData = params.get(PREVIEW_PRACTICE_PARAMS.name) !== null;

  return (
    <div className="yd-lp-preview-banner" role="status" aria-live="polite">
      <div className="yd-lp-preview-banner__inner">
        <div className="yd-lp-preview-banner__copy">
          <p className="yd-lp-preview-banner__eyebrow">
            {hasOwnData ? "Vorschau mit Ihren Angaben" : "Beispielvorlage"}
          </p>
          <p className="yd-lp-preview-banner__text">
            {hasOwnData
              ? "Praxisname, Ort und Telefon stammen aus Ihrer Konfiguration. Texte und Bilder zeigen weiterhin eine Vorführung, kein Endergebnis."
              : "Texte, Bilder und Angaben werden individuell an Ihre Praxis angepasst."}
          </p>
        </div>
        <Link href="/profile/solutions" className="yd-lp-preview-banner__back">
          <ArrowLeft size={14} aria-hidden />
          Landingpages
        </Link>
      </div>
    </div>
  );
}

/** Sticky Hinweis auf geschützten Landingpage-Vorschauen (nur nach Anmeldung). */
export function YdLandingPreviewShell({ children }: Props) {
  return (
    <div className="yd-lp-preview-shell">
      <Suspense fallback={null}>
        <PreviewBanner />
      </Suspense>
      <div className="yd-lp-preview-shell__content">{children}</div>
    </div>
  );
}
