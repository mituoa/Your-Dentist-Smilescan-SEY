"use client";

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
  /** Schließen auf Schritt 1 — Startseite, nicht Preissektion. */
  exitHref: string;
  registrationDemoUi: boolean;
  registrationDemoServer: boolean;
  skipPaymentAtSignup: boolean;
  licenseStepOptional: boolean;
};

/** Registrierungs-Assistent — immer sichtbar auf /register (Pricing optional über /pricing). */
export function RegisterPageClient(props: RegisterPageClientProps) {
  const wizardOpen = true;

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
      exitHref={props.exitHref}
      registrationDemoUi={props.registrationDemoUi}
      registrationDemoServer={props.registrationDemoServer}
      skipPaymentAtSignup={props.skipPaymentAtSignup}
      licenseStepOptional={props.licenseStepOptional}
      wizardOpen={wizardOpen}
      presentation="page"
    />
  );
}
