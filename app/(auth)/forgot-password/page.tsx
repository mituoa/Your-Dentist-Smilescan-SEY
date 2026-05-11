import { ForgotPasswordCard } from "@/components/auth/forgot-password-card";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import {
  AUTH_NARROW_COLUMN_CLASS,
  AUTH_SCREEN_CANVAS_CLASS,
  authScreenCanvasStyle,
} from "@/lib/auth/auth-screen-shell";
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
  /** Nie gleichzeitig Success-Kopf und Fehler (z. B. manipulierte URL / History). */
  const sent = params.sent === "1" && !errorRaw;
  const inviteToken = sanitizeTeamInvitationTokenForAuth(params.invite);
  const prefilledEmail = clipQueryString(params.email, MAX_EMAIL_QUERY_LEN);

  return (
    <div className={AUTH_SCREEN_CANVAS_CLASS} style={authScreenCanvasStyle}>
      <div className={`flex min-h-[100dvh] min-w-0 flex-col ${AUTH_NARROW_COLUMN_CLASS}`}>
        <div className="mb-7 flex shrink-0 justify-center sm:mb-8">
          <YourDentistBrandLockup
            size="md"
            tagline="Neutral Practice Platform"
            centered
            priority
          />
        </div>

        <ForgotPasswordCard
          sent={sent}
          errorRaw={errorRaw}
          inviteToken={inviteToken}
          prefilledEmail={prefilledEmail}
        />
      </div>
    </div>
  );
}
