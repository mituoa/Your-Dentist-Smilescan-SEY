"use client";

import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Mail } from "lucide-react";

import { resendSignupConfirmation, signIn, signInWithGoogle } from "@/app/(auth)/actions";
import { LoginPasswordField } from "@/components/auth/login-password-field";
import { LoginSplitShell } from "@/components/auth/login-split-shell";
import { LoginSubmitButton } from "@/components/auth/login-submit-button";
import { OAuthFormSubmitButton } from "@/components/auth/oauth-form-submit-button";
import { ResendConfirmationSubmitButton } from "@/components/auth/resend-confirmation-submit-button";
import { YdAuthPending } from "@/components/auth/yd-auth-ui";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { PUBLIC_BRAND_TAGLINE } from "@/lib/brand/constants";
import { LoginRegisterCta } from "@/components/auth/login-register-cta";
import { AUTH_LOGIN_INVALID_CREDENTIALS } from "@/lib/auth-user-facing-errors";
import { clearReturnToPricingFlag } from "@/lib/login-pricing-return";

function safeDecodeQueryParam(value: string | undefined): string {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

type LoginSubmitChannel = "password" | "google" | "resend";

function LoginPasswordControlsFieldset({
  otherChannelActive,
  children,
}: {
  otherChannelActive: boolean;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <fieldset
      disabled={pending || otherChannelActive}
      className="m-0 flex min-w-0 flex-col gap-2.5 border-0 p-0 disabled:pointer-events-none disabled:opacity-[0.58]"
    >
      {children}
    </fieldset>
  );
}

interface LoginPageClientProps {
  queryError?: string;
  resent?: boolean;
  authFlowResetKey: string;
  signedOut?: boolean;
  inviteToken?: string;
  prefilledEmail?: string;
  googleLoginEnabled?: boolean;
}

export function LoginPageClient({
  queryError,
  resent = false,
  authFlowResetKey,
  signedOut = false,
  inviteToken = "",
  prefilledEmail = "",
  googleLoginEnabled = true,
}: LoginPageClientProps) {
  const [loginChannelLock, setLoginChannelLock] = useState<LoginSubmitChannel | null>(null);

  useEffect(() => {
    setLoginChannelLock(null);
  }, [authFlowResetKey]);

  const passwordBlockedByOthers = loginChannelLock !== null && loginChannelLock !== "password";
  const googleBlockedByOthers = loginChannelLock !== null && loginChannelLock !== "google";
  const resendBlockedByOthers = loginChannelLock !== null && loginChannelLock !== "resend";

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (!signedOut) {
      window.scrollTo(0, 0);
    }
  }, [signedOut]);

  useEffect(() => {
    if (!signedOut) return;
    clearReturnToPricingFlag();
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      if (typeof window === "undefined") return;
      const u = new URL(window.location.href);
      if (u.searchParams.get("signed_out") === "1") {
        u.searchParams.delete("signed_out");
        const qs = u.searchParams.toString();
        window.history.replaceState(null, "", `${u.pathname}${qs ? `?${qs}` : ""}`);
      }
    });
  }, [signedOut]);

  const [resendEmail, setResendEmail] = useState(prefilledEmail);

  const normalizedQueryError = useMemo(() => safeDecodeQueryParam(queryError).trim(), [queryError]);

  const parsedError = useMemo(() => {
    const raw = normalizedQueryError;
    if (!raw) return null;

    if (raw === "account_pending_approval") {
      return {
        tone: "pending" as const,
        title: "Praxis wird geprüft",
        body: "Ihre Registrierung und Unterlagen werden validiert. Sobald Ihr Zugang freigeschaltet ist, können Sie sich anmelden.",
      };
    }

    if (raw === "workspace_missing") {
      return {
        tone: "info" as const,
        title: "Kein Praxiszugang gefunden",
        body: "Ihrem Benutzerkonto ist derzeit keine Praxis zugeordnet, oder eine Team-Einladung ist noch ausstehend. Bitte prüfen Sie Ihre E‑Mails auf eine Einladung oder wenden Sie sich an Ihre Praxis.",
      };
    }

    if (raw === "email_not_confirmed") {
      return {
        tone: "warning" as const,
        title: "E‑Mail noch nicht bestätigt",
        body: "Bitte bestätigen Sie zuerst Ihre E‑Mail-Adresse. Wenn Sie keine Mail finden, können Sie sie erneut senden.",
      };
    }

    if (raw === "auth_callback_failed") {
      return {
        tone: "warning" as const,
        title: "Link ungültig oder abgelaufen",
        body: "Bitte versuchen Sie es erneut oder lassen Sie sich eine neue Bestätigungs‑E‑Mail senden.",
      };
    }

    if (/provider is not enabled|unsupported provider/i.test(raw)) {
      return {
        tone: "warning" as const,
        title: "Anmeldung mit diesem Anbieter nicht verfügbar",
        body: "Der gewählte Anmelde‑Anbieter ist in Ihrer Umgebung noch nicht freigeschaltet. Bitte nutzen Sie E‑Mail und Passwort.",
        compact: false,
      };
    }

    if (
      raw === AUTH_LOGIN_INVALID_CREDENTIALS ||
      raw === "E-Mail oder Passwort ist ungültig." ||
      /invalid login credentials|invalid_credentials/i.test(raw)
    ) {
      return {
        tone: "warning" as const,
        body: AUTH_LOGIN_INVALID_CREDENTIALS,
        compact: true,
      };
    }

    if (
      raw.length <= 220 &&
      /^(Bitte|Die |Das |Der |Diese |E-Mail|Passwort|Zu viele|Verbindung|Google-Anmeldung|Der Link)/i.test(
        raw
      )
    ) {
      return {
        tone: "warning" as const,
        body: raw,
        compact: true,
      };
    }

    return {
      tone: "warning" as const,
      body: "Die Anmeldung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.",
      compact: true,
    };
  }, [normalizedQueryError]);

  const shouldShowResend = normalizedQueryError === "email_not_confirmed";

  const forgotHref = inviteToken
    ? `/forgot-password?invite=${encodeURIComponent(inviteToken)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`
    : "/forgot-password";

  return (
    <LoginSplitShell>
      <div className="yd-login-form-shell">
        <div className="yd-login-form-card">
        <div className="yd-login-form-brand">
          <YourDentistBrandLockup size="md" centered tagline={PUBLIC_BRAND_TAGLINE} />
        </div>

        <header className="yd-login-form-header">
          <h1 className="yd-login-form-title">Anmelden</h1>
          <p className="yd-login-form-lead">
            Melden Sie sich mit Ihrem Praxiszugang an.
          </p>
        </header>

        {parsedError ? (
          parsedError.tone === "pending" ? (
            <YdAuthPending title={parsedError.title} className="mb-5 min-w-0 break-words">
              {parsedError.body}
            </YdAuthPending>
          ) : (
            <div
              className={`yd-auth-alert mb-5 min-w-0 break-words ${
                parsedError.tone === "warning" ? "yd-auth-alert--warning" : "yd-auth-alert--info"
              }`}
              role="alert"
            >
              {"compact" in parsedError && parsedError.compact ? (
                <p>{parsedError.body}</p>
              ) : (
                <>
                  <p className="yd-auth-alert-title">{parsedError.title}</p>
                  <p className="mt-1">{parsedError.body}</p>
                </>
              )}
            </div>
          )
        ) : null}

        {resent ? (
          <p className="yd-auth-alert yd-auth-alert--success mb-5" role="status">
            Bestätigungs‑E‑Mail wurde erneut versendet. Bitte prüfen Sie auch den Spam‑Ordner.
          </p>
        ) : null}

        <form
          action={signIn}
          onSubmit={() => setLoginChannelLock("password")}
          className="yd-auth-form-stack"
          aria-busy={loginChannelLock === "password"}
        >
          {inviteToken ? <input type="hidden" name="invite_token" value={inviteToken} /> : null}

          <LoginPasswordControlsFieldset otherChannelActive={passwordBlockedByOthers}>
            <div className="yd-login-field-wrap">
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={prefilledEmail}
                placeholder="E-Mail-Adresse"
                autoComplete="email"
                onChange={(e) => setResendEmail(e.target.value)}
                className="yd-login-field yd-login-field--with-icon"
                required
              />
              <span className="yd-login-field-icon-btn yd-login-field-icon-btn--static" aria-hidden>
                <Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
            </div>

            <LoginPasswordField disabled={passwordBlockedByOthers} />

            <div className="yd-login-form-row">
              <Link prefetch href={forgotHref} className="yd-login-forgot">
                Passwort vergessen?
              </Link>
            </div>
          </LoginPasswordControlsFieldset>

          <LoginSubmitButton disabledExternal={passwordBlockedByOthers} />
        </form>

        {shouldShowResend ? (
          <div className="yd-auth-alert yd-auth-alert--warning mt-4 min-w-0 break-words">
            <p className="yd-auth-alert-title text-[13px]">Keine Bestätigungs‑E‑Mail erhalten?</p>
            <form
              action={resendSignupConfirmation}
              onSubmit={() => setLoginChannelLock("resend")}
              className="mt-3"
              aria-busy={loginChannelLock === "resend"}
            >
              {inviteToken ? <input type="hidden" name="invite_token" value={inviteToken} /> : null}
              <input type="hidden" name="email" value={resendEmail} />
              <fieldset
                disabled={resendBlockedByOthers}
                className="m-0 min-w-0 border-0 p-0 disabled:pointer-events-none disabled:opacity-[0.58]"
              >
                <ResendConfirmationSubmitButton />
              </fieldset>
            </form>
          </div>
        ) : null}

        {googleLoginEnabled ? (
          <>
            <div className="yd-auth-divider yd-auth-divider--subtle">
              <span>oder</span>
            </div>

            <form
              action={signInWithGoogle}
              onSubmit={() => setLoginChannelLock("google")}
              aria-busy={loginChannelLock === "google"}
            >
              {inviteToken ? <input type="hidden" name="invite_token" value={inviteToken} /> : null}
              <fieldset
                disabled={googleBlockedByOthers}
                className="m-0 min-w-0 border-0 p-0 disabled:pointer-events-none disabled:opacity-[0.58]"
              >
                <OAuthFormSubmitButton
                  pendingLabel="Weiter zu Google…"
                  className="yd-auth-btn-secondary yd-auth-btn-secondary--oauth"
                >
                  <svg className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Mit Google anmelden
                </OAuthFormSubmitButton>
              </fieldset>
            </form>
          </>
        ) : null}

        <LoginRegisterCta inviteToken={inviteToken} prefilledEmail={prefilledEmail} />

        <footer className="yd-auth-legal-minimal">
          <nav className="yd-auth-legal-minimal-links" aria-label="Rechtliches">
            <Link href="/datenschutz" className="yd-auth-legal-minimal-link">
              Datenschutz
            </Link>
            <Link href="/impressum" className="yd-auth-legal-minimal-link">
              Impressum
            </Link>
          </nav>
        </footer>
        </div>
      </div>
    </LoginSplitShell>
  );
}
