import { YdAuthEnvironment } from "@/components/auth/yd-auth-environment";
import { YdAuthIntro, YdAuthLegalFooter } from "@/components/auth/yd-auth-ui";
import { ResetPasswordForm } from "./ResetPasswordForm";
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
    <YdAuthEnvironment>
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
    </YdAuthEnvironment>
  );
}
