import { redirect } from "next/navigation";

import { LoginPageClient } from "@/components/auth/login-page-client";
import { createClient } from "@/lib/supabase/server";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    invite?: string;
    email?: string;
    resent?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const queryError = params.error;
  const inviteToken = params.invite?.trim() || "";
  const prefilledEmail = params.email?.trim() || "";
  const resent = params.resent === "1";
  const year = new Date().getFullYear();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    if (inviteToken) {
      redirect(`/accept-invite?token=${encodeURIComponent(inviteToken)}`);
    }
    redirect("/dashboard");
  }

  return (
    <LoginPageClient
      queryError={queryError}
      resent={resent}
      inviteToken={inviteToken}
      prefilledEmail={prefilledEmail}
      year={year}
    />
  );
}
