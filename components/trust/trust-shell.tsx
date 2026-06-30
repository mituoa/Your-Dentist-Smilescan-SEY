import Link from "next/link";

import { TrustMobileNav } from "@/components/trust/trust-mobile-nav";
import { YdPublicSiteFooter } from "@/components/marketing/yd-public-site-footer";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";

type TrustShellProps = {
  children: React.ReactNode;
};

export function TrustShell({ children }: TrustShellProps) {
  return (
    <YdPublicOsEnvironment scroll landingAtmosphere>
      <div className="yd-trust">
        <YdProductChrome variant="entry" tagline={null} />
        <TrustMobileNav />
        <main className="yd-trust-main">{children}</main>
        <YdPublicSiteFooter compact />
      </div>
    </YdPublicOsEnvironment>
  );
}

export function TrustBackLink() {
  return (
    <Link href="/?welcome=1" className="yd-trust-back">
      Startseite
    </Link>
  );
}
