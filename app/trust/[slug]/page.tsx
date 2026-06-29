import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrustDocumentPage } from "@/components/trust/trust-document-page";
import { TrustShell } from "@/components/trust/trust-shell";
import { getAppBaseUrl } from "@/lib/env";
import { getTrustDocument, isTrustSlug, TRUST_SLUGS } from "@/lib/trust/documents";

type TrustSlugPageProps = {
  params: Promise<{ slug: string }>;
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

export default async function TrustSlugPage({ params }: TrustSlugPageProps) {
  const { slug } = await params;
  if (!isTrustSlug(slug)) notFound();

  const document = getTrustDocument(slug);
  const base = getAppBaseUrl().replace(/\/$/, "");
  const canonicalUrl = `${base}/trust/${slug}`;

  return (
    <TrustShell>
      <TrustDocumentPage document={document} canonicalPath={canonicalUrl} />
    </TrustShell>
  );
}
