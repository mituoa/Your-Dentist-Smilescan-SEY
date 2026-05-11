import Link from "next/link";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { ResetPasswordForm } from "./ResetPasswordForm";
import {
  AUTH_CARD_SHELL_CLASS,
  AUTH_LOGO_BLOCK_CLASS,
  AUTH_NARROW_COLUMN_CLASS,
  AUTH_SCREEN_CANVAS_CLASS,
  authCardShellShadowStyle,
  authScreenCanvasStyle,
} from "@/lib/auth/auth-screen-shell";
import { sanitizeTeamInvitationTokenForAuth } from "@/lib/team-invitations/sanitize-invite-token-for-auth";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token_hash?: string; type?: string; invite?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const tokenHash = params.token_hash?.trim() || null;
  const type = params.type?.trim() || null;
  const invite = sanitizeTeamInvitationTokenForAuth(params.invite);

  return (
    <div className={AUTH_SCREEN_CANVAS_CLASS} style={authScreenCanvasStyle}>
      <div className={`flex min-h-[100dvh] flex-col ${AUTH_NARROW_COLUMN_CLASS}`}>
        <div className={AUTH_LOGO_BLOCK_CLASS}>
          <YourDentistBrandLockup
            size="md"
            tagline="Neutral Practice Platform"
            centered
            priority
          />
        </div>

        <div className={AUTH_CARD_SHELL_CLASS} style={authCardShellShadowStyle}>
          <ResetPasswordForm
            tokenHashFromQuery={tokenHash}
            typeFromQuery={type}
            inviteTokenFromQuery={invite || null}
          />

          <p className="mt-10 border-t border-gray-100/90 pt-8 text-center text-[13px] text-slate-600 sm:mt-11 sm:pt-9 sm:text-sm">
            <Link
              prefetch
              href="/login"
              className="inline-flex min-h-[44px] touch-manipulation items-center font-medium text-[#0284C7] underline-offset-2 transition-colors hover:text-[#0369A1] hover:underline max-md:py-2 md:min-h-0 md:py-0"
            >
              Zurück zum Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
