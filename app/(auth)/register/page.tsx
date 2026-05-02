import Link from "next/link";

import { signUp } from "../actions";
import { RegisterClient } from "./RegisterClient";

interface RegisterPageProps {
  searchParams: Promise<{
    invite?: string;
    email?: string;
    error?: string;
    plan?: string;
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const inviteToken = params.invite?.trim() || "";
  const prefilledEmail = params.email?.trim() || "";
  const queryError = params.error;

  return (
    <>
      <RegisterClient
        signUpAction={signUp}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
        initialPlan={params.plan}
        queryError={queryError}
      />
      <div className="pb-10 text-center text-[13px] text-gray-500">
        Schon ein Konto?{" "}
        <Link
          href={
            inviteToken
              ? `/login?invite=${encodeURIComponent(inviteToken)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`
              : "/login"
          }
          className="font-medium text-[#0284C7] transition-colors duration-150 hover:text-[#0369A1]"
        >
          Anmelden
        </Link>
      </div>
    </>
  );
}
