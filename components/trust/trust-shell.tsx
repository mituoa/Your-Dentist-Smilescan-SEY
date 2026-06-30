import Link from "next/link";

import { YdPublicSiteFooter } from "@/components/marketing/yd-public-site-footer";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";
import { TrustEscapeBar } from "@/components/trust/trust-escape-bar";

type TrustShellProps = {
  children: React.ReactNode;
  returnTo?: string;
  isAuthenticated?: boolean;
};

export function TrustShell({
  children,
  returnTo,
  isAuthenticated = false,
}: TrustShellProps) {
  const showEscape = returnTo !== "/trust";

  return (
    <YdPublicOsEnvironment scroll landingAtmosphere>
      <div className="yd-trust">
        <YdProductChrome
          variant="entry"
          tagline={null}
          loginHref={isAuthenticated ? returnTo ?? "/dashboard" : "/login"}
        />
        {showEscape ? (
          <TrustEscapeBar
            returnTo={returnTo!}
            label={
              returnTo?.startsWith("/settings")
                ? "Zurück zu Einstellungen"
                : "Zurück zur Praxis"
            }
          />
        ) : null}
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
