import Link from "next/link";
import { Suspense } from "react";

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
            className="mx-auto min-h-[min(420px,70dvh)] w-full max-w-2xl animate-pulse rounded-3xl bg-gray-100"
            aria-hidden
          />
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
