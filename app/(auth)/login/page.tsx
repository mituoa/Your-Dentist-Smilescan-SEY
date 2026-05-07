import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { LoginPageClient } from "@/components/auth/login-page-client";
import { isAdminAllowlistEmail } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { resolveAuthenticatedEntryPath } from "@/lib/post-auth-entry";

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

  const blockingAuthErrors = new Set([
    "workspace_missing",
    "account_pending_approval",
    "email_not_confirmed",
  ]);

  let user: User | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    user = u;
  } catch (e) {
    console.error("[LoginPage] getUser failed:", e);
  }

  if (user) {
    if (inviteToken) {
      redirect(`/accept-invite?token=${encodeURIComponent(inviteToken)}`);
    }
    // Ops-Admin (ADMIN_EMAILS) may enter despite pending workspace; others stay to avoid redirect loops.
    if (
      isAdminAllowlistEmail(user.email) ||
      !queryError ||
      !blockingAuthErrors.has(queryError)
    ) {
      redirect(await resolveAuthenticatedEntryPath());
    }
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
