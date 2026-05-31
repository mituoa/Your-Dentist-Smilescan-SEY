"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

import { requestPasswordResetFromLogin } from "@/app/(auth)/actions";
import {
  YdAuthAlert,
  YdAuthFieldStack,
  YdAuthIntro,
  YdAuthLabel,
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
      className={sent ? "yd-auth-btn-secondary mt-1" : "yd-auth-btn-primary"}
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
              <>E-Mail gesendet. Bitte prüfen Sie Ihr Postfach.</>
            ) : (
              <>
                Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen Ihres
                Passworts.
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

      <form
        action={requestPasswordResetFromLogin}
        className="yd-auth-form-stack yd-auth-awaken-field"
        style={shell === "minimal" ? ({ ["--yd-auth-field-i" as string]: "2" } as React.CSSProperties) : undefined}
      >
        {inviteToken ? <input type="hidden" name="invite_token" value={inviteToken} /> : null}
        <ForgotPasswordEmailFieldset>
          <YdAuthFieldStack fieldIndex={1}>
            <YdAuthLabel htmlFor="forgot-email">E-Mail</YdAuthLabel>
            <input
              id="forgot-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="doc@praxis.de"
              defaultValue={prefilledEmail}
              className="yd-auth-input"
            />
          </YdAuthFieldStack>
        </ForgotPasswordEmailFieldset>

        <ForgotPasswordSubmitButton sent={sent} cooldownSec={cooldownSec} />
      </form>

      {shell === "full" ? <YdAuthLegalFooter loginHref={loginHref} className="mt-8" /> : null}
    </>
  );
}
