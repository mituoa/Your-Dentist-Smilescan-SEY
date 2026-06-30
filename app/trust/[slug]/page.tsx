import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrustDocumentPage } from "@/components/trust/trust-document-page";
import { TrustShell } from "@/components/trust/trust-shell";
import { getAppBaseUrl } from "@/lib/env";
import { getTrustDocument, isTrustSlug, TRUST_SLUGS } from "@/lib/trust/documents";
import { loadTrustPageContext } from "@/lib/trust/trust-page-context";

type TrustSlugPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ return?: string }>;
};

export function generateStaticParams() {
  return TRUST_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: TrustSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isTrustSlug(slug)) return { title: "Trust Center" };
  const doc = getTrustDocument(slug);
  return {
    title: `${doc.title} · Trust Center`,
    description: doc.description,
    robots: { index: true, follow: true },
  };
}

export default async function TrustSlugPage({ params, searchParams }: TrustSlugPageProps) {
  const { slug } = await params;
  if (!isTrustSlug(slug)) notFound();

  const document = getTrustDocument(slug);
  const base = getAppBaseUrl().replace(/\/$/, "");
  const canonicalUrl = `${base}/trust/${slug}`;
  const { returnTo, isAuthenticated } = await loadTrustPageContext(searchParams);

  return (
    <TrustShell returnTo={returnTo} isAuthenticated={isAuthenticated} showEscapeBar={false}>
      <TrustDocumentPage
        document={document}
        canonicalPath={canonicalUrl}
        returnTo={returnTo}
      />
    </TrustShell>
  );
}
