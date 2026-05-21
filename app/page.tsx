import { redirect } from "next/navigation";

import { YdHomePage } from "@/components/marketing/yd-home-page";
import { isReturningPracticeVisitor } from "@/lib/public-entry/returning-visitor";
import {
  getCurrentUser,
  getWorkspaceMembershipForUserId,
  isAdminAllowlistUser,
} from "@/lib/auth-helpers";
import { ensureRelaxBootstrapWorkspace } from "@/lib/auth-relax-bootstrap";
import { isAuthRelaxMode } from "@/lib/auth-relax-mode";
import { requireEmailConfirmationBeforeApp, requireWorkspaceApprovalBeforeApp } from "@/lib/launch-guards";
import { findPendingInviteTokenByEmail } from "@/lib/team-invitations/find-pending-invite-token-by-email";

export const dynamic = "force-dynamic";

/** Öffentliche Produktübersicht; eingeloggte Nutzer → Workspace. */
interface HomePageProps {
  searchParams: Promise<{ plan?: string; invite?: string; email?: string; welcome?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const showWelcome = params.welcome === "1";
  const user = await getCurrentUser();

  if (user) {
    if (!user.email_confirmed_at && !isAuthRelaxMode() && requireEmailConfirmationBeforeApp()) {
      const p = new URLSearchParams();
      p.set("error", "email_not_confirmed");
      if (user.email) p.set("email", user.email);
      redirect(`/login?${p.toString()}`);
    }

    let workspace = await getWorkspaceMembershipForUserId(user.id);

    if (!workspace && isAuthRelaxMode()) {
      await ensureRelaxBootstrapWorkspace(user);
      workspace = await getWorkspaceMembershipForUserId(user.id);
    }

    if (!workspace) {
      const email = user.email?.trim();
      if (email) {
        try {
          const token = await findPendingInviteTokenByEmail(email);
          if (token) {
            redirect(`/accept-invite?token=${encodeURIComponent(token)}`);
          }
        } catch (e) {
          console.error("[HomePage] invite lookup failed:", e);
        }
      }
      redirect("/login?error=workspace_missing");
    }

    // @ts-expect-error — joined workspaces row
    const approvedAt = workspace.workspaces?.approved_at as string | null | undefined;
    if (
      requireWorkspaceApprovalBeforeApp() &&
      !approvedAt &&
      !(isAuthRelaxMode() || isAdminAllowlistUser(user))
    ) {
      redirect("/login?error=account_pending_approval");
    }

    const role = (workspace.role || "team") as "doctor" | "team";
    if (role === "doctor") {
      redirect("/dashboard");
    }
    redirect("/my-tasks");
  }

  if (!showWelcome && (await isReturningPracticeVisitor())) {
    const qs = new URLSearchParams();
    if (params.invite) qs.set("invite", String(params.invite));
    if (params.email) qs.set("email", String(params.email));
    const q = qs.toString();
    redirect(q ? `/login?${q}` : "/login");
  }

  return (
    <YdHomePage
      initialPlan={params.plan}
      inviteToken={params.invite}
      prefilledEmail={params.email}
    />
  );
}
