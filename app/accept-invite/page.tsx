import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  findAuthUserIdByEmail,
  getInvitationByToken,
} from "@/lib/team-invitations/get-invitation-by-token";
import {
  AcceptInviteForm,
  type AcceptInviteScenario,
} from "./AcceptInviteForm";

interface AcceptInvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

type OtherMemberRow = {
  workspace_id: string;
  workspaces: { name: string } | { name: string }[] | null;
};

function workspaceNameJoined(
  w: OtherMemberRow["workspaces"]
): string {
  if (!w) return "Unbekannt";
  if (Array.isArray(w)) return w[0]?.name ?? "Unbekannt";
  return w.name ?? "Unbekannt";
}

export default async function AcceptInvitePage({
  searchParams,
}: AcceptInvitePageProps) {
  const { token: rawToken } = await searchParams;
  if (!rawToken?.trim()) redirect("/login");

  const token = rawToken.trim();
  const invite = await getInvitationByToken(token);

  if (!invite) {
    return (
      <AcceptInviteForm
        token={token}
        scenario="invalid"
        inviteEmail=""
        practiceName=""
        invalidReason="Einladung nicht gefunden oder Token ungültig."
      />
    );
  }

  const expired = new Date(invite.expiresAt) < new Date();
  const pending = invite.status === "pending";

  if (!pending) {
    return (
      <AcceptInviteForm
        token={token}
        scenario="invalid"
        inviteEmail={invite.email}
        practiceName={invite.workspaceName}
        invalidReason="Diese Einladung wurde bereits angenommen oder widerrufen."
      />
    );
  }

  if (expired) {
    return (
      <AcceptInviteForm
        token={token}
        scenario="invalid"
        inviteEmail={invite.email}
        practiceName={invite.workspaceName}
        invalidReason="Die Einladung ist abgelaufen."
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const invitedUserId = await findAuthUserIdByEmail(invite.email);

  let scenario: AcceptInviteScenario;
  let sessionEmail: string | undefined;
  let otherWorkspaceName: string | undefined;

  if (!user) {
    scenario = invitedUserId ? "B" : "A";
  } else {
    sessionEmail = user.email ?? "";
    if (!user.email || user.email.toLowerCase() !== invite.email.toLowerCase()) {
      scenario = "D";
    } else {
      const admin = createAdminClient();
      const { data: thisMember } = await admin
        .from("workspace_members")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("workspace_id", invite.workspaceId)
        .maybeSingle();

      if (thisMember) {
        scenario = "F";
      } else {
        const { data: other } = await admin
          .from("workspace_members")
          .select("workspace_id, workspaces(name)")
          .eq("user_id", user.id)
          .neq("workspace_id", invite.workspaceId)
          .limit(1)
          .maybeSingle();

        if (other) {
          scenario = "E";
          otherWorkspaceName = workspaceNameJoined(
            (other as OtherMemberRow).workspaces
          );
        } else {
          scenario = "C";
        }
      }
    }
  }

  return (
    <AcceptInviteForm
      token={token}
      scenario={scenario}
      inviteEmail={invite.email}
      practiceName={invite.workspaceName}
      sessionEmail={sessionEmail}
      otherWorkspaceName={otherWorkspaceName}
    />
  );
}
