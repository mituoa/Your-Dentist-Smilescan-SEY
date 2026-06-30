import type { Metadata } from "next";

import { TrustHomeOverview } from "@/components/trust/trust-document-page";
import { TrustShell } from "@/components/trust/trust-shell";

export const metadata: Metadata = {
  title: "Trust Center",
  description: "Datenschutz, Sicherheit und Transparenz für moderne Zahnarztpraxen.",
  robots: { index: true, follow: true },
};

export default function TrustHomePage() {
  return (
    <TrustShell>
      <div className="yd-trust-overview">
        <TrustHomeOverview />
      </div>
    </TrustShell>
  );
}
