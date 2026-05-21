"use client";

import { useSearchParams } from "next/navigation";

import { RegisterClient } from "@/app/(auth)/register/RegisterClient";
import type { resendSignupConfirmation, signUp } from "@/app/(auth)/actions";
import { RegisterOnboardingShell } from "@/components/auth/register-onboarding-shell";
import { YdRegisterPricing } from "@/components/auth/yd-register-pricing";
import { coerceRegisterPlan } from "@/lib/auth/register-plans";

type SignUpAction = typeof signUp;
type ResendAction = typeof resendSignupConfirmation;

type RegisterPageClientProps = {
  signUpAction: SignUpAction;
  resendConfirmationAction: ResendAction;
  inviteToken: string;
  prefilledEmail: string;
  initialPlan?: string | null;
  queryError?: string;
  success: boolean;
  resent: boolean;
  initialWizardStep: 1 | 2 | 3 | 4;
  fromPricing: boolean;
  loginHref: string;
  loginHrefWithPricingHash: string | null;
  registrationDemoUi: boolean;
  registrationDemoServer: boolean;
  skipPaymentAtSignup: boolean;
  licenseStepOptional: boolean;
};

function isWizardStep(raw: string | null): raw is "1" | "2" | "3" | "4" {
  return raw === "1" || raw === "2" || raw === "3" || raw === "4";
}

export function RegisterPageClient(props: RegisterPageClientProps) {
  const searchParams = useSearchParams();
  const stepRaw = searchParams.get("step");
  const wizardOpen = props.success || isWizardStep(stepRaw?.trim() ?? null);
  const selectedPlan = coerceRegisterPlan(props.initialPlan);

  return (
    <RegisterOnboardingShell loginHref={props.loginHref}>
      {!wizardOpen ? (
        <YdRegisterPricing
          selectedPlan={selectedPlan}
          inviteToken={props.inviteToken}
          prefilledEmail={props.prefilledEmail}
        />
      ) : null}
      <RegisterClient
        signUpAction={props.signUpAction}
        resendConfirmationAction={props.resendConfirmationAction}
        inviteToken={props.inviteToken}
        prefilledEmail={props.prefilledEmail}
        initialPlan={props.initialPlan}
        queryError={props.queryError}
        success={props.success}
        resent={props.resent}
        initialWizardStep={props.initialWizardStep}
        fromPricing={props.fromPricing}
        loginHref={props.loginHref}
        loginHrefWithPricingHash={props.loginHrefWithPricingHash}
        registrationDemoUi={props.registrationDemoUi}
        registrationDemoServer={props.registrationDemoServer}
        skipPaymentAtSignup={props.skipPaymentAtSignup}
        licenseStepOptional={props.licenseStepOptional}
        wizardOpen={wizardOpen}
      />
    </RegisterOnboardingShell>
  );
}
