"use client";

import * as React from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

import { requestPasswordResetFromLogin } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userFacingAuthError } from "@/lib/auth-user-facing-errors";
import {
  AUTH_CARD_SHELL_CLASS,
  authCardShellShadowStyle,
} from "@/lib/auth/auth-screen-shell";

const RESEND_COOLDOWN_SEC = 60;

function safeDecodeError(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function ForgotPasswordSubmitButton({
  sent,
  cooldownSec,
}: {
  sent: boolean;
  cooldownSec: number;
}) {
  const { pending } = useFormStatus();
  const wait = sent && cooldownSec > 0;
  const disabled = pending || wait;

  const label = !sent
    ? "Link senden"
    : wait
      ? `Erneut senden (${cooldownSec}s)`
      : "E-Mail erneut senden";

  return (
    <Button
      type="submit"
      variant={sent ? "secondary" : "primary"}
      disabled={disabled}
      aria-busy={pending}
      className={`h-11 w-full rounded-lg text-[14px] font-medium shadow-none transition-colors duration-150 sm:h-12 sm:rounded-xl sm:text-[15px] ${
        sent ? "border-slate-200 text-slate-800 hover:bg-slate-50 disabled:opacity-50" : "hover:shadow-sm disabled:opacity-[0.55]"
      }`}
    >
      {pending ? "Wird gesendet …" : label}
    </Button>
  );
}

export function ForgotPasswordCard(props: {
  sent: boolean;
  errorRaw: string;
  inviteToken: string;
  prefilledEmail: string;
}) {
  const { sent, errorRaw, inviteToken, prefilledEmail } = props;
  const errorDecoded = errorRaw ? safeDecodeError(errorRaw) : "";
  const errorDisplay = errorDecoded ? userFacingAuthError(errorDecoded) : "";

  const [cooldownSec, setCooldownSec] = React.useState(() => (sent ? RESEND_COOLDOWN_SEC : 0));

  React.useEffect(() => {
    if (!sent) {
      setCooldownSec(0);
      return;
    }
    setCooldownSec(RESEND_COOLDOWN_SEC);
    let n = RESEND_COOLDOWN_SEC;
    const id = window.setInterval(() => {
      n -= 1;
      setCooldownSec(Math.max(0, n));
      if (n <= 0) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [sent]);

  const loginHref =
    inviteToken
      ? `/login?invite=${encodeURIComponent(inviteToken)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`
      : "/login";

  return (
    <div className={AUTH_CARD_SHELL_CLASS} style={authCardShellShadowStyle}>
      <header className="mb-5 text-center sm:mb-6">
        <h1 className="font-serif text-[1.375rem] font-semibold leading-snug tracking-tight text-slate-900 sm:text-2xl">
          Passwort zurücksetzen
        </h1>
        {sent ? (
          <div className="mx-auto mt-3 max-w-sm space-y-2" role="status" aria-live="polite">
            <p className="text-[14px] font-normal leading-snug text-slate-800 sm:text-[15px]">
              Bitte prüfen Sie Ihren Posteingang.
            </p>
            <p className="text-[13px] font-normal leading-relaxed text-slate-600 sm:text-[14px]">
              Falls ein Konto gefunden wurde, erhalten Sie in wenigen Minuten eine E-Mail.
            </p>
          </div>
        ) : (
          <p className="mx-auto mt-2 max-w-sm text-[13px] font-normal leading-relaxed text-slate-600 sm:mt-2.5 sm:text-[14px]">
            E-Mail-Adresse eingeben. Sie erhalten einen sicheren Link zum Zurücksetzen.
          </p>
        )}
      </header>

      {errorDisplay ? (
        <p
          className="mb-5 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-center text-[13px] font-normal leading-relaxed text-red-900 sm:mb-6 sm:text-sm"
          role="alert"
        >
          {errorDisplay}
        </p>
      ) : null}

      <form action={requestPasswordResetFromLogin} className="space-y-4 sm:space-y-5">
        {inviteToken ? <input type="hidden" name="invite_token" value={inviteToken} /> : null}
        <div className="space-y-1.5">
          <Label htmlFor="forgot-email" className="text-[13px] font-medium text-slate-700">
            E-Mail
          </Label>
          <Input
            id="forgot-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="doc@praxis.de"
            defaultValue={prefilledEmail}
            className="h-11 rounded-lg border border-slate-200/90 bg-white px-3.5 text-[16px] text-slate-900 placeholder:text-slate-400 transition-colors focus-visible:border-slate-400 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-slate-300/40 sm:h-[52px] sm:rounded-xl sm:text-[15px]"
          />
        </div>

        <ForgotPasswordSubmitButton sent={sent} cooldownSec={cooldownSec} />
      </form>

      <div className="mt-6 border-t border-slate-100 pt-5 text-center sm:mt-7 sm:pt-6">
        <p className="text-[11px] text-slate-400">
          <Link
            href="/impressum"
            className="text-slate-500 underline decoration-slate-200/80 underline-offset-2 transition-colors hover:text-slate-700 hover:decoration-slate-400"
          >
            Anbieter & Kontakt
          </Link>
        </p>
        <p className="mt-4 text-[13px] text-slate-600 sm:mt-5">
          <Link
            prefetch
            href={loginHref}
            className="font-medium text-slate-700 underline-offset-2 transition-colors hover:text-slate-900 hover:underline"
          >
            Zurück zum Login
          </Link>
        </p>
      </div>
    </div>
  );
}
