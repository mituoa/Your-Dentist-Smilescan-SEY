import type { Metadata } from "next";

import { TrustHomeOverview } from "@/components/trust/trust-document-page";
import { TrustShell } from "@/components/trust/trust-shell";
import { loadTrustPageContext } from "@/lib/trust/trust-page-context";

export const metadata: Metadata = {
  title: "Trust Center",
  description: "Datenschutz, Sicherheit und Transparenz für moderne Zahnarztpraxen.",
  robots: { index: true, follow: true },
};

type TrustHomePageProps = {
  searchParams: Promise<{ return?: string }>;
};

export default async function TrustHomePage({ searchParams }: TrustHomePageProps) {
  const { returnTo, isAuthenticated } = await loadTrustPageContext(searchParams);

  return (
    <TrustShell returnTo={returnTo} isAuthenticated={isAuthenticated}>
      <div className="yd-trust-overview">
        <TrustHomeOverview returnTo={returnTo} />
      </div>
    </TrustShell>
  );
}
