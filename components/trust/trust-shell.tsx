import Link from "next/link";

import { YdPublicSiteFooter } from "@/components/marketing/yd-public-site-footer";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";
import { TrustEscapeBar } from "@/components/trust/trust-escape-bar";
import {
  appTrustBackLabel,
  isAppTrustReturnPath,
  isAuthTrustReturnPath,
} from "@/lib/trust/return-path";
import { cn } from "@/lib/utils";

type TrustShellProps = {
  children: React.ReactNode;
  returnTo?: string;
  isAuthenticated?: boolean;
  /** Escape-Leiste nur auf der Trust-Übersicht — nicht auf Einzeldokumenten. */
  showEscapeBar?: boolean;
};

export function TrustShell({
  children,
  returnTo,
  isAuthenticated = false,
  showEscapeBar = true,
}: TrustShellProps) {
  const authContext = isAuthTrustReturnPath(returnTo);
  const appContext = isAuthenticated || isAppTrustReturnPath(returnTo);
  const publicMarketing = !authContext && !appContext;
  const flatShell = appContext || authContext;
  const showEscape =
    showEscapeBar && Boolean(returnTo) && returnTo !== "/trust" && !authContext;

  return (
    <YdPublicOsEnvironment
      scroll
      instantEnter={flatShell}
      hideAtmosphere={flatShell}
      landingAtmosphere={publicMarketing}
      className={appContext ? "yd-public-os--trust-app" : undefined}
      mode={authContext ? "focus" : undefined}
    >
      <div
        className={cn(
          "yd-trust",
          authContext && "yd-trust--auth",
          appContext && "yd-trust--app"
        )}
      >
        {publicMarketing ? (
          <YdProductChrome variant="entry" tagline={null} loginHref="/login" />
        ) : null}
        {showEscape && returnTo ? (
          <TrustEscapeBar returnTo={returnTo} label={appTrustBackLabel(returnTo)} />
        ) : null}
        <main className="yd-trust-main">{children}</main>
        {publicMarketing ? <YdPublicSiteFooter compact /> : null}
      </div>
    </YdPublicOsEnvironment>
  );
}

export function TrustBackLink() {
  return (
    <Link href="/dashboard" className="yd-trust-back">
      Zurück zur Praxis
    </Link>
  );
}
