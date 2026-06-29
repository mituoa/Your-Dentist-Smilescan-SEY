import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { LoginPageClient } from "@/components/auth/login-page-client";
import { YdPublicOsEnvironment } from "@/components/marketing/yd-public-os-environment";
import { YdProductChrome } from "@/components/marketing/yd-product-chrome";
import { isGoogleLoginEnabled } from "@/lib/auth-google-login";
import { isBlockingAuthError } from "@/lib/auth-blocking-errors";
import { isAdminAllowlistUser } from "@/lib/auth-helpers";
import { isAuthRelaxMode } from "@/lib/auth-relax-mode";
import { createClient } from "@/lib/supabase/server";
import { resolveAuthenticatedEntryPath } from "@/lib/post-auth-entry";
import { markReturningPracticeVisitor } from "@/lib/public-entry/returning-visitor";
import { pathWithWorkspaceEnter } from "@/lib/design/yd-workspace-awakening";
import {
  clipInviteTokenQuery,
  isInviteTokenFormat,
} from "@/lib/team-invitations/invite-token-format";

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
  const inviteToken = clipInviteTokenQuery(params.invite);
  const prefilledEmail = clipQueryString(params.email, MAX_EMAIL_QUERY_LEN);
  const resent = params.resent === "1";
  const signedOut = params.signed_out === "1";
  const authFlowResetKey = [queryError, inviteToken, prefilledEmail, resent ? "1" : "0", signedOut ? "1" : "0"].join(
    "\u001f"
  );

  let user: User | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    user = u;
  } catch {
    console.error("[LoginPage] event=get_user_failed");
  }

  try {
    await markReturningPracticeVisitor();
  } catch {
    /* cookies() may throw outside request in edge cases — non-blocking */
  }

  if (user) {
    if (inviteToken && isInviteTokenFormat(inviteToken)) {
      redirect(`/accept-invite?token=${encodeURIComponent(inviteToken)}`);
    }
    // Ops-Admin (ADMIN_EMAILS / ADMIN_GITHUB_USERNAMES) may enter despite pending workspace.
    if (isAuthRelaxMode() || isAdminAllowlistUser(user) || !isBlockingAuthError(queryError)) {
      redirect(pathWithWorkspaceEnter(await resolveAuthenticatedEntryPath()));
    }
  }

  return (
    <YdPublicOsEnvironment mode="focus" scroll landingAtmosphere>
      <main className="yd-product-entry yd-login-page-entry">
        <YdProductChrome variant="entry" />
        <section className="yd-product-entry-card yd-clinical-entry--login yd-clinical-entry-panel--login-entrance">
          <LoginPageClient
            queryError={queryError}
            resent={resent}
            authFlowResetKey={authFlowResetKey}
            signedOut={signedOut}
            inviteToken={inviteToken}
            prefilledEmail={prefilledEmail}
            googleLoginEnabled={isGoogleLoginEnabled()}
          />
        </section>
      </main>
    </YdPublicOsEnvironment>
  );
}
