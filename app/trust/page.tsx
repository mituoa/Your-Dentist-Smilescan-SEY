import type { Metadata } from "next";

import { TrustHomeCards, TrustHomeHero } from "@/components/trust/trust-document-page";
import { TrustShell } from "@/components/trust/trust-shell";
import { TrustSidebar } from "@/components/trust/trust-sidebar";
import { TRUST_HOME_CARDS } from "@/lib/trust/navigation";
import { TRUST_DRAFT_BANNER } from "@/lib/trust/meta";

export const metadata: Metadata = {
  title: "Trust Center",
  description: "Datenschutz, Sicherheit und Transparenz für moderne Zahnarztpraxen.",
  robots: { index: true, follow: true },
};

export default function TrustHomePage() {
  return (
    <TrustShell>
      <div className="yd-trust-overview-layout">
        <aside className="yd-trust-overview-layout__sidebar">
          <TrustSidebar />
        </aside>
        <div className="yd-trust-overview-layout__main">
          <TrustHomeHero />
          <div className="yd-trust-home__draft" role="note">
            <p>{TRUST_DRAFT_BANNER}</p>
          </div>
          <TrustHomeCards cards={TRUST_HOME_CARDS} />
        </div>
      </div>
    </TrustShell>
  );
}
