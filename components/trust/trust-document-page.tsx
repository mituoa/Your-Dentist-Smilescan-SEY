import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { TrustDocumentActions } from "@/components/trust/trust-document-actions";
import { TrustCenterIndex } from "@/components/trust/trust-center-index";
import { TRUST_HOME_SECTIONS } from "@/lib/trust/navigation";
import {
  TRUST_DOCUMENT_VERSION,
  formatTrustEffectiveDate,
  trustDraftFooter,
  trustDraftNotice,
  trustDraftStatusLabel,
} from "@/lib/trust/meta";
import { withTrustReturn } from "@/lib/trust/return-path";
import type { TrustDocument } from "@/lib/trust/types";

type TrustDocumentPageProps = {
  document: TrustDocument;
  canonicalPath: string;
  returnTo?: string;
};

export function TrustDocumentPage({ document, canonicalPath, returnTo }: TrustDocumentPageProps) {
  const effectiveDate = formatTrustEffectiveDate();
  const draftNotice = document.draftNotice ?? trustDraftNotice();
  const draftStatus = trustDraftStatusLabel();
  const draftFooter = trustDraftFooter();
  const trustCenterHref = withTrustReturn("/trust", returnTo);
  const trustCenterLabel = "Zurück zum Trust Center";

  return (
    <div className="yd-trust-doc-layout yd-trust-doc-layout--focus">
      <div className="yd-trust-print-header" aria-hidden>
        <span>Your Dentist</span>
        <span>{document.title}</span>
      </div>
      <div className="yd-trust-print-footer" aria-hidden>
        <span>Sanctus Cura Holdings Ltd · Agias Eirinis, Beach Garden, Athina Block, Flat/Office 7, Mandria 8504, Pafos, Zypern</span>
        <span>{document.title} · Version {TRUST_DOCUMENT_VERSION} · Stand {effectiveDate}</span>
      </div>
      <article className="yd-trust-doc">
        <nav className="yd-trust-doc__crumb" aria-label="Zurück">
          <Link href={trustCenterHref} className="yd-trust-doc__back">
            <ChevronLeft className="yd-trust-doc__back-icon" strokeWidth={2} aria-hidden />
            {trustCenterLabel}
          </Link>
        </nav>

        {draftNotice ? (
          <div className="yd-trust-doc__draft" role="note">
            <p>{draftNotice}</p>
          </div>
        ) : null}

        <header className="yd-trust-doc__header">
          <h1 className="yd-trust-doc__title">{document.title}</h1>
          <div className="yd-trust-doc__meta">
            <span>Version {TRUST_DOCUMENT_VERSION}</span>
            <span aria-hidden>·</span>
            <span>Stand {effectiveDate}</span>
            {draftStatus ? (
              <>
                <span aria-hidden>·</span>
                <span className="yd-trust-doc__status">{draftStatus}</span>
              </>
            ) : null}
          </div>
          <TrustDocumentActions canonicalUrl={canonicalPath} />
        </header>

        <div
          className="yd-trust-doc__body"
          dangerouslySetInnerHTML={{ __html: document.html }}
        />

        <footer className="yd-trust-doc__footer">
          {draftFooter ? <p>{draftFooter}</p> : null}
          <Link href={trustCenterHref} className="yd-trust-doc__footer-link">
            {trustCenterLabel}
          </Link>
        </footer>
      </article>
    </div>
  );
}

export function TrustHomeOverview({ returnTo }: { returnTo?: string }) {
  return <TrustCenterIndex sections={TRUST_HOME_SECTIONS} titleAs="h1" returnTo={returnTo} />;
}
