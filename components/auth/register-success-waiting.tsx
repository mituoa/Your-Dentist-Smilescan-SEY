"use client";

import * as React from "react";
import Link from "next/link";

import { ResendSignupSubmitButton } from "@/components/auth/resend-signup-submit-button";
import { userFacingAuthError } from "@/lib/auth-user-facing-errors";
import { isRegisterEmailFormatValid, normalizeRegisterEmail } from "@/lib/auth/register-validation";

type RegisterSuccessWaitingProps = {
  queryError?: string;
  resent?: boolean;
  inviteToken: string;
  loginHref: string;
  prefilledEmail: string;
  resendConfirmationAction: (formData: FormData) => void | Promise<void>;
};

export function RegisterSuccessWaiting({
  queryError,
  resent = false,
  inviteToken,
  loginHref,
  prefilledEmail,
  resendConfirmationAction,
}: RegisterSuccessWaitingProps) {
  const [successEmail, setSuccessEmail] = React.useState(prefilledEmail);
  const [resendCooldown, setResendCooldown] = React.useState(30);

  React.useEffect(() => {
    setResendCooldown(30);
  }, []);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = window.setTimeout(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [resendCooldown]);

  const decodedError = queryError
    ? (() => {
        try {
          return decodeURIComponent(queryError);
        } catch {
          return queryError;
        }
      })()
    : "";

  return (
    <div className="py-4 text-center" aria-labelledby="yd-register-success-title">
      <h3 id="yd-register-success-title" className="yd-auth-register-title">
        Ihr Praxiszugang wird geprüft
      </h3>

      {decodedError ? (
        <p
          className="yd-auth-alert yd-auth-alert--warning mx-auto mb-4 max-w-md scroll-mt-6 text-left"
          role="alert"
        >
          {userFacingAuthError(decodedError)}
        </p>
      ) : null}

      {resent ? (
        <p
          className="yd-auth-alert yd-auth-alert--success mx-auto mb-4 max-w-md scroll-mt-6 text-left"
          role="status"
        >
          Sofern ein passendes Konto existiert, wurde die Bestätigungs-E-Mail erneut versendet. Bitte prüfen Sie
          auch den Spam-Ordner.
        </p>
      ) : null}

      <p className="yd-auth-register-subtitle mx-auto mb-6 max-w-md text-left">
        Ihre Angaben wurden sicher übermittelt. Nach erfolgreicher Prüfung erhalten Sie Zugriff auf Ihren
        geschützten Praxisbereich.
      </p>

      <ul className="mx-auto mb-4 max-w-md space-y-2.5 text-left text-[13px] leading-relaxed text-slate-700">
        <li className="flex gap-2">
          <span className="text-green-700" aria-hidden>
            ✓
          </span>
          <span>Konto erstellt</span>
        </li>
        <li className="flex gap-2">
          <span className="text-green-700" aria-hidden>
            ✓
          </span>
          <span>Unterlagen erhalten</span>
        </li>
        <li className="flex gap-2">
          <span className="text-green-700" aria-hidden>
            ✓
          </span>
          <span>Prüfung gestartet</span>
        </li>
        <li className="flex gap-2">
          <span className="text-slate-400" aria-hidden>
            ○
          </span>
          <span className="text-slate-600">Zugang wird aktiviert</span>
        </li>
      </ul>

      <p className="mx-auto mb-6 max-w-md text-left text-[12px] leading-relaxed text-slate-500">
        Die Prüfung erfolgt in der Regel innerhalb von 24 Stunden.
      </p>

      <div className="mx-auto mb-6 max-w-md rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 text-left">
        <p className="text-[11px] font-medium text-slate-700">Bestätigungs-E-Mail</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          Bitte bestätigen Sie Ihre E-Mail-Adresse. Falls keine Nachricht ankommt, können Sie sie erneut anfordern.
        </p>
        <label htmlFor="reg-success-email" className="mb-1.5 mt-3 block text-[11px] font-medium text-slate-600">
          E-Mail-Adresse
        </label>
        <input
          id="reg-success-email"
          type="email"
          value={successEmail}
          onChange={(e) => setSuccessEmail(e.target.value)}
          autoComplete="email"
          className="yd-auth-input h-[48px] scroll-mt-8"
        />
        {successEmail.trim() && !isRegisterEmailFormatValid(successEmail) ? (
          <p className="mt-2 text-[12px] text-amber-800" role="alert">
            Bitte prüfen Sie die E-Mail-Adresse.
          </p>
        ) : null}
        <form action={resendConfirmationAction} className="mt-3">
          <input type="hidden" name="resend_context" value="register_success" />
          <input type="hidden" name="email" value={normalizeRegisterEmail(successEmail)} />
          {inviteToken ? <input type="hidden" name="invite_token" value={inviteToken} /> : null}
          <ResendSignupSubmitButton
            idleLabel={
              resendCooldown > 0
                ? `Erneut senden (${resendCooldown}s)`
                : "Bestätigungs-E-Mail erneut senden"
            }
            disabled={
              resendCooldown > 0 ||
              !successEmail.trim() ||
              !isRegisterEmailFormatValid(successEmail)
            }
            pendingLabel="Wird gesendet…"
            className="yd-auth-btn-secondary h-[44px] w-full text-[13px]"
          />
        </form>
      </div>

      <div className="mx-auto max-w-md">
        <Link
          href={loginHref}
          className="yd-auth-btn-primary inline-flex h-[52px] w-full items-center justify-center"
        >
          Zur Anmeldung
        </Link>
      </div>
    </div>
  );
}
