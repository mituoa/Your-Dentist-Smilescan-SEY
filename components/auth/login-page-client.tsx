"use client";

import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Mail } from "lucide-react";

import { resendSignupConfirmation, signIn, signInWithGoogle } from "@/app/(auth)/actions";
import { LoginPasswordField } from "@/components/auth/login-password-field";
import { LoginSubmitButton } from "@/components/auth/login-submit-button";
import { OAuthFormSubmitButton } from "@/components/auth/oauth-form-submit-button";
import { ResendConfirmationSubmitButton } from "@/components/auth/resend-confirmation-submit-button";
import { YdAuthPending } from "@/components/auth/yd-auth-ui";
import { LoginRegisterCta } from "@/components/auth/login-register-cta";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { useLocale } from "@/components/i18n/locale-provider";
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
  const { messages } = useLocale();
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
    const e = messages.login.errors;
    if (!raw) return null;

    if (raw === "account_pending_approval") {
      return {
        tone: "pending" as const,
        title: e.accountPendingTitle,
        body: e.accountPendingBody,
      };
    }

    if (raw === "workspace_missing") {
      return {
        tone: "info" as const,
        title: e.workspaceMissingTitle,
        body: e.workspaceMissingBody,
      };
    }

    if (raw === "email_not_confirmed") {
      return {
        tone: "warning" as const,
        title: e.emailNotConfirmedTitle,
        body: e.emailNotConfirmedBody,
      };
    }

    if (raw === "auth_callback_failed") {
      return {
        tone: "warning" as const,
        title: e.authCallbackTitle,
        body: e.authCallbackBody,
      };
    }

    if (/provider is not enabled|unsupported provider/i.test(raw)) {
      return {
        tone: "warning" as const,
        title: e.providerTitle,
        body: e.providerBody,
        compact: false,
      };
    }

    if (
      raw === AUTH_LOGIN_INVALID_CREDENTIALS ||
      raw === "E-Mail oder Passwort ist ungültig." ||
      raw === e.invalidCredentials ||
      /invalid login credentials|invalid_credentials/i.test(raw)
    ) {
      return {
        tone: "warning" as const,
        body: e.invalidCredentials,
        compact: true,
      };
    }

    if (
      raw.length <= 220 &&
      /^(Bitte|Die |Das |Der |Diese |E-Mail|Passwort|Zu viele|Verbindung|Google-Anmeldung|Der Link|Please|Email|Password)/i.test(
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
      body: e.generic,
      compact: true,
    };
  }, [normalizedQueryError, messages]);

  const shouldShowResend = normalizedQueryError === "email_not_confirmed";

  const forgotHref = inviteToken
    ? `/forgot-password?invite=${encodeURIComponent(inviteToken)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`
    : "/forgot-password";

  return (
    <div className="min-w-0">
      <div className="yd-login-locale-row">
        <LocaleSwitcher showLabel={false} className="yd-login-locale-switcher" />
      </div>

      <header className="yd-auth-intro">
        <h1 className="yd-public-entry-title yd-public-entry-title--login">{messages.login.title}</h1>
        <p className="yd-public-entry-lead yd-public-entry-lead--login">{messages.login.lead}</p>
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
            {messages.login.resent}
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
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={prefilledEmail}
                placeholder={messages.login.emailPlaceholder}
                autoComplete="email"
                onChange={(e) => setResendEmail(e.target.value)}
                className="yd-auth-input pr-10"
                required
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden>
                <Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
            </div>

            <LoginPasswordField disabled={passwordBlockedByOthers} />

            <div className="flex items-center justify-end">
              <Link prefetch href={forgotHref} className="text-[12px] font-medium text-[#1a4f9c] hover:underline">
                {messages.login.forgotPassword}
              </Link>
            </div>
          </LoginPasswordControlsFieldset>

          <LoginSubmitButton disabledExternal={passwordBlockedByOthers} />
        </form>

        {shouldShowResend ? (
          <div className="yd-auth-alert yd-auth-alert--warning mt-4 min-w-0 break-words">
            <p className="yd-auth-alert-title text-[13px]">{messages.login.resendTitle}</p>
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
              <span>{messages.common.or}</span>
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
                  pendingLabel={messages.login.googlePending}
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
                  {messages.login.google}
                </OAuthFormSubmitButton>
              </fieldset>
            </form>
          </>
        ) : null}

        <LoginRegisterCta inviteToken={inviteToken} prefilledEmail={prefilledEmail} />

        <footer className="yd-auth-legal-minimal">
          <nav className="yd-auth-legal-minimal-links" aria-label="Rechtliches">
            <Link href="/trust/privacy" className="yd-auth-legal-minimal-link">
              {messages.login.privacy}
            </Link>
            <Link href="/trust/imprint" className="yd-auth-legal-minimal-link">
              {messages.login.imprint}
            </Link>
          </nav>
        </footer>
      </div>
  );
}
