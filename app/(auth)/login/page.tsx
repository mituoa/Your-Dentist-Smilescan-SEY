import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { LoginPageClient } from "@/components/auth/login-page-client";
import { isBlockingAuthError } from "@/lib/auth-blocking-errors";
import { isAdminAllowlistUser } from "@/lib/auth-helpers";
import { isAuthRelaxMode } from "@/lib/auth-relax-mode";
import { createClient } from "@/lib/supabase/server";
import { resolveAuthenticatedEntryPath } from "@/lib/post-auth-entry";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    invite?: string;
    email?: string;
    resent?: string;
    signed_out?: string;
  }>;
}

const MAX_QUERY_ERROR_LEN = 512;
const MAX_INVITE_QUERY_LEN = 2048;
const MAX_EMAIL_QUERY_LEN = 320;

function clipQueryString(value: string | undefined, maxLen: number): string {
  if (!value) return "";
  const t = value.trim();
  if (!t) return "";
  return t.length > maxLen ? t.slice(0, maxLen) : t;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const queryError = clipQueryString(params.error, MAX_QUERY_ERROR_LEN);
  const inviteToken = clipQueryString(params.invite, MAX_INVITE_QUERY_LEN);
  const prefilledEmail = clipQueryString(params.email, MAX_EMAIL_QUERY_LEN);
  const resent = params.resent === "1";
  const signedOut = params.signed_out === "1";
  const year = new Date().getFullYear();

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
    // Ops-Admin (ADMIN_EMAILS / ADMIN_GITHUB_USERNAMES) may enter despite pending workspace.
    if (isAuthRelaxMode() || isAdminAllowlistUser(user) || !isBlockingAuthError(queryError)) {
      redirect(await resolveAuthenticatedEntryPath());
    }
  }

  return (
    <LoginPageClient
      queryError={queryError}
      resent={resent}
      signedOut={signedOut}
      inviteToken={inviteToken}
      prefilledEmail={prefilledEmail}
      year={year}
    />
  );
}
