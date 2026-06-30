"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PREVIEW_PRACTICE_PARAMS } from "@/lib/marketing/landingpages/generic-practice";
import { readPreviewContentFromSearchParams } from "@/lib/marketing/landingpages/landing-preview-content";

type Props = {
  children: React.ReactNode;
};

function PreviewBanner() {
  const params = useSearchParams();
  const hasOwnData = params.get(PREVIEW_PRACTICE_PARAMS.name) !== null;
  const hasContent = readPreviewContentFromSearchParams(params) !== null;

  return (
    <div className="yd-lp-preview-banner" role="status" aria-live="polite">
      <div className="yd-lp-preview-banner__inner">
        <div className="yd-lp-preview-banner__copy">
          <p className="yd-lp-preview-banner__eyebrow">
            {hasOwnData || hasContent ? "Vorschau mit Ihren Angaben" : "Beispielvorlage"}
          </p>
          <p className="yd-lp-preview-banner__text">
            {hasOwnData || hasContent
              ? "Stammdaten und Konfigurator-Antworten sind eingespielt. Layout und Texte dienen als Ausgangspunkt — Ihre finale Seite gestalten wir gemeinsam."
              : "Vorgefertigte Vorlage zur Orientierung. Nach der Konfiguration sehen Sie hier Ihre Praxisdaten."}
          </p>
        </div>
        <Link href="/profile/editor#praxis-loesungen" className="yd-lp-preview-banner__back">
          <ArrowLeft size={14} aria-hidden />
          Zurück
        </Link>
      </div>
    </div>
  );
}

/** Hinweis auf geschützten Landingpage-Vorschauen (nach Anmeldung). */
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
