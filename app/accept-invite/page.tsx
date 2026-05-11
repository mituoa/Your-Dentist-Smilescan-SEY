import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { workspaceRoleToHomePath } from "@/lib/auth-app-home";
import {
  findAuthUserIdByEmail,
  getInvitationByToken,
} from "@/lib/team-invitations/get-invitation-by-token";
import {
  AcceptInviteForm,
  type AcceptInviteScenario,
} from "./AcceptInviteForm";

/**
 * Team-Einladung annehmen (Pilot-/Enterprise-Vertrag)
 *
 * **Zweck (nur Lesen + Szenario):** Einladung per Token aus `team_invitations` laden, fristig/Status prüfen,
 * Nutzerkontext (Session, E-Mail, bestehende Memberships) auswerten — dann **eine** passende Oberfläche
 * (`AcceptInviteForm`). Es wird **kein** Workspace-Join und **kein** Invite-Verbrauch auf dieser Seite ausgeführt;
 * das passiert ausschließlich serverseitig in {@link acceptInvitation} beim expliziten Klick „Einladung annehmen“
 * (Szenario **C**).
 *
 * **Szenarien (Kurzcodes = stabile Props):**
 * - **invalid** — ungültiger Link, abgelaufen, oder nicht mehr `pending` (kein Join).
 * - **A** — nicht eingeloggt, noch kein Auth-Konto zur Einladungs-E-Mail → Registrierung.
 * - **B** — nicht eingeloggt, Konto existiert → Login mit Invite-Kontext.
 * - **C** — eingeloggt, E-Mail passt, noch kein Mitglied dieser Praxis, sonst nirgends Mitglied → **einziger Join-Pfad**.
 * - **D** — eingeloggt, andere E-Mail → Abmelden, dann mit richtiger E-Mail erneut öffnen.
 * - **E** — eingeloggt, E-Mail passt, aber bereits anderem Workspace zugeordnet (Single-Workspace-Politik).
 * - **F** — bereits Mitglied dieses Workspaces → ruhiger Erfolg, **kein** erneutes `acceptInvitation`.
 *
 * Bewusst **nicht** hier: Marketing, SSO/MFA, Onboarding-Wizard, freie Redirect-Ziele — nur kontrollierte Links
 * zu Login/Register mit Invite-Query.
 */

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
        invalidReason="Diese Einladung wurde nicht gefunden oder der Link ist ungültig."
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
      inviteHomePath={scenario === "F" ? workspaceRoleToHomePath(invite.role) : undefined}
    />
  );
}
