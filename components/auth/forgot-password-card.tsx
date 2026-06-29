"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useFormStatus } from "react-dom";

import { requestPasswordResetFromLogin } from "@/app/(auth)/actions";
import {
  YdAuthAlert,
  YdAuthIntro,
  YdAuthLegalFooter,
} from "@/components/auth/yd-auth-ui";
import { userFacingAuthError } from "@/lib/auth-user-facing-errors";

const RESEND_COOLDOWN_SEC = 60;

function safeDecodeError(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function forgotPasswordErrorDisplay(decoded: string): string {
  const msg = userFacingAuthError(decoded);
  if (/Anmeldung ist fehlgeschlagen/i.test(msg)) {
    return "Die Anfrage konnte nicht ausgeführt werden. Bitte versuchen Sie es erneut.";
  }
  return msg;
}

function ForgotPasswordEmailFieldset({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <fieldset
      disabled={pending}
      className="m-0 min-w-0 border-0 p-0 disabled:pointer-events-none disabled:opacity-[0.58]"
    >
      {children}
    </fieldset>
  );
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
    <button
      type="submit"
      disabled={disabled}
      aria-busy={pending}
      className={sent ? "yd-auth-btn-secondary mt-1 w-full" : "yd-auth-btn-primary w-full"}
    >
      {pending ? "Wird übermittelt …" : label}
    </button>
  );
}

export function ForgotPasswordCard(props: {
  sent: boolean;
  errorRaw: string;
  inviteToken: string;
  prefilledEmail: string;
  /** `minimal`: Kopfzeile kommt von der Public-OS-Shell (Login-Branding). */
  shell?: "full" | "minimal";
}) {
  const { sent, errorRaw, inviteToken, prefilledEmail, shell = "full" } = props;
  const errorDecoded = errorRaw ? safeDecodeError(errorRaw) : "";
  const errorDisplay = errorDecoded ? forgotPasswordErrorDisplay(errorDecoded) : "";

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
    <>
      {shell === "full" ? (
        <YdAuthIntro
          title="Passwort zurücksetzen"
          subtitle={
            sent ? (
              <>Der Link ist nur kurze Zeit gültig. Bitte prüfen Sie auch den Spam-Ordner.</>
            ) : (
              <>
                E-Mail Ihres Praxiszugangs eingeben — wir senden Ihnen einen sicheren Link zum Zurücksetzen.
              </>
            )
          }
          fieldIndex={0}
        />
      ) : null}

      {errorDisplay ? (
        <YdAuthAlert tone="danger" className="mb-6" title="Anfrage nicht möglich">
          {errorDisplay}
        </YdAuthAlert>
      ) : null}

      <form action={requestPasswordResetFromLogin} className="yd-auth-form-stack">
        {inviteToken ? <input type="hidden" name="invite_token" value={inviteToken} /> : null}
        <ForgotPasswordEmailFieldset>
          <div className="relative">
            <input
              id="forgot-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="E-Mail-Adresse"
              defaultValue={prefilledEmail}
              className="yd-auth-input pr-10"
            />
            <span
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              aria-hidden
            >
              <Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
          </div>
        </ForgotPasswordEmailFieldset>

        <ForgotPasswordSubmitButton sent={sent} cooldownSec={cooldownSec} />
      </form>

      {shell === "full" ? <YdAuthLegalFooter loginHref={loginHref} className="mt-8" /> : null}
    </>
  );
}
