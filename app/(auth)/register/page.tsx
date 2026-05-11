import Link from "next/link";

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
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const inviteToken = params.invite?.trim() || "";
  const prefilledEmail = params.email?.trim() || "";
  const queryError = params.error;
  const success = params.success === "1";
  const fromPricing = params.from?.trim() === "pricing";

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
      <RegisterClient
        signUpAction={signUp}
        resendConfirmationAction={resendSignupConfirmation}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
        initialPlan={params.plan}
        queryError={queryError}
        success={success}
        fromPricing={fromPricing}
        loginHref={loginHrefPlain}
        loginHrefWithPricingHash={loginHrefWithPricingHash}
        registrationDemoUi={registrationDemoUi}
        registrationDemoServer={isRegistrationDemoMode()}
        skipPaymentAtSignup={skipPaymentAtSignup()}
        licenseStepOptional={isRegistrationDemoMode()}
      />
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
