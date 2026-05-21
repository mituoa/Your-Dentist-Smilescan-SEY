"use client";

import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

import { resendSignupConfirmation, signIn, signInWithGoogle } from "@/app/(auth)/actions";
import { LoginSubmitButton } from "@/components/auth/login-submit-button";
import { OAuthFormSubmitButton } from "@/components/auth/oauth-form-submit-button";
import { ResendConfirmationSubmitButton } from "@/components/auth/resend-confirmation-submit-button";
import { YdLoginEnvironment } from "@/components/auth/yd-login-environment";
import {
  clearReturnToPricingFlag,
  markReturnToPricingFlag,
  RETURN_PRICING_STORAGE_KEY,
} from "@/lib/login-pricing-return";

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
      className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0 sm:gap-3.5 disabled:pointer-events-none disabled:opacity-[0.58]"
    >
      {children}
    </fieldset>
  );
}

interface LoginPageClientProps {
  queryError?: string;
  resent?: boolean;
  /** Server-seitig abgeleiteter Schlüssel — bei geändertem Login-Feedback Sperre der parallelen Kanäle lösen. */
  authFlowResetKey: string;
  /** After server/client sign-out: clear pricing-return flag and keep viewport at top. */
  signedOut?: boolean;
  inviteToken?: string;
  prefilledEmail?: string;
  year: number;
}

export function LoginPageClient({
  queryError,
  resent = false,
  authFlowResetKey,
  signedOut = false,
  inviteToken = "",
  prefilledEmail = "",
  year,
}: LoginPageClientProps) {
  const [activeCta, setActiveCta] = useState<"trial" | "plan" | null>(null);
  const [showPlanSheet, setShowPlanSheet] = useState(false);
  const [loginChannelLock, setLoginChannelLock] = useState<LoginSubmitChannel | null>(null);

  useEffect(() => {
    setLoginChannelLock(null);
  }, [authFlowResetKey]);

  const passwordBlockedByOthers = loginChannelLock !== null && loginChannelLock !== "password";
  const googleBlockedByOthers = loginChannelLock !== null && loginChannelLock !== "google";
  const resendBlockedByOthers = loginChannelLock !== null && loginChannelLock !== "resend";

  const registerFromPricingHref = (plan: "monthly" | "halfyearly" | "yearly") =>
    `/register?plan=${plan}&from=pricing`;

  /** Login-card „Registrieren“ / Test: ohne `from=pricing`, damit Abbruch immer oben auf /login landet. */
  const registerDefaultHref = useMemo(() => {
    const qs = new URLSearchParams();
    qs.set("plan", "yearly");
    if (inviteToken) qs.set("invite", inviteToken);
    if (prefilledEmail) qs.set("email", prefilledEmail);
    const q = qs.toString();
    return q ? `/register?${q}` : "/register";
  }, [inviteToken, prefilledEmail]);

  const scrollToPricing = (behavior: ScrollBehavior = "smooth") => {
    const el = document.getElementById("pricing");
    if (!el) return;
    el.scrollIntoView({ behavior, block: "start" });
  };

  useLayoutEffect(() => {
    if (signedOut) return;
    if (typeof window === "undefined") return;
    if (window.location.hash === "#pricing") return;
    try {
      if (sessionStorage.getItem(RETURN_PRICING_STORAGE_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    window.scrollTo(0, 0);
  }, [signedOut]);

  useEffect(() => {
    if (signedOut) {
      clearReturnToPricingFlag();
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        if (typeof window === "undefined") return;
        const u = new URL(window.location.href);
        if (u.searchParams.get("signed_out") === "1") {
          u.searchParams.delete("signed_out");
          const qs = u.searchParams.toString();
          // Drop hash so logout never leaves #pricing on the URL.
          window.history.replaceState(null, "", `${u.pathname}${qs ? `?${qs}` : ""}`);
        }
      });
      return;
    }

    const restore = () => {
      const el = document.getElementById("pricing");
      if (!el) return;

      let fromStorage = false;
      try {
        fromStorage = sessionStorage.getItem(RETURN_PRICING_STORAGE_KEY) === "1";
      } catch {
        fromStorage = false;
      }

      const fromHash = typeof window !== "undefined" && window.location.hash === "#pricing";
      if (!fromStorage && !fromHash) return;

      const behavior: ScrollBehavior = fromStorage ? "auto" : "smooth";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior, block: "start" });
        });
      });

      if (fromStorage) {
        clearReturnToPricingFlag();
      }
    };

    restore();
    window.addEventListener("hashchange", restore);
    return () => window.removeEventListener("hashchange", restore);
  }, [signedOut]);

  const openPlanSheet = () => {
    setActiveCta("plan");
    setShowPlanSheet(true);
  };

  const closePlanSheet = () => {
    setShowPlanSheet(false);
    setActiveCta(null);
  };

  const plans = {
    monthly: {
      price: 20,
      total: 20,
      label: "Monatlich",
      billing: "Monatlich abgerechnet",
    },
    halfyearly: {
      price: 18,
      total: 108,
      label: "Halbjährlich",
      billing: "Alle 6 Monate abgerechnet",
    },
    yearly: {
      price: 16,
      total: 192,
      label: "Jährlich",
      billing: "Jährlich abgerechnet",
    },
  } as const;

  const [resendEmail, setResendEmail] = useState(prefilledEmail);

  const normalizedQueryError = useMemo(() => safeDecodeQueryParam(queryError).trim(), [queryError]);

  const parsedError = useMemo(() => {
    const raw = normalizedQueryError;
    if (!raw) return null;

    if (raw === "account_pending_approval") {
      return {
        tone: "info" as const,
        title: "Account wartet auf Freischaltung",
        body: "Wir prüfen Ihre Registrierung. Sobald Ihr Account freigeschaltet ist, können Sie sich anmelden.",
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
        body: "Der gewählte Anmelde‑Anbieter ist in Ihrer Umgebung noch nicht freigeschaltet. Bitte nutzen Sie E‑Mail oder Google, oder wenden Sie sich an den Support.",
      };
    }

    // Unbekannter Hinweis — keine technischen Rohstrings (z. B. Supabase) anzeigen
    return {
      tone: "danger" as const,
      title: "Anmeldung nicht möglich",
      body: "Es liegt ein Problem mit Ihrem Zugang vor. Bitte versuchen Sie es erneut. Wenn das weiterhin auftritt, wenden Sie sich an Ihre Praxis oder den technischen Support.",
    };
  }, [normalizedQueryError]);

  const shouldShowResend = normalizedQueryError === "email_not_confirmed";

  return (
    <div className="overflow-x-hidden">
      {showPlanSheet ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="yd-login-modal-backdrop absolute inset-0"
            onClick={closePlanSheet}
            aria-label="Schließen"
          />
          <div
            className="yd-login-modal-panel relative max-h-[min(calc(100dvh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom)),92dvh,92vh)] w-full max-w-xl overflow-y-auto overscroll-contain p-4 sm:p-5"
            role="dialog"
            aria-modal="true"
          >
              <div className="mb-4 flex min-w-0 items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0 pr-2">
                  <p className="yd-login-eyebrow">Praxiszugang</p>
                  <h3 className="yd-login-title mt-1 text-[1.125rem]">Plan wählen</h3>
                  <p className="yd-login-subtitle mt-1">
                    14 Tage testen — jederzeit kündbar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePlanSheet}
                  className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full p-2 text-[#6B849C] transition hover:bg-white/60 md:min-h-0 md:min-w-0"
                  aria-label="Schließen"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 items-stretch gap-2.5 sm:grid-cols-3 sm:gap-3">
                {(["monthly", "halfyearly", "yearly"] as const).map((p) => (
                  <div
                    key={p}
                    className={`yd-login-pricing-card flex h-full flex-col p-3 sm:p-4 ${
                      p === "yearly" ? "ring-1 ring-[rgba(47,128,237,0.2)]" : ""
                    }`}
                  >
                    <p className="text-[11px] font-medium text-[#0C1929] sm:text-[12px]">{plans[p].label}</p>
                    <p className="mt-0.5 text-[11px] text-[#8BA3B8] sm:mt-1 sm:text-[12px]">{plans[p].billing}</p>
                    <div className="mt-2 sm:mt-3">
                      <span className={`text-xl font-medium sm:text-[22px] ${p === "yearly" ? "text-[#2F80ED]" : "text-[#0C1929]"}`}>
                        €{plans[p].price}
                      </span>
                      <span className="ml-1 text-[11px] text-[#8BA3B8] sm:text-[12px]">/Monat</span>
                    </div>
                    <Link
                      href={registerFromPricingHref(p)}
                      className={`mt-auto inline-flex h-11 min-h-[44px] w-full items-center justify-center text-[12px] font-medium md:h-10 md:min-h-0 md:text-[13px] ${
                        p === "yearly" ? "yd-login-btn-primary" : "yd-login-btn-secondary"
                      }`}
                      onClick={() => {
                        markReturnToPricingFlag();
                        setActiveCta(null);
                        closePlanSheet();
                      }}
                    >
                      Jetzt starten
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closePlanSheet();
                    scrollToPricing();
                  }}
                  className="yd-login-link min-w-0 text-left"
                >
                  Alle Details ansehen
                </button>
                <p className="shrink-0 text-[12px] text-[#8BA3B8]">Preise zzgl. MwSt.</p>
              </div>
            </div>
          </div>
        ) : null}

      <YdLoginEnvironment>
        <div className="mb-7 text-center md:mb-8">
          <p className="yd-login-eyebrow mb-2">Klinischer Zugang</p>
          <h1 className="yd-login-title">Willkommen zurück</h1>
          <p className="yd-login-subtitle mx-auto mt-2 max-w-sm">
            Melden Sie sich an, um Ihren Praxisbereich fortzusetzen — ruhig, sicher und im Team.
          </p>
        </div>

        {parsedError ? (
          <div
            className={`yd-login-alert mb-6 min-w-0 break-words ${
              parsedError.tone === "danger"
                ? "yd-login-alert--danger"
                : parsedError.tone === "warning"
                  ? "yd-login-alert--warning"
                  : "yd-login-alert--info"
            }`}
            role="alert"
          >
            <p className="yd-login-alert-title">{parsedError.title}</p>
            <p className="mt-1">{parsedError.body}</p>
          </div>
        ) : null}

        {resent ? (
          <p className="yd-login-alert yd-login-alert--success mb-6" role="status">
            Bestätigungs‑E‑Mail wurde erneut versendet. Bitte prüfen Sie auch den Spam‑Ordner.
          </p>
        ) : null}

        <form
          action={signIn}
          onSubmit={() => setLoginChannelLock("password")}
          className="flex flex-col gap-5 sm:gap-6"
          aria-busy={loginChannelLock === "password"}
        >
          {inviteToken ? <input type="hidden" name="invite_token" value={inviteToken} /> : null}

          <LoginPasswordControlsFieldset otherChannelActive={passwordBlockedByOthers}>
            <div className="yd-login-awaken-field" style={{ ["--yd-login-field-i" as string]: "0" }}>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={prefilledEmail}
                placeholder="E-Mail-Adresse"
                autoComplete="email"
                onChange={(e) => setResendEmail(e.target.value)}
                className="yd-login-input"
                required
              />
            </div>

            <div className="yd-login-awaken-field" style={{ ["--yd-login-field-i" as string]: "1" }}>
              <div className="mb-1.5 flex items-center justify-end">
                <Link
                  prefetch
                  href={
                    inviteToken
                      ? `/forgot-password?invite=${encodeURIComponent(inviteToken)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`
                      : "/forgot-password"
                  }
                  className="yd-login-link inline-flex min-h-[44px] items-center max-md:py-2 md:min-h-0 md:py-0"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Passwort"
                autoComplete="current-password"
                className="yd-login-input"
                required
              />
            </div>
          </LoginPasswordControlsFieldset>

          <LoginSubmitButton disabledExternal={passwordBlockedByOthers} />
        </form>

        {shouldShowResend ? (
          <div className="yd-login-alert yd-login-alert--warning mt-4 min-w-0 break-words">
            <p className="yd-login-alert-title text-[13px]">Keine Bestätigungs‑E‑Mail erhalten?</p>
            <p className="mt-1 text-[13px] opacity-90">
              Wir senden Ihnen den Bestätigungs‑Link erneut an die oben eingegebene Adresse.
            </p>
                    <form
                      action={resendSignupConfirmation}
                      onSubmit={() => setLoginChannelLock("resend")}
                      className="mt-3"
                      aria-busy={loginChannelLock === "resend"}
                    >
                      {inviteToken ? (
                        <input type="hidden" name="invite_token" value={inviteToken} />
                      ) : null}
                      <input type="hidden" name="email" value={resendEmail} />
                      <fieldset
                        disabled={resendBlockedByOthers}
                        className="min-w-0 border-0 p-0 m-0 disabled:pointer-events-none disabled:opacity-[0.58]"
                      >
                        <ResendConfirmationSubmitButton />
                      </fieldset>
                    </form>
                  </div>
                ) : null}

        <div className="yd-login-divider yd-login-awaken-field" style={{ ["--yd-login-field-i" as string]: "3" }}>
          <span>oder</span>
        </div>

        <form
          action={signInWithGoogle}
          onSubmit={() => setLoginChannelLock("google")}
          aria-busy={loginChannelLock === "google"}
          className="yd-login-awaken-field"
          style={{ ["--yd-login-field-i" as string]: "4" }}
        >
          {inviteToken ? <input type="hidden" name="invite_token" value={inviteToken} /> : null}
          <fieldset
            disabled={googleBlockedByOthers}
            className="m-0 min-w-0 border-0 p-0 disabled:pointer-events-none disabled:opacity-[0.58]"
          >
            <OAuthFormSubmitButton
              pendingLabel="Weiter zu Google…"
              className="yd-login-btn-secondary"
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

        <div className="yd-login-awaken-field mt-6 text-center lg:mt-8" style={{ ["--yd-login-field-i" as string]: "5" }}>
          <p className="text-[13px] text-[#3D5266]">
            Noch kein Konto?{" "}
            <Link href={registerDefaultHref} onClick={clearReturnToPricingFlag} className="yd-login-link font-medium">
              Jetzt registrieren
            </Link>
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Link
              href={registerDefaultHref}
              onClick={() => {
                clearReturnToPricingFlag();
                setActiveCta("trial");
              }}
              className={`yd-login-btn-ghost ${activeCta === "trial" ? "yd-login-btn-ghost--active" : ""}`}
            >
              Kostenlos testen
            </Link>
            <button
              type="button"
              onClick={openPlanSheet}
              className={`yd-login-btn-ghost ${activeCta === "plan" ? "yd-login-btn-ghost--active" : ""}`}
            >
              Plan wählen
            </button>
          </div>
        </div>

        <div className="yd-login-trust mt-6 lg:mt-8">
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>DSGVO-orientiert</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Verschlüsselte Verbindung</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <span>Praxisteam</span>
          </div>
        </div>

        <div className="mt-5 text-center">
          <div className="flex items-center justify-center gap-3 text-[11px] text-[#8BA3B8]">
            <Link href="/datenschutz" className="yd-login-link">
              Datenschutz
            </Link>
            <span aria-hidden>·</span>
            <Link href="/impressum" className="yd-login-link">
              Impressum
            </Link>
          </div>
          <p className="mt-2 text-[11px] text-[#8BA3B8]">© {year} Your Dentist GmbH</p>
        </div>
      </YdLoginEnvironment>

      <div id="pricing" className="yd-login-pricing w-full min-w-0 scroll-mt-20 px-4 sm:px-6 md:scroll-mt-24 md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-center md:mb-8">
            <p className="yd-login-eyebrow mb-2">Registrierung</p>
            <h2 className="yd-login-title text-[1.35rem] md:text-[1.5rem]">Transparente Praxispläne</h2>
            <p className="yd-login-subtitle mx-auto mt-2 max-w-xl">
              Voller Funktionsumfang — wählen Sie nur den Abrechnungsrhythmus.
            </p>
          </div>

            <div className="mb-6 flex flex-col items-center justify-center gap-2.5 text-[12px] text-[#5E7389] sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2 sm:text-[13px] md:mb-10">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[#2F80ED]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>14 Tage kostenlos testen</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[#2F80ED]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Jederzeit kündbar</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[#2F80ED]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Preise zzgl. MwSt.</span>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
              {(["monthly", "halfyearly", "yearly"] as const).map((p) => (
                <div
                  key={p}
                  className={`yd-login-pricing-card relative flex flex-col p-4 md:p-6 ${
                    p === "yearly" ? "ring-1 ring-[rgba(47,128,237,0.22)]" : ""
                  }`}
                >
                  {p === "halfyearly" ? (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#E0EDFE] px-2.5 py-0.5 text-[10px] font-medium text-[#1A4F9C]">
                      Halbjahresabo
                    </span>
                  ) : null}
                  {p === "yearly" ? (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#2F80ED] px-2.5 py-0.5 text-[10px] font-medium text-white">
                      Jahresabo
                    </span>
                  ) : null}
                  <div className="h-2 md:h-4" />
                  <h3 className="text-lg font-medium text-[#0C1929] md:text-[20px]">{plans[p].label}</h3>
                  <p className="mb-3 text-[12px] text-[#8BA3B8] md:mb-5 md:text-[13px]">{plans[p].billing}</p>
                  <div>
                    <span className={`text-3xl font-medium md:text-[40px] ${p === "yearly" ? "text-[#2F80ED]" : "text-[#0C1929]"}`}>
                      €{plans[p].price}
                    </span>
                    <span className="ml-1 text-[14px] text-[#8BA3B8]">/Monat</span>
                  </div>
                  <div className="mb-4 min-h-[1.25rem] text-[11px] text-[#8BA3B8] md:mb-6">
                    {p === "halfyearly" ? <span>€{plans.halfyearly.total} alle 6 Monate</span> : null}
                    {p === "yearly" ? (
                      <span className="font-medium text-[#16A34A]">
                        Spare €{(plans.monthly.price - plans.yearly.price) * 12}/Jahr
                      </span>
                    ) : null}
                  </div>
                  <Link
                    href={registerFromPricingHref(p)}
                    onClick={() => markReturnToPricingFlag()}
                    className={`mt-auto ${p === "yearly" ? "yd-login-btn-primary" : "yd-login-btn-secondary"}`}
                  >
                    Jetzt starten
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="mb-5 text-[14px] text-[#3D5266] md:mb-8">Alle Pläne beinhalten:</p>
              <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
                {["Unbegrenzte Fälle", "Cloud-Speicher", "Alle Updates inkl."].map((label) => (
                  <div key={label} className="flex items-center justify-center gap-2 text-[13px] text-[#3D5266]">
                    <svg className="h-4 w-4 shrink-0 text-[#2F80ED]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

