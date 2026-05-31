import type { Metadata } from "next";

import { ForgotPasswordPageClient } from "@/components/auth/forgot-password-page-client";
import { sanitizeTeamInvitationTokenForAuth } from "@/lib/team-invitations/sanitize-invite-token-for-auth";

export const metadata: Metadata = {
  title: "Passwort zurücksetzen",
  description:
    "Geschützter Link zum Zurücksetzen Ihres Praxis-Zugangs — Your Dentist, Neutral Practice Platform.",
  robots: { index: false, follow: false },
};

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
    <ForgotPasswordPageClient
      sent={sent}
      errorRaw={errorRaw}
      inviteToken={inviteToken}
      prefilledEmail={prefilledEmail}
    />
  );
}
