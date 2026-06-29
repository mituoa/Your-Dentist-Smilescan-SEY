import Link from "next/link";

import { LegalDraftBanner } from "@/components/legal/legal-draft-banner";
import {
  LEGAL_DRAFT_FOOTER,
  LEGAL_DOCUMENT_VERSION,
  formatLegalEffectiveDate,
} from "@/lib/legal/meta";
import type { LegalDocument } from "@/lib/legal/types";

type LegalDocumentViewProps = {
  document: LegalDocument;
};

export function LegalDocumentView({ document }: LegalDocumentViewProps) {
  const effectiveDate = formatLegalEffectiveDate();

  return (
    <article className="yd-legal-doc">
      <LegalDraftBanner />

      <header className="yd-legal-doc__head">
        <h1 className="yd-legal-doc__title">{document.title}</h1>
        <p className="yd-legal-doc__meta">
          Version {LEGAL_DOCUMENT_VERSION} · Stand {effectiveDate}
        </p>
      </header>

      <nav className="yd-legal-doc__toc" aria-label="Inhaltsverzeichnis">
        <p className="yd-legal-doc__toc-title">Inhaltsverzeichnis</p>
        <ol className="yd-legal-doc__toc-list">
          {document.sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="yd-legal-doc__toc-link">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="yd-legal-doc__body">
        {document.sections.map((s) => (
          <section key={s.id} id={s.id} className="yd-legal-doc__section">
            <h2 className="yd-legal-doc__section-title">{s.title}</h2>
            {s.paragraphs.map((p) => (
              <p key={p.slice(0, 48)} className="yd-legal-doc__p">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>

      <footer className="yd-legal-doc__footer">
        <p>{LEGAL_DRAFT_FOOTER}</p>
        <p>
          <Link href="/legal" className="yd-legal-doc__footer-link">
            Alle rechtlichen Dokumente
          </Link>
        </p>
      </footer>
    </article>
  );
}
