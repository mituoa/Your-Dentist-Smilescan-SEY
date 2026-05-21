import { ForgotPasswordCard } from "@/components/auth/forgot-password-card";
import { YdAuthEnvironment } from "@/components/auth/yd-auth-environment";
import { sanitizeTeamInvitationTokenForAuth } from "@/lib/team-invitations/sanitize-invite-token-for-auth";

interface ForgotPasswordPageProps {
  searchParams: Promise<{ sent?: string; error?: string; invite?: string; email?: string }>;
}

const MAX_QUERY_ERROR_LEN = 512;
const MAX_EMAIL_QUERY_LEN = 320;

function clipQueryString(value: string | undefined, maxLen: number): string {
  if (!value) return "";
  const t = value.trim();
  if (!t) return "";
  return t.length > maxLen ? t.slice(0, maxLen) : t;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const errorRaw = clipQueryString(params.error, MAX_QUERY_ERROR_LEN);
  const sent = params.sent === "1" && !errorRaw;
  const inviteToken = sanitizeTeamInvitationTokenForAuth(params.invite);
  const prefilledEmail = clipQueryString(params.email, MAX_EMAIL_QUERY_LEN);

  return (
    <YdAuthEnvironment>
      <ForgotPasswordCard
        sent={sent}
        errorRaw={errorRaw}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
      />
    </YdAuthEnvironment>
  );
}
