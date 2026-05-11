import Link from "next/link";
import { Suspense } from "react";

import { AuthLoadingSpinner } from "@/components/auth/auth-loading-spinner";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { resendSignupConfirmation, signUp } from "../actions";
import { isRegistrationDemoMode, skipPaymentAtSignup } from "@/lib/registration-demo";
import { RegisterClient } from "./RegisterClient";

interface RegisterPageProps {
  searchParams: Promise<{
    invite?: string;
    email?: string;
    error?: string;
    plan?: string;
    success?: string;
    from?: string;
    step?: string;
    resent?: string;
  }>;
}

function parseWizardStep(raw: string | undefined): 1 | 2 | 3 | 4 {
  const n = raw?.trim() ? Number.parseInt(raw.trim(), 10) : Number.NaN;
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return 1;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const inviteToken = params.invite?.trim() || "";
  const prefilledEmail = params.email?.trim() || "";
  const queryError = params.error;
  const success = params.success === "1";
  const fromPricing = params.from?.trim() === "pricing";
  const resent = params.resent === "1";
  const initialWizardStep = success ? 1 : parseWizardStep(params.step);

  const demoUiRaw = (process.env.NEXT_PUBLIC_REGISTRATION_DEMO_MODE ?? "").trim().toLowerCase();
  const registrationDemoUi = demoUiRaw === "true" || demoUiRaw === "1";

  const loginHrefPlain = inviteToken
    ? `/login?invite=${encodeURIComponent(inviteToken)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`
    : "/login";

  /** Only for pricing-origin flow: return to pricing section after closing the plan/payment step. */
  const loginHrefWithPricingHash = fromPricing
    ? inviteToken
      ? `${loginHrefPlain}#pricing`
      : "/login#pricing"
    : null;

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <Suspense
        fallback={
          <div
            className="mx-auto flex min-h-[min(480px,75dvh)] w-full max-w-2xl flex-col items-center justify-center rounded-3xl border border-gray-200/80 bg-white px-6 py-16 shadow-[0_4px_6px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.08)]"
            role="status"
            aria-live="polite"
            aria-label="Registrierung wird geladen"
          >
            <YourDentistBrandLockup size="md" tagline="Neutral Practice Platform" centered />
            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <AuthLoadingSpinner />
              <p className="text-[13px] text-gray-500">Registrierung wird geladen…</p>
            </div>
          </div>
        }
      >
        <RegisterClient
          signUpAction={signUp}
          resendConfirmationAction={resendSignupConfirmation}
          inviteToken={inviteToken}
          prefilledEmail={prefilledEmail}
          initialPlan={params.plan}
          queryError={queryError}
          success={success}
          resent={resent}
          initialWizardStep={initialWizardStep}
          fromPricing={fromPricing}
          loginHref={loginHrefPlain}
          loginHrefWithPricingHash={loginHrefWithPricingHash}
          registrationDemoUi={registrationDemoUi}
          registrationDemoServer={isRegistrationDemoMode()}
          skipPaymentAtSignup={skipPaymentAtSignup()}
          licenseStepOptional={isRegistrationDemoMode()}
        />
      </Suspense>
      <div className="px-4 pb-10 pt-2 text-center text-[13px] text-gray-500 sm:px-5">
        Schon ein Konto?{" "}
        <Link
          href={loginHrefPlain}
          className="font-medium text-[#0284C7] transition-colors duration-150 hover:text-[#0369A1]"
        >
          Anmelden
        </Link>
      </div>
    </div>
  );
}
