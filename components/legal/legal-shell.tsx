import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { YdPublicSiteFooter } from "@/components/marketing/yd-public-site-footer";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";

type LegalShellProps = {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function LegalShell({
  children,
  backHref = "/legal",
  backLabel = "Rechtliche Informationen",
}: LegalShellProps) {
  return (
    <YdPublicOsEnvironment scroll landingAtmosphere>
      <div className="yd-legal">
        <YdProductChrome variant="entry" tagline={null} />
        <main className="yd-legal-main">
          <div className="yd-legal-container">
            <Link href={backHref} className="yd-legal-back">
              <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
              {backLabel}
            </Link>
            {children}
          </div>
        </main>
        <YdPublicSiteFooter compact />
      </div>
    </YdPublicOsEnvironment>
  );
}
