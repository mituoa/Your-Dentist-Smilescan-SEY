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

interface ResetPasswordPageProps {
  searchParams: Promise<{ token_hash?: string; type?: string; invite?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const tokenHash = params.token_hash?.trim() || null;
  const type = params.type?.trim() || null;
  const invite = params.invite?.trim() || null;

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
            inviteTokenFromQuery={invite}
          />

          <p className="mt-8 border-t border-gray-100/90 pt-7 text-center text-[13px] text-slate-600 sm:mt-9 sm:pt-8 sm:text-sm">
            <Link
              href="/login"
              className="font-medium text-[#0284C7] underline-offset-2 transition-colors hover:text-[#0369A1] hover:underline"
            >
              Zurück zum Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
