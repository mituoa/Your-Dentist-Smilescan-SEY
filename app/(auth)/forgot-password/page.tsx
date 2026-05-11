import Link from "next/link";

import { requestPasswordResetFromLogin } from "@/app/(auth)/actions";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AUTH_CARD_SHELL_CLASS,
  AUTH_LOGO_BLOCK_CLASS,
  AUTH_NARROW_COLUMN_CLASS,
  AUTH_SCREEN_CANVAS_CLASS,
  authCardShellShadowStyle,
  authScreenCanvasStyle,
} from "@/lib/auth/auth-screen-shell";

interface ForgotPasswordPageProps {
  searchParams: Promise<{ sent?: string; error?: string; invite?: string; email?: string }>;
}

function safeDecodeError(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const errorRaw = params.error?.trim();
  const error = errorRaw ? safeDecodeError(errorRaw) : "";
  const inviteToken = params.invite?.trim() || "";
  const prefilledEmail = params.email?.trim() || "";

  return (
    <div className={AUTH_SCREEN_CANVAS_CLASS} style={authScreenCanvasStyle}>
      <div className={`flex min-h-[100dvh] flex-col ${AUTH_NARROW_COLUMN_CLASS}`}>
        <div className={AUTH_LOGO_BLOCK_CLASS}>
          <YourDentistBrandLockup size="md" centered priority />
        </div>

        <div className={AUTH_CARD_SHELL_CLASS} style={authCardShellShadowStyle}>
          <header className="mb-6 text-center sm:mb-7">
            <h1 className="font-serif text-[1.375rem] font-semibold leading-snug tracking-tight text-gray-900 sm:text-2xl">
              Passwort zurücksetzen
            </h1>
            <p className="mx-auto mt-2.5 max-w-sm text-[13px] font-normal leading-relaxed text-slate-600 sm:text-[14px]">
              Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen sicheren Link zum Zurücksetzen.
            </p>
          </header>

          {sent ? (
            <p
              className="mb-6 rounded-xl border border-slate-200/90 bg-slate-50 px-4 py-3 text-center text-[13px] font-normal leading-relaxed text-slate-700 sm:text-sm"
              role="status"
            >
              Wenn die E-Mail existiert, wurde ein Link zum Zurücksetzen versendet.
            </p>
          ) : null}

          {error ? (
            <p
              className="mb-6 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-center text-[13px] font-normal leading-relaxed text-red-900 sm:text-sm"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <form action={requestPasswordResetFromLogin} className="space-y-4 sm:space-y-5">
            {inviteToken ? <input type="hidden" name="invite_token" value={inviteToken} /> : null}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-slate-700">
                E-Mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="doc@praxis.de"
                defaultValue={prefilledEmail}
                className="h-11 rounded-lg border border-gray-200/90 bg-white px-3.5 text-[16px] text-gray-900 placeholder:text-gray-400 transition-colors focus-visible:border-[#0284C7] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0284C7]/10 sm:h-[52px] sm:rounded-xl sm:text-[15px]"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="h-11 w-full rounded-lg text-[14px] font-semibold shadow-sm transition-shadow duration-200 hover:shadow-md sm:h-12 sm:rounded-xl sm:text-[15px]"
            >
              Link senden
            </Button>
          </form>

          <p className="mt-7 border-t border-gray-100/90 pt-6 text-center text-[13px] text-slate-600 sm:mt-8 sm:pt-7 sm:text-sm">
            <Link
              href={
                inviteToken
                  ? `/login?invite=${encodeURIComponent(inviteToken)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`
                  : "/login"
              }
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
