"use client";

import Link from "next/link";

import { ForgotPasswordCard } from "@/components/auth/forgot-password-card";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
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
    <YdPublicOsEnvironment mode="focus">
      <div className="yd-clinical-entry yd-clinical-entry--login">
        <div className="yd-clinical-entry-panel">
          <div
            className="yd-auth-login-brand yd-auth-awaken-field"
            style={{ ["--yd-auth-field-i" as string]: "0" }}
          >
            <YourDentistBrandLockup size="md" tagline="Neutral Practice Platform" centered />
          </div>

          <div className="yd-auth-intro yd-auth-awaken-field" style={{ ["--yd-auth-field-i" as string]: "1" }}>
            <h1 className="yd-public-entry-title">Passwort zurücksetzen</h1>
            <p className="yd-public-entry-lead">
              {sent
                ? "Prüfen Sie Ihren Posteingang — der Link ist nur begrenzt gültig."
                : "E-Mail eingeben — Sie erhalten einen geschützten Link zum Zurücksetzen."}
            </p>
          </div>

          <ForgotPasswordCard
            sent={sent}
            errorRaw={errorRaw}
            inviteToken={inviteToken}
            prefilledEmail={prefilledEmail}
            shell="minimal"
          />

          <p className="yd-auth-legal-minimal yd-auth-awaken-field mt-6" style={{ ["--yd-auth-field-i" as string]: "3" }}>
            <Link prefetch href={inviteToken ? `/login?invite=${encodeURIComponent(inviteToken)}` : "/login"}>
              Zur Anmeldung
            </Link>
          </p>
        </div>
      </div>
    </YdPublicOsEnvironment>
  );
}
