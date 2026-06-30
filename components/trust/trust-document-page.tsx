import Link from "next/link";

import { TrustDocumentActions } from "@/components/trust/trust-document-actions";
import { TrustCenterIndex } from "@/components/trust/trust-center-index";
import { TrustSidebar } from "@/components/trust/trust-sidebar";
import { TrustToc } from "@/components/trust/trust-toc";
import { TRUST_HOME_SECTIONS } from "@/lib/trust/navigation";
import {
  TRUST_DRAFT_BANNER,
  TRUST_DRAFT_FOOTER,
  TRUST_DRAFT_STATUS,
  TRUST_DOCUMENT_VERSION,
  formatTrustEffectiveDate,
} from "@/lib/trust/meta";
import type { TrustDocument } from "@/lib/trust/types";

type TrustDocumentPageProps = {
  document: TrustDocument;
  canonicalPath: string;
};

export function TrustDocumentPage({ document, canonicalPath }: TrustDocumentPageProps) {
  const effectiveDate = formatTrustEffectiveDate();

  return (
    <div className="yd-trust-doc-layout">
      <aside className="yd-trust-doc-layout__sidebar" data-print-hide>
        <TrustSidebar />
      </aside>

      <article className="yd-trust-doc">
        <div className="yd-trust-doc__draft" role="note">
          <p>{document.draftNotice ?? TRUST_DRAFT_BANNER}</p>
        </div>

        <header className="yd-trust-doc__header">
          <h1 className="yd-trust-doc__title">{document.title}</h1>
          <div className="yd-trust-doc__meta">
            <span>Version {TRUST_DOCUMENT_VERSION}</span>
            <span aria-hidden>·</span>
            <span>Stand {effectiveDate}</span>
            <span aria-hidden>·</span>
            <span className="yd-trust-doc__status">{TRUST_DRAFT_STATUS}</span>
          </div>
          <TrustDocumentActions canonicalUrl={canonicalPath} />
        </header>

        <div className="yd-trust-doc__mobile-toc" data-print-hide>
          <TrustToc items={document.toc} />
        </div>

        <div
          className="yd-trust-doc__body"
          dangerouslySetInnerHTML={{ __html: document.html }}
        />

        <footer className="yd-trust-doc__footer">
          <p>{TRUST_DRAFT_FOOTER}</p>
          <Link href="/trust" className="yd-trust-doc__footer-link">
            Zurück zur Übersicht
          </Link>
        </footer>
      </article>

      <aside className="yd-trust-doc-layout__toc" data-print-hide>
        <TrustToc items={document.toc} />
      </aside>
    </div>
  );
}

export function TrustHomeOverview() {
  return <TrustCenterIndex sections={TRUST_HOME_SECTIONS} titleAs="h1" />;
}
