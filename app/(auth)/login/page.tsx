import Link from "next/link";

import { signIn } from "../actions";
import { LoginSubmitButton } from "@/components/auth/login-submit-button";
import { LoginPricingBlock } from "@/components/marketing/login-pricing-block";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    invite?: string;
    email?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const queryError = params.error;
  const inviteToken = params.invite?.trim() || "";
  const prefilledEmail = params.email?.trim() || "";
  const year = new Date().getFullYear();

  return (
    <div className="w-full bg-[#FAFAFA]">
      {/* LOGIN SECTION */}
      <section className="relative flex min-h-screen w-full">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.6) 0%, rgba(250,250,250,0) 60%, rgba(240,240,240,0.3) 100%)",
          }}
        />

        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-center gap-12 px-8 py-12 lg:justify-center lg:gap-[300px] lg:px-16 xl:gap-[300px] xl:px-24">
        <div className="hidden max-w-md shrink-0 flex-col justify-center lg:-mt-32 lg:flex xl:max-w-lg">
          <div className="mb-16">
            <div className="mb-2 flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="256"
                height="256"
                viewBox="0 0 256 256"
                fill="none"
                className="h-11 w-11"
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
                <h1 className="text-2xl font-medium leading-none tracking-tight text-gray-900">
                  <span className="font-light italic">Your</span> Dentist
                </h1>
              </div>
            </div>
            <p className="ml-14 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#0284C7]">
              Neutral Practice Platform
            </p>
          </div>

          <h2 className="mb-16 text-[28px] font-medium leading-[1.25] tracking-[-0.01em] text-gray-900">
            Digitale Fallaufnahme
            <br />
            für Zahnärzte
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <svg
                className="mt-[2px] h-[18px] w-[18px] flex-shrink-0 text-[#0284C7]"
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
              <p className="text-[15px] leading-relaxed text-gray-700">
                DSGVO-konform &amp; medizinisch zertifiziert
              </p>
            </div>

            <div className="flex items-start gap-3">
              <svg
                className="mt-[2px] h-[18px] w-[18px] flex-shrink-0 text-[#0284C7]"
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
              <p className="text-[15px] leading-relaxed text-gray-700">
                Echtzeit-Zugriff auf Patientendaten
              </p>
            </div>

            <div className="flex items-start gap-3">
              <svg
                className="mt-[2px] h-[18px] w-[18px] flex-shrink-0 text-[#0284C7]"
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
              <p className="text-[15px] leading-relaxed text-gray-700">
                Über 2.500 Zahnarztpraxen nutzen Your Dentist
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md shrink-0 lg:-mt-12 lg:max-w-[380px]">
          <div className="mb-12 flex items-center justify-center gap-3 lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="256"
              height="256"
              viewBox="0 0 256 256"
              fill="none"
              className="h-11 w-11"
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
              <h1 className="text-xl font-medium leading-none text-gray-900">
                <span className="font-light italic">Your</span> Dentist
              </h1>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                Neutral Practice Platform
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl border border-gray-100/80 bg-white p-7"
            style={{
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.02), 0 16px 24px rgba(0,0,0,0.03)",
            }}
          >
            <div className="mb-10">
              <h2 className="mb-2 text-[30px] font-semibold leading-tight tracking-tight text-gray-900">
                Anmelden
              </h2>
              <p className="text-[14px] text-gray-500">
                Greifen Sie auf Ihr Your Dentist-Konto zu
              </p>
            </div>

            {queryError && (
              <p className="mb-6 rounded-xl border border-red-200/70 bg-red-50/70 px-4 py-3 text-[14px] text-danger">
                {decodeURIComponent(queryError)}
              </p>
            )}

            <form action={signIn} className="space-y-4">
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
                  className="h-[52px] w-full rounded-xl border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10"
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-end">
                  <Link
                    href={
                      inviteToken
                        ? `/forgot-password?invite=${encodeURIComponent(inviteToken)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`
                        : "/forgot-password"
                    }
                    className="text-[13px] font-medium text-[#0284C7] transition-colors duration-150 hover:text-[#0369A1]"
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
                  className="h-[52px] w-full rounded-xl border border-gray-200 bg-white px-4 text-[15px] text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:border-[#0284C7] focus:outline-none focus:ring-[3px] focus:ring-[#0284C7]/10"
                  required
                />
              </div>

              <LoginSubmitButton />
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full border-t border-gray-200"
                  style={{ borderWidth: "0.5px" }}
                />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-5 text-[13px] text-gray-500">
                  oder
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-[14px] text-gray-400 transition-all duration-150 hover:bg-gray-50"
            >
              <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
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
              Mit Google anmelden (bald)
            </button>

            <div className="mt-8 text-center">
              <p className="text-[14px] text-gray-600">
                Noch kein Konto?{" "}
                <Link
                  href={
                    inviteToken
                      ? `/register?invite=${encodeURIComponent(inviteToken)}`
                      : "/register"
                  }
                  className="font-semibold text-[#0284C7] transition-colors duration-150 hover:text-[#0369A1]"
                >
                  Jetzt registrieren
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-[12px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5 text-[#0284C7]"
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
                className="h-3.5 w-3.5 text-[#0284C7]"
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
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-3 text-[12px] text-gray-400">
              <Link
                href="/datenschutz"
                className="transition-colors duration-150 hover:text-[#0284C7]"
              >
                Datenschutz
              </Link>
              <span>•</span>
              <Link
                href="/impressum"
                className="transition-colors duration-150 hover:text-[#0284C7]"
              >
                Impressum
              </Link>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">
              © {year} Your Dentist GmbH
            </p>
          </div>
        </div>
      </div>
      </section>

      <LoginPricingBlock />
    </div>
  );
}
