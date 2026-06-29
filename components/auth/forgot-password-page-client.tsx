"use client";

import Link from "next/link";

import { ForgotPasswordCard } from "@/components/auth/forgot-password-card";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";

type ForgotPasswordPageClientProps = {
  sent: boolean;
  errorRaw: string;
  inviteToken: string;
  prefilledEmail: string;
};

function buildLoginHref(inviteToken: string, prefilledEmail: string): string {
  if (!inviteToken) return "/login";
  const base = `/login?invite=${encodeURIComponent(inviteToken)}`;
  return prefilledEmail ? `${base}&email=${encodeURIComponent(prefilledEmail)}` : base;
}

/** Gleiche Shell wie Anmeldung — eine Karte, Brand oben, ruhige Recovery-Copy. */
export function ForgotPasswordPageClient({
  sent,
  errorRaw,
  inviteToken,
  prefilledEmail,
}: ForgotPasswordPageClientProps) {
  const loginHref = buildLoginHref(inviteToken, prefilledEmail);

  return (
    <YdPublicOsEnvironment mode="focus" scroll landingAtmosphere>
      <main className="yd-product-entry yd-login-page-entry">
        <YdProductChrome variant="entry" />
        <section className="yd-product-entry-card yd-clinical-entry--login yd-clinical-entry-panel--login-entrance">
          <div className="min-w-0">
            <header className="yd-auth-intro yd-auth-intro--recovery">
              <h1 className="yd-public-entry-title yd-public-entry-title--login">Passwort zurücksetzen</h1>
            </header>

            {sent ? (
              <div
                className="yd-auth-alert yd-auth-alert--success yd-auth-alert--recovery mb-5"
                role="status"
              >
                <p className="yd-auth-alert-title">Prüfen Sie Ihr Postfach.</p>
                <p className="yd-auth-alert--recovery-hint">
                  Auch Spam — der Link ist nur kurz gültig.
                </p>
              </div>
            ) : null}

            <ForgotPasswordCard
              sent={sent}
              errorRaw={errorRaw}
              inviteToken={inviteToken}
              prefilledEmail={prefilledEmail}
              shell="minimal"
            />

            <div className="yd-auth-login-access">
              <p className="yd-auth-register yd-auth-register--subtle">
                <Link prefetch href={loginHref} className="yd-auth-access-link">
                  Zurück zur Anmeldung
                </Link>
              </p>
            </div>

            <footer className="yd-auth-legal-minimal">
              <nav className="yd-auth-legal-minimal-links" aria-label="Rechtliches">
                <Link href="/datenschutz" className="yd-auth-legal-minimal-link">
                  Datenschutz
                </Link>
                <Link href="/impressum" className="yd-auth-legal-minimal-link">
                  Impressum
                </Link>
              </nav>
            </footer>
          </div>
        </section>
      </main>
    </YdPublicOsEnvironment>
  );
}
