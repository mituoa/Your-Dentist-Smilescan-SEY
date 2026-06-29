import { ResetPasswordForm } from "./ResetPasswordForm";
import { YdAuthIntro, YdAuthLegalFooter } from "@/components/auth/yd-auth-ui";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";
import { sanitizeTeamInvitationTokenForAuth } from "@/lib/team-invitations/sanitize-invite-token-for-auth";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token_hash?: string; type?: string; invite?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const tokenHash = params.token_hash?.trim() || null;
  const type = params.type?.trim() || null;
  const invite = sanitizeTeamInvitationTokenForAuth(params.invite);

  return (
    <YdPublicOsEnvironment mode="focus" scroll landingAtmosphere instantEnter>
      <main className="yd-product-entry yd-login-page-entry">
        <YdProductChrome variant="entry" />
        <section className="yd-product-entry-card yd-clinical-entry--login yd-clinical-entry-panel--login-entrance">
          <YdAuthIntro
            title="Neues Passwort festlegen"
            subtitle="Wählen Sie ein sicheres Passwort für Ihren geschützten Praxiszugang."
            fieldIndex={0}
          />
          <ResetPasswordForm
            tokenHashFromQuery={tokenHash}
            typeFromQuery={type}
            inviteTokenFromQuery={invite || null}
          />
          <YdAuthLegalFooter className="mt-8" />
        </section>
      </main>
    </YdPublicOsEnvironment>
  );
}
