import Link from "next/link";

import { resendSignupConfirmation, signUp } from "../actions";
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

  const loginHref = (() => {
    if (inviteToken) {
      const q = `/login?invite=${encodeURIComponent(inviteToken)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`;
      return fromPricing ? `${q}#pricing` : q;
    }
    return fromPricing ? "/login#pricing" : "/login";
  })();

  return (
    <>
      <RegisterClient
        signUpAction={signUp}
        resendConfirmationAction={resendSignupConfirmation}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
        initialPlan={params.plan}
        queryError={queryError}
        success={success}
        loginHref={loginHref}
      />
      <div className="pb-10 text-center text-[13px] text-gray-500">
        Schon ein Konto?{" "}
        <Link
          href={loginHref}
          className="font-medium text-[#0284C7] transition-colors duration-150 hover:text-[#0369A1]"
        >
          Anmelden
        </Link>
      </div>
    </>
  );
}
