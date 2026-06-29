import { permanentRedirect } from "next/navigation";

import { LEGAL_TO_TRUST_REDIRECTS } from "@/lib/trust/navigation";

type LegalSlugRedirectProps = {
  params: Promise<{ slug: string }>;
};

export default async function LegalSlugRedirectPage({ params }: LegalSlugRedirectProps) {
  const { slug } = await params;
  const target = LEGAL_TO_TRUST_REDIRECTS[slug] ?? "/trust";
  permanentRedirect(target);
}
