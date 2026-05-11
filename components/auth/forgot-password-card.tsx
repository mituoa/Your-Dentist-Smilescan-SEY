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
      variant="primary"
      disabled={disabled}
      aria-busy={pending}
      className="h-11 w-full rounded-lg text-[14px] font-medium shadow-none transition-colors duration-150 hover:shadow-sm disabled:opacity-[0.55] sm:h-12 sm:rounded-xl sm:text-[15px]"
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
        <p className="mx-auto mt-2 max-w-sm text-[13px] font-normal leading-relaxed text-slate-600 sm:mt-2.5 sm:text-[14px]">
          Geben Sie die E-Mail-Adresse Ihrer Praxis ein. Wir senden Ihnen einen persönlichen, zeitlich begrenzten Link
          zum Zurücksetzen — nur an diese Adresse.
        </p>
      </header>

      {sent ? (
        <div
          className="mb-5 rounded-xl border border-slate-200/90 bg-slate-50/40 px-4 py-4 sm:mb-6 sm:px-5 sm:py-4"
          role="status"
          aria-live="polite"
        >
          <p className="text-[12px] font-semibold uppercase tracking-widest text-slate-500">Nächste Schritte</p>
          <p className="mt-2.5 text-left text-[13px] leading-relaxed text-slate-700 sm:text-sm">
            Falls ein Konto mit dieser Adresse bei uns hinterlegt ist, erhalten Sie in den nächsten Minuten eine E-Mail
            mit einem sicheren Link. Bitte prüfen Sie auch den Spam- oder Werbeordner.
          </p>
          <ul className="mt-3 list-none space-y-1.5 border-t border-slate-200/70 pt-3 text-left text-[12px] leading-relaxed text-slate-600">
            <li>Posteingang prüfen</li>
            <li>Spam / Werbung prüfen</li>
            <li>Absender als vertrauenswürdig markieren (falls nötig)</li>
          </ul>
        </div>
      ) : null}

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

      {sent ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-200/90 bg-slate-50/30 px-3 py-3 sm:mt-6 sm:px-4">
          <p className="text-center text-[12px] font-medium text-slate-700">Keine E-Mail erhalten?</p>
          <p className="mx-auto mt-1.5 max-w-sm text-center text-[11px] leading-relaxed text-slate-500">
            Adresse prüfen, Spam-Ordner leeren oder nach Ablauf des Kurzintervalls erneut senden. Bei anhaltenden
            Problemen erreichen Sie uns über die Anbieterangaben.
          </p>
        </div>
      ) : null}

      <div className="mt-6 border-t border-slate-100 pt-5 text-center sm:mt-7 sm:pt-6">
        <p className="text-[12px] leading-relaxed text-slate-500">
          Probleme beim Zugriff?{" "}
          <Link
            href="/impressum"
            className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-2 transition-colors hover:text-slate-900 hover:decoration-slate-500"
          >
            Anbieter & Kontakt
          </Link>
        </p>
        <p className="mt-5 text-[13px] text-slate-600 sm:mt-6">
          <Link
            href={loginHref}
            className="font-medium text-[#0284C7] underline-offset-2 transition-colors hover:text-[#0369A1] hover:underline"
          >
            Zurück zum Login
          </Link>
        </p>
      </div>
    </div>
  );
}
