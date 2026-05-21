import { redirect } from "next/navigation";
import { Suspense } from "react";

import { RegisterPageClient } from "@/components/auth/register-page-client";
import { YdAuthEnvironment } from "@/components/auth/yd-auth-environment";
import { YdAuthLoadingState } from "@/components/auth/yd-auth-ui";
import { resendSignupConfirmation, signUp } from "../actions";
import { isRegistrationDemoMode, skipPaymentAtSignup } from "@/lib/registration-demo";
import {
  clipInviteTokenQuery,
  isInviteTokenFormat,
} from "@/lib/team-invitations/invite-token-format";

interface RegisterPageProps {
  searchParams: Promise<{
    invite?: string;
    email?: string;
    error?: string | string[];
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

function isWizardActive(params: {
  success?: string;
  step?: string;
}): boolean {
  if (params.success === "1") return true;
  const s = params.step?.trim();
  return s === "1" || s === "2" || s === "3" || s === "4";
}

function buildPricingHref(params: {
  plan?: string;
  invite?: string;
  email?: string;
}): string {
  const p = new URLSearchParams();
  if (params.plan?.trim()) p.set("plan", params.plan.trim());
  if (params.invite?.trim()) p.set("invite", params.invite.trim());
  if (params.email?.trim()) p.set("email", params.email.trim());
  const qs = p.toString();
  return qs ? `/pricing?${qs}` : "/pricing";
}

const MAX_REGISTER_QUERY_ERROR_LEN = 512;

function normalizeRegisterQueryError(
  raw: string | string[] | undefined
): string | undefined {
  if (raw == null) return undefined;
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (typeof first !== "string") return undefined;
  const t = first.trim();
  if (!t) return undefined;
  return t.length > MAX_REGISTER_QUERY_ERROR_LEN ? t.slice(0, MAX_REGISTER_QUERY_ERROR_LEN) : t;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  if (!isWizardActive(params)) {
    redirect(buildPricingHref(params));
  }

  const inviteRaw = clipInviteTokenQuery(params.invite);
  const inviteToken = isInviteTokenFormat(inviteRaw) ? inviteRaw : "";
  const prefilledEmail = params.email?.trim() || "";
  const queryError = normalizeRegisterQueryError(params.error);
  const success = params.success === "1";
  const fromPricing = params.from?.trim() === "pricing";
  const resent = params.resent === "1";
  const initialWizardStep = success ? 1 : parseWizardStep(params.step);

  const demoUiRaw = (process.env.NEXT_PUBLIC_REGISTRATION_DEMO_MODE ?? "").trim().toLowerCase();
  const registrationDemoUi = demoUiRaw === "true" || demoUiRaw === "1";

  const loginHrefPlain = inviteToken
    ? `/login?invite=${encodeURIComponent(inviteToken)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`
    : "/login";

  const pricingHref = buildPricingHref({
    plan: params.plan,
    invite: inviteToken,
    email: prefilledEmail,
  });

  return (
    <YdAuthEnvironment scroll bare showBrand={false}>
      <Suspense
        fallback={
          <div className="flex min-h-[min(480px,75dvh)] flex-col items-center justify-center py-16">
            <YdAuthLoadingState label="Registrierung wird geladen …" />
          </div>
        }
      >
        <RegisterPageClient
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
          pricingHref={pricingHref}
          registrationDemoUi={registrationDemoUi}
          registrationDemoServer={isRegistrationDemoMode()}
          skipPaymentAtSignup={skipPaymentAtSignup()}
          licenseStepOptional={isRegistrationDemoMode()}
        />
      </Suspense>
    </YdAuthEnvironment>
  );
}
