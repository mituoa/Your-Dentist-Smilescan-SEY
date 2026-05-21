"use client";

import { useSearchParams } from "next/navigation";

import { RegisterClient } from "@/app/(auth)/register/RegisterClient";
import type { resendSignupConfirmation, signUp } from "@/app/(auth)/actions";

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
  pricingHref: string;
  registrationDemoUi: boolean;
  registrationDemoServer: boolean;
  skipPaymentAtSignup: boolean;
  licenseStepOptional: boolean;
};

function isWizardStep(raw: string | null): raw is "1" | "2" | "3" | "4" {
  return raw === "1" || raw === "2" || raw === "3" || raw === "4";
}

/** Nur Registrierungs-Assistent (Pricing lebt auf /pricing). */
export function RegisterPageClient(props: RegisterPageClientProps) {
  const searchParams = useSearchParams();
  const stepRaw = searchParams.get("step");
  const wizardOpen = props.success || isWizardStep(stepRaw?.trim() ?? null);

  return (
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
      pricingHref={props.pricingHref}
      registrationDemoUi={props.registrationDemoUi}
      registrationDemoServer={props.registrationDemoServer}
      skipPaymentAtSignup={props.skipPaymentAtSignup}
      licenseStepOptional={props.licenseStepOptional}
      wizardOpen={wizardOpen}
    />
  );
}
