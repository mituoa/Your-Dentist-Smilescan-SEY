"use client";

import Link from "next/link";

import { ForgotPasswordCard } from "@/components/auth/forgot-password-card";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { PUBLIC_BRAND_TAGLINE } from "@/lib/brand/constants";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";

type ForgotPasswordPageClientProps = {
  sent: boolean;
  errorRaw: string;
  inviteToken: string;
  prefilledEmail: string;
};

/** Gleiche Login-/Brand-Shell wie Anmeldung — ruhig, warm, ohne Legacy-Auth-Chrome. */
export function ForgotPasswordPageClient({
  sent,
  errorRaw,
  inviteToken,
  prefilledEmail,
}: ForgotPasswordPageClientProps) {
  return (
    <YdPublicOsEnvironment mode="focus" landingAtmosphere instantEnter>
      <div className="yd-clinical-entry yd-clinical-entry--login">
        <div className="yd-clinical-entry-panel yd-clinical-entry-panel--login-entrance">
          <div
            className="yd-auth-login-brand yd-auth-awaken-field"
            style={{ ["--yd-auth-field-i" as string]: "0" }}
          >
            <YourDentistBrandLockup size="md" centered tagline={PUBLIC_BRAND_TAGLINE} />
          </div>

          <div className="yd-auth-intro yd-auth-awaken-field" style={{ ["--yd-auth-field-i" as string]: "1" }}>
            <h1 className="yd-public-entry-title yd-public-entry-title--login">Passwort zurücksetzen</h1>
            <p className="yd-public-entry-lead yd-public-entry-lead--login">
              {sent
                ? "E-Mail gesendet. Bitte prüfen Sie Ihr Postfach."
                : "Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts."}
            </p>
          </div>

          <ForgotPasswordCard
            sent={sent}
            errorRaw={errorRaw}
            inviteToken={inviteToken}
            prefilledEmail={prefilledEmail}
            shell="minimal"
          />

          <p className="yd-auth-back-to-login yd-auth-awaken-field" style={{ ["--yd-auth-field-i" as string]: "3" }}>
            <Link prefetch href={inviteToken ? `/login?invite=${encodeURIComponent(inviteToken)}` : "/login"}>
              ← Zurück zur Anmeldung
            </Link>
          </p>
        </div>
      </div>
    </YdPublicOsEnvironment>
  );
}
