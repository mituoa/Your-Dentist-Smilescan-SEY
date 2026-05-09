"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { resendSignupConfirmation, signIn, signInWithGoogle } from "@/app/(auth)/actions";
import { LoginSubmitButton } from "@/components/auth/login-submit-button";

const RETURN_PRICING_STORAGE_KEY = "smilescan-return-pricing-v1";

interface LoginPageClientProps {
  queryError?: string;
  resent?: boolean;
  inviteToken?: string;
  prefilledEmail?: string;
  year: number;
}

export function LoginPageClient({
  queryError,
  resent = false,
  inviteToken = "",
  prefilledEmail = "",
  year,
}: LoginPageClientProps) {
  const [activeCta, setActiveCta] = useState<"trial" | "plan" | null>(null);
  const [showPlanSheet, setShowPlanSheet] = useState(false);

  const registerFromPricingHref = (plan: "monthly" | "halfyearly" | "yearly") =>
    `/register?plan=${plan}&from=pricing`;

  const markReturnToPricing = () => {
    try {
      sessionStorage.setItem(RETURN_PRICING_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const scrollToPricing = (behavior: ScrollBehavior = "smooth") => {
    const el = document.getElementById("pricing");
    if (!el) return;
    el.scrollIntoView({ behavior, block: "start" });
  };

  useEffect(() => {
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
        try {
          sessionStorage.removeItem(RETURN_PRICING_STORAGE_KEY);
        } catch {
          /* ignore */
        }
      }
    };

    restore();
    window.addEventListener("hashchange", restore);
    return () => window.removeEventListener("hashchange", restore);
  }, []);

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

  const parsedError = useMemo(() => {
    const raw = (queryError ? decodeURIComponent(queryError) : "").trim();
    if (!raw) return null;

    if (raw === "account_pending_approval") {
      return {
        tone: "info" as const,
        title: "Account wartet auf Freischaltung",
        body: "Wir prüfen Ihre Registrierung. Sobald Ihr Account freigeschaltet ist, können Sie sich anmelden.",
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

    // fallback: show original error (already used before)
    return {
      tone: "danger" as const,
      title: "Anmeldung fehlgeschlagen",
      body: raw,
    };
  }, [queryError]);

  const shouldShowResend = (queryError ? decodeURIComponent(queryError).trim() : "") === "email_not_confirmed";

  return (
    <div className="overflow-x-hidden">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes successPulse {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes checkmarkDraw {
          from { stroke-dasharray: 100; stroke-dashoffset: 100; opacity: 0; }
          to { stroke-dasharray: 100; stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>

      <div className="w-full bg-[#FAFAFA]">
        {showPlanSheet ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={closePlanSheet}
              aria-label="Schließen"
            />
            <div
              className="relative max-h-[min(92dvh,92vh)] w-full max-w-xl translate-y-0 overflow-y-auto rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-5 md:-translate-y-10"
              style={{ animation: "modalSlideIn 0.2s ease-out" }}
              role="dialog"
              aria-modal="true"
            >
              <div className="mb-4 flex min-w-0 items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0 pr-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Preise
                  </p>
                  <h3 className="mt-1 text-[18px] font-semibold tracking-tight text-gray-900">
                    Wählen Sie Ihren Plan
                  </h3>
                  <p className="mt-1 text-[13px] text-gray-600">
                    14 Tage kostenlos testen. Kündbar jederzeit.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePlanSheet}
                  className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
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
                    className={`flex h-full flex-col rounded-xl border p-3 sm:rounded-2xl sm:p-4 ${
                      p === "yearly" ? "border-[#0284C7]/50 bg-white sm:border-[#0284C7]/40 sm:bg-[#0284C7]/5" : "border-gray-200/90 bg-white"
                    }`}
                  >
                    <p className="text-[11px] font-semibold text-gray-900 sm:text-[12px]">{plans[p].label}</p>
                    <p className="mt-0.5 text-[11px] text-gray-500 sm:mt-1 sm:text-[12px]">{plans[p].billing}</p>
                    <div className="mt-2 sm:mt-3">
                      <span className={`text-xl font-semibold sm:text-[22px] ${p === "yearly" ? "text-[#0284C7]" : "text-gray-900"}`}>
                        €{plans[p].price}
                      </span>
                      <span className="ml-1 text-[11px] text-gray-500 sm:text-[12px]">/Monat</span>
                    </div>
                    <Link
                      href={registerFromPricingHref(p)}
                      className={`mt-auto inline-flex h-11 min-h-[44px] w-full items-center justify-center rounded-lg text-[12px] font-semibold md:h-10 md:min-h-0 md:rounded-xl md:text-[13px] ${
                        p === "yearly"
                          ? "bg-gradient-to-b from-[#0284C7] to-[#0369A1] text-white shadow-sm"
                          : "border border-gray-900 bg-white text-gray-900 hover:bg-gray-900 hover:text-white"
                      }`}
                      onClick={() => {
                        markReturnToPricing();
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
                  className="min-w-0 text-left text-[13px] font-semibold text-[#0284C7] hover:text-[#0369A1]"
                >
                  Alle Details ansehen
                </button>
                <p className="shrink-0 text-[12px] text-gray-500">Preise zzgl. MwSt.</p>
              </div>
            </div>
          </div>
        ) : null}
        {/* LOGIN SECTION */}
        <div
          className="flex min-h-screen items-center justify-center bg-[#F8F7F3] pb-[max(2rem,calc(1.25rem+env(safe-area-inset-bottom,0px)))] md:pb-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.6) 0%, rgba(248,247,243,0) 60%, rgba(240,240,240,0.3) 100%)",
          }}
        >
          <div className="grid min-w-0 w-full max-w-[1050px] grid-cols-1 items-center gap-x-[140px] px-4 sm:px-6 lg:grid-cols-[420px_390px] lg:px-10">
            {/* LEFT SECTION */}
            <div
              className="hidden lg:flex w-[420px] max-w-[420px] flex-col items-start text-left"
              style={{ transform: "translateY(-36px)" }}
            >
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="256"
                    height="256"
                    viewBox="0 0 256 256"
                    fill="none"
                    className="w-11 h-11"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="logo-left"
                        x1="50"
                        y1="42"
                        x2="210"
                        y2="214"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#FFFFFF" />
                        <stop offset="1" stopColor="#E0F2FE" />
                      </linearGradient>
                    </defs>
                    <rect x="42" y="42" width="172" height="172" rx="48" fill="url(#logo-left)" />
                    <rect
                      x="42.75"
                      y="42.75"
                      width="170.5"
                      height="170.5"
                      rx="47.25"
                      stroke="#0284C7"
                      strokeOpacity="0.18"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M92 90C103 81.333 115 77 128 77C141 77 153 81.333 164 90"
                      stroke="#0284C7"
                      strokeOpacity="0.34"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    <path
                      d="M99 103L128 131L157 103"
                      stroke="#0284C7"
                      strokeWidth="11"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M128 130V157"
                      stroke="#0284C7"
                      strokeWidth="11"
                      strokeLinecap="round"
                    />
                    <path
                      d="M96 171C106.333 181 117 186 128 186C139 186 149.667 181 160 171"
                      stroke="#0284C7"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div>
                    <h1 className="text-2xl font-medium text-gray-900 tracking-tight leading-none">
                      <span className="italic font-light">Your</span> Dentist
                    </h1>
                  </div>
                </div>
                <p className="text-[10px] font-semibold text-[#0284C7] uppercase tracking-[0.15em] ml-14">
                  Neutral Practice Platform
                </p>
              </div>

              {/* Headline */}
              <h2 className="w-[420px] text-[28px] font-medium text-gray-900 leading-[1.2] tracking-[-0.01em] mb-16">
                Digitale Fallaufnahme
                <br />
                für Zahnärzte
              </h2>

              {/* Trust points */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-[18px] h-[18px] text-[#0284C7] mt-[2px] flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                  <p className="text-[15px] text-gray-700 leading-relaxed whitespace-nowrap">
                    DSGVO-konform &amp; medizinisch zertifiziert
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <svg
                    className="w-[18px] h-[18px] text-[#0284C7] mt-[2px] flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <p className="text-[15px] text-gray-700 leading-relaxed whitespace-nowrap">
                    Echtzeit-Zugriff auf Patientendaten
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <svg
                    className="w-[18px] h-[18px] text-[#0284C7] mt-[2px] flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                  <p className="text-[15px] text-gray-700 leading-relaxed whitespace-nowrap">
                    Über 2.500 Zahnarztpraxen nutzen Your Dentist
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="w-full min-w-0 lg:w-[360px]">
              <div className="mb-6 flex items-center justify-center gap-3 lg:mb-12 lg:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="256"
                  height="256"
                  viewBox="0 0 256 256"
                  fill="none"
                  className="w-11 h-11"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="logo-mobile"
                      x1="50"
                      y1="42"
                      x2="210"
                      y2="214"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#FFFFFF" />
                      <stop offset="1" stopColor="#E0F2FE" />
                    </linearGradient>
                  </defs>
                  <rect x="42" y="42" width="172" height="172" rx="48" fill="url(#logo-mobile)" />
                  <rect
                    x="42.75"
                    y="42.75"
                    width="170.5"
                    height="170.5"
                    rx="47.25"
                    stroke="#0284C7"
                    strokeOpacity="0.18"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M92 90C103 81.333 115 77 128 77C141 77 153 81.333 164 90"
                    stroke="#0284C7"
                    strokeOpacity="0.34"
                    strokeWidth="9"
                    strokeLinecap="round"
                  />
                  <path
                    d="M99 103L128 131L157 103"
                    stroke="#0284C7"
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M128 130V157"
                    stroke="#0284C7"
                    strokeWidth="11"
                    strokeLinecap="round"
                  />
                  <path
                    d="M96 171C106.333 181 117 186 128 186C139 186 149.667 181 160 171"
                    stroke="#0284C7"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                </svg>
                <div>
                  <h1 className="text-xl font-medium text-gray-900 leading-none">
                    <span className="italic font-light">Your</span> Dentist
                  </h1>
                  <p className="text-[9px] font-semibold text-[#0284C7] uppercase tracking-[0.15em]">
                    Neutral Practice Platform
                  </p>
                </div>
              </div>

              <div
                className="max-md:border-gray-200/55 max-md:p-4 rounded-2xl border border-gray-200/70 bg-white p-5 lg:rounded-[22px] lg:border-gray-100/80 lg:p-8"
                style={{
                  boxShadow:
                    "0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.02), 0 16px 24px rgba(0,0,0,0.03)",
                }}
              >
                <div className="max-md:mb-5 mb-6 lg:mb-10">
                  <h2 className="max-md:text-[1.375rem] max-md:leading-[1.25] max-md:tracking-tight mb-1.5 text-2xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-[28px] lg:mb-2 lg:text-[32px]">
                    Anmelden
                  </h2>
                  <p className="max-md:text-[12.5px] max-md:leading-relaxed text-[13px] text-gray-500 lg:text-[14px]">
                    Greifen Sie auf Ihr Your Dentist-Konto zu
                  </p>
                </div>

                {parsedError ? (
                  <div
                    className={`mb-6 rounded-xl border px-4 py-3 text-[14px] ${
                      parsedError.tone === "danger"
                        ? "border-red-200/70 bg-red-50/70 text-danger"
                        : parsedError.tone === "warning"
                          ? "border-amber-200/70 bg-amber-50/70 text-amber-900"
                          : "border-blue-200/70 bg-blue-50/70 text-blue-900"
                    }`}
                  >
                    <p className="font-semibold">{parsedError.title}</p>
                    <p className="mt-1">{parsedError.body}</p>
                  </div>
                ) : null}

                {resent ? (
                  <p className="mb-6 rounded-xl border border-green-200/70 bg-green-50/70 px-4 py-3 text-[14px] text-green-700">
                    Bestätigungs‑E‑Mail wurde erneut versendet. Bitte prüfen Sie auch den Spam‑Ordner.
                  </p>
                ) : null}

                <form action={signIn} className="max-md:space-y-2.5 space-y-3 lg:space-y-4">
                  {inviteToken ? (
                    <input type="hidden" name="invite_token" value={inviteToken} />
                  ) : null}

                  <div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={prefilledEmail}
                      placeholder="E-Mail-Adresse"
                      autoComplete="email"
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="max-md:border-gray-200/65 max-md:shadow-none max-md:focus:ring-2 h-11 w-full rounded-lg border border-gray-200/90 bg-white px-3.5 text-[15px] text-gray-900 transition-all duration-150 placeholder:text-gray-400 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10 disabled:bg-gray-50 disabled:opacity-50 lg:h-[52px] lg:rounded-xl lg:px-4"
                      required
                    />
                  </div>

                  <div>
                    <div className="max-md:mb-1 mb-1.5 flex items-center justify-end lg:mb-2">
                      <Link
                        href={
                          inviteToken
                            ? `/forgot-password?invite=${encodeURIComponent(inviteToken)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`
                            : "/forgot-password"
                        }
                        className="text-[13px] font-medium text-[#0284C7] hover:text-[#0369A1] transition-colors duration-150"
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
                      className="max-md:border-gray-200/65 max-md:shadow-none max-md:focus:ring-2 h-11 w-full rounded-lg border border-gray-200/90 bg-white px-3.5 text-[15px] text-gray-900 transition-all duration-150 placeholder:text-gray-400 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10 disabled:bg-gray-50 disabled:opacity-50 lg:h-[52px] lg:rounded-xl lg:px-4"
                      required
                    />
                  </div>

                  <LoginSubmitButton />
                </form>

                {shouldShowResend ? (
                  <div className="mt-4 rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-3">
                    <p className="text-[13px] font-semibold text-amber-900">Keine Bestätigungs‑E‑Mail erhalten?</p>
                    <p className="mt-1 text-[13px] text-amber-900/80">
                      Wir senden Ihnen den Bestätigungs‑Link erneut an die oben eingegebene Adresse.
                    </p>
                    <form action={resendSignupConfirmation} className="mt-3">
                      {inviteToken ? (
                        <input type="hidden" name="invite_token" value={inviteToken} />
                      ) : null}
                      <input type="hidden" name="email" value={resendEmail} />
                      <button
                        type="submit"
                        className="w-full h-[44px] rounded-xl border border-amber-200 bg-white text-[13px] font-semibold text-amber-900 transition-colors hover:bg-amber-100/50"
                      >
                        Bestätigungs‑E‑Mail erneut senden
                      </button>
                    </form>
                  </div>
                ) : null}

                <div className="relative max-md:my-4 my-5 lg:my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200/90" style={{ borderWidth: "0.5px" }} />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-[12px] text-gray-500 lg:px-5 lg:text-[13px]">oder</span>
                  </div>
                </div>

                <form action={signInWithGoogle}>
                  {inviteToken ? <input type="hidden" name="invite_token" value={inviteToken} /> : null}
                  <button
                    type="submit"
                    className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-gray-200/90 bg-white text-[13px] text-gray-900 transition-all duration-150 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.99] lg:h-[48px] lg:gap-3 lg:rounded-xl lg:text-[14px]"
                  >
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Mit Google anmelden
                  </button>
                </form>

                <div className="mt-5 text-center lg:mt-8">
                  <p className="text-[13px] text-gray-600 lg:text-[14px]">
                    Noch kein Konto?{" "}
                    <Link
                      href={registerFromPricingHref("yearly")}
                      onClick={markReturnToPricing}
                      className="font-semibold text-[#0284C7] hover:text-[#0369A1] transition-colors duration-150"
                    >
                      Jetzt registrieren
                    </Link>
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 lg:mt-3">
                    <Link
                      href={registerFromPricingHref("yearly")}
                      onClick={() => {
                        markReturnToPricing();
                        setActiveCta("trial");
                      }}
                      className={`inline-flex h-8 items-center justify-center rounded-full border px-3 text-[11px] font-semibold transition-colors lg:h-9 lg:px-4 lg:text-[12px] ${
                        activeCta === "trial"
                          ? "border-[#0284C7]/40 bg-[#0284C7]/10 text-[#0284C7]"
                          : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      Kostenlos testen
                    </Link>
                    <button
                      type="button"
                      onClick={openPlanSheet}
                      className={`inline-flex h-8 items-center justify-center rounded-full border px-3 text-[11px] font-semibold transition-colors lg:h-9 lg:px-4 lg:text-[12px] ${
                        activeCta === "plan"
                          ? "border-[#0284C7]/40 bg-[#0284C7]/10 text-[#0284C7]"
                          : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      Plan wählen
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-gray-500 sm:gap-6 sm:text-[12px] lg:mt-8">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-[#0284C7]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                  <span>DSGVO</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-[#0284C7]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>SSL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-[#0284C7]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>ISO 27001</span>
                </div>
              </div>

              <div className="mt-5 text-center lg:mt-8">
                <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400 lg:text-[12px]">
                  <Link href="/datenschutz" className="hover:text-[#0284C7] transition-colors duration-150">
                    Datenschutz
                  </Link>
                  <span>•</span>
                  <Link href="/impressum" className="hover:text-[#0284C7] transition-colors duration-150">
                    Impressum
                  </Link>
                </div>
                <p className="mt-2 text-[11px] text-gray-400">© {year} Your Dentist GmbH</p>
              </div>
            </div>
          </div>
        </div>

        <div
          id="pricing"
          className="w-full min-w-0 scroll-mt-20 border-t border-transparent bg-white px-4 pb-[max(2.75rem,calc(1.5rem+env(safe-area-inset-bottom,0px)))] pt-4 max-md:border-gray-200/25 sm:px-6 sm:pb-[max(3rem,calc(1.75rem+env(safe-area-inset-bottom,0px)))] sm:pt-7 md:scroll-mt-24 md:border-t-0 md:px-8 md:py-14 md:pb-16 lg:px-16 lg:py-16"
        >
          <div className="mx-auto max-w-5xl">
            <div className="max-md:mb-2.5 mb-3 text-center md:mb-4">
              <h2 className="max-md:text-[1.375rem] max-md:leading-tight mb-1.5 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl md:mb-3 md:text-4xl lg:text-[36px]">
                Einfache, transparente Preise
              </h2>
              <p className="mx-auto max-w-xl max-md:text-[13px] max-md:leading-relaxed text-[14px] text-gray-600 md:text-[16px]">
                Alle Pläne beinhalten den vollen Funktionsumfang. Wählen Sie einfach Ihren Abrechnungszeitraum.
              </p>
            </div>

            <div className="max-md:mb-5 mb-6 flex flex-col items-center justify-center gap-2.5 text-[12px] text-gray-600 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2 sm:text-[13px] md:mb-12 md:gap-6">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>14 Tage kostenlos testen</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Jederzeit kündbar</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>30 Tage Geld-zurück-Garantie</span>
              </div>
            </div>

            <div
              className="max-md:mb-6 mb-8 grid grid-cols-1 gap-2 max-md:gap-2 md:mb-16 md:grid-cols-3 md:gap-4"
              style={{ animation: "fadeIn 0.6s ease-out" }}
            >
              <div
                className="flex flex-col rounded-xl border border-gray-200/90 bg-white p-3.5 transition-all duration-200 hover:border-[#0284C7] max-md:border-gray-200/70 max-md:p-3 md:rounded-2xl md:border-2 md:border-gray-200 md:p-6 md:hover:shadow-lg"
                style={{ animation: "fadeIn 0.5s ease-out 0.1s both" }}
              >
                <div className="h-1.5 md:h-[20px]" />
                <h3 className="mb-0.5 text-lg font-semibold text-gray-900 md:text-[20px]">Monatlich</h3>
                <p className="max-md:mb-1.5 mb-2 text-[12px] leading-snug text-gray-500 md:mb-6 md:text-[13px]">{plans.monthly.billing}</p>
                <div className="max-md:mb-0 mb-0 md:mb-2">
                  <span className="max-md:text-[1.625rem] text-3xl font-semibold text-gray-900 md:text-[40px]">€{plans.monthly.price}</span>
                  <span className="ml-1 text-[14px] text-gray-500 md:text-[16px]">/Monat</span>
                </div>
                <div className="mb-2.5 h-1.5 max-md:mb-2 md:mb-8 md:h-[20px]" />
                <Link
                  href={registerFromPricingHref("monthly")}
                  onClick={markReturnToPricing}
                  className="mt-auto inline-flex h-11 w-full items-center justify-center rounded-lg border border-gray-900 bg-white text-[14px] font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-900 hover:text-white active:scale-[0.98] md:h-[48px] md:rounded-xl md:border-2 md:text-[15px] md:hover:-translate-y-0.5"
                >
                  Jetzt starten
                </Link>
              </div>

              <div
                className="relative flex flex-col rounded-xl border border-gray-200/90 bg-white p-3.5 transition-all duration-200 hover:border-[#0284C7] max-md:border-gray-200/70 max-md:p-3 md:rounded-2xl md:border-2 md:border-gray-200 md:p-6 md:hover:shadow-lg"
                style={{ animation: "fadeIn 0.5s ease-out 0.2s both" }}
              >
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 md:-top-3">
                  <span className="rounded-full bg-[#F59E0B] px-2.5 py-0.5 text-[10px] font-semibold text-white md:px-3 md:py-1 md:text-[11px]">
                    SPARE 10%
                  </span>
                </div>
                <div className="h-1.5 md:h-[20px]" />
                <h3 className="mb-0.5 text-lg font-semibold text-gray-900 md:text-[20px]">Halbjährlich</h3>
                <p className="max-md:mb-1.5 mb-2 text-[12px] leading-snug text-gray-500 md:mb-6 md:text-[13px]">{plans.halfyearly.billing}</p>
                <div className="max-md:mb-0 mb-0 md:mb-2">
                  <span className="max-md:text-[1.625rem] text-3xl font-semibold text-gray-900 md:text-[40px]">€{plans.halfyearly.price}</span>
                  <span className="ml-1 text-[14px] text-gray-500 md:text-[16px]">/Monat</span>
                </div>
                <div className="mb-2.5 flex min-h-[1.125rem] items-center justify-start max-md:mb-2 md:mb-8 md:h-[20px]">
                  <span className="text-[11px] text-gray-500 md:text-[12px]">€{plans.halfyearly.total} alle 6 Monate</span>
                </div>
                <Link
                  href={registerFromPricingHref("halfyearly")}
                  onClick={markReturnToPricing}
                  className="mt-auto inline-flex h-11 w-full items-center justify-center rounded-lg border border-gray-900 bg-white text-[14px] font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-900 hover:text-white active:scale-[0.98] md:h-[48px] md:rounded-xl md:border-2 md:text-[15px] md:hover:-translate-y-0.5"
                >
                  Jetzt starten
                </Link>
              </div>

              <div
                className="relative flex flex-col rounded-xl border border-[#0284C7] bg-white p-3.5 shadow-sm max-md:p-3 max-md:shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:rounded-2xl md:border-2 md:p-6 md:shadow-lg"
                style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}
              >
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 md:-top-3">
                  <span className="rounded-full bg-[#0284C7] px-2.5 py-0.5 text-[10px] font-semibold text-white md:px-3 md:py-1 md:text-[11px]">
                    AM BELIEBTESTEN
                  </span>
                </div>
                <div className="h-1.5 md:h-[20px]" />
                <h3 className="mb-0.5 text-lg font-semibold text-gray-900 md:text-[20px]">Jährlich</h3>
                <p className="max-md:mb-1.5 mb-2 text-[12px] leading-snug text-gray-500 md:mb-6 md:text-[13px]">{plans.yearly.billing}</p>
                <div className="max-md:mb-0 mb-0 md:mb-2">
                  <span className="max-md:text-[1.625rem] text-3xl font-semibold text-gray-900 md:text-[40px]">€{plans.yearly.price}</span>
                  <span className="ml-1 text-[14px] text-gray-500 md:text-[16px]">/Monat</span>
                </div>
                <div className="mb-2.5 flex min-h-[1.125rem] items-center justify-start max-md:mb-2 md:mb-8 md:h-[20px]">
                  <span className="text-[11px] font-semibold text-green-600 md:text-[12px]">
                    Spare €{(plans.monthly.price - plans.yearly.price) * 12}/Jahr
                  </span>
                </div>
                <Link
                  href={registerFromPricingHref("yearly")}
                  onClick={markReturnToPricing}
                  className="mt-auto inline-flex h-11 w-full items-center justify-center rounded-lg text-[14px] font-semibold text-white shadow-sm transition-all duration-200 active:scale-[0.98] max-md:shadow-none md:h-[48px] md:rounded-xl md:text-[15px] md:shadow-md md:hover:-translate-y-0.5 md:hover:shadow-xl"
                  style={{
                    background: "linear-gradient(to bottom, #0284C7 0%, #0369A1 100%)",
                  }}
                >
                  Jetzt starten
                </Link>
              </div>
            </div>

            <div className="text-center">
              <p className="max-md:mb-4 mb-5 text-[14px] text-gray-600 md:mb-8">Alle Pläne beinhalten:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {["Unbegrenzte Fälle", "Cloud-Speicher", "Alle Updates inkl."].map((label) => (
                  <div key={label} className="flex items-center gap-2 justify-center text-[13px] text-gray-700">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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

        {null}
      </div>
    </div>
  );
}

