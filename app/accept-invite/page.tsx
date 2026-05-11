import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { workspaceRoleToHomePath } from "@/lib/auth-app-home";
import {
  findAuthUserIdByEmail,
  getInvitationByToken,
} from "@/lib/team-invitations/get-invitation-by-token";
import {
  clipInviteTokenQuery,
  isInviteTokenFormat,
} from "@/lib/team-invitations/invite-token-format";
import {
  AcceptInviteForm,
  type AcceptInviteScenario,
} from "./AcceptInviteForm";

/**
 * Team-Einladung annehmen (MVP/Pilot — kontrollierter Zugang ohne separates Onboarding)
 *
 * **Zweck (nur Lesen + Szenario):** Einladung per Token aus `team_invitations` laden, fristig/Status prüfen,
 * Nutzerkontext (Session, E-Mail, bestehende Memberships) auswerten — dann **eine** passende Oberfläche
 * (`AcceptInviteForm`). Es wird **kein** Workspace-Join und **kein** Invite-Verbrauch auf dieser Seite ausgeführt;
 * das passiert ausschließlich serverseitig in {@link acceptInvitation} beim expliziten Klick „Einladung annehmen“
 * (Szenario **C**).
 *
 * **Szenarien (Kurzcodes = stabile Props):**
 * - **invalid** — fehlender/beschädigter Link, nicht gefunden, abgelaufen, nicht mehr `pending` (kein Join); teils ruhiger Neutral-Ton.
 * - **A** — nicht eingeloggt, noch kein Auth-Konto zur Einladungs-E-Mail → Registrierung.
 * - **B** — nicht eingeloggt, Konto existiert → Login mit Invite-Kontext.
 * - **C** — eingeloggt, E-Mail passt, noch kein Mitglied dieser Praxis, sonst nirgends Mitglied → **einziger Join-Pfad**.
 * - **D** — eingeloggt, andere E-Mail → Abmelden, dann mit richtiger E-Mail erneut öffnen.
 * - **E** — eingeloggt, E-Mail passt, aber bereits anderem Workspace zugeordnet (Single-Workspace-Politik).
 * - **F** — bereits Mitglied dieses Workspaces → ruhiger Erfolg, **kein** erneutes `acceptInvitation`.
 *
 * Bewusst **nicht** hier: Marketing, SSO/MFA, Onboarding-Wizard, freie Redirect-Ziele — nur kontrollierte Links
 * zu Login/Register mit Invite-Query.
 *
 * **Nice (später, klein):** E2E-/Smoke-Tests über Szenario-Matrix; feine Metriken (Öffnung vs. erfolgreicher Join);
 * Runbook für Pilot; kleine Copy-/A11y-Polishs; Monitoring-Alerts ohne PII.
 *
 * **Future (eher app-/infra-weit, nicht nur diese Route):** Admin-Oberfläche für Invites, Reminder/Resend,
 * erweiterte Rollen, Audit-Trails, SSO/Enterprise-Policies, Primary-Workspace-Regeln, Invite-Analytics.
 *
 * **Non-MVP (hier nicht einbauen):** mehrstufige Onboarding-Wizards, Marketing-Invite-Seiten, unkontrollierte
 * Redirect-Ketten, Multi-Step-Einladungsdialoge, sichtbare „Security“-Banner, Gamification / „Team growth“-UX.
 *
 * **Priorität (Punkt 13):** Für Pilot/Demo mit Einladungslinks ist dieser Flow **P0** — ohne funktionierenden
 * Join kein zuverlässiges **Team-Onboarding** und kein **Workspace-Zugang**. Reihenfolge bei Änderungen bewusst
 * denken: (1) **falscher Workspace-Zugang verhindern** / **Invite-Sicherheit**, (2) **E-Mail-Mismatch** /
 * **Join-Race**, (3) **Mobile/Mail-App-Erlebnis**, (4) **Medical-/Enterprise-Glaubwürdigkeit** (Copy, Ruhe).
 * Produktkritische Regressionen: Join ohne passende Session, Einladung für falsche E-Mail einlösbar,
 * `acceptInvitation`-Status-/Ablauf-Logik aushebelbar, `return_to`/Invite-Token-Redirects aufgelockert.
 * **Vor Pilot manuell:** Szenarien A–F + invalid + abgelaufen + parallel zweiter Tab + Link aus In-App-Browser.
 * **Abgeschlossen:** Kein weiteres Feature-Engineering nötig — nur noch **Bugfixes/Security** und **QA/Doku**.
 * **Stabil halten:** Änderungen nur noch minimal und bewusst; große Refactors ohne Not vermeiden.
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
  const raw = clipInviteTokenQuery(rawToken);

  if (!raw) {
    return (
      <AcceptInviteForm
        token=""
        scenario="invalid"
        inviteEmail=""
        practiceName=""
        invalidTone="neutral"
        invalidTitle="Einladung aus der E-Mail öffnen"
        invalidReason="Diese Seite wird über den persönlichen Link in Ihrer Einladungs-E-Mail geöffnet. Ohne diesen Link können wir keine Einladung zuordnen."
      />
    );
  }

  const token = raw;

  if (!isInviteTokenFormat(token)) {
    return (
      <AcceptInviteForm
        token={token}
        scenario="invalid"
        inviteEmail=""
        practiceName=""
        invalidTone="neutral"
        invalidTitle="Einladungslink unvollständig"
        invalidReason="Der Link ist beschädigt oder unvollständig — bitte öffnen Sie ihn direkt aus der Einladungs-E-Mail. Ein manuelles Abtippen führt oft zu Fehlern."
      />
    );
  }

  const invite = await getInvitationByToken(token);

  if (!invite) {
    return (
      <AcceptInviteForm
        token={token}
        scenario="invalid"
        inviteEmail=""
        practiceName=""
        invalidReason="Zu diesem Link finden wir keine aktive Einladung. Sie wurde möglicherweise bereits verwendet oder durch eine neue ersetzt."
      />
    );
  }

  const inviteEmail = invite.email.trim();
  if (!inviteEmail) {
    return (
      <AcceptInviteForm
        token={token}
        scenario="invalid"
        inviteEmail=""
        practiceName={invite.workspaceName}
        invalidReason="Die gespeicherten Einladungsdaten sind unvollständig. Bitte wenden Sie sich an die einladende Praxis."
      />
    );
  }

  const expired = new Date(invite.expiresAt) < new Date();
  const pending = invite.status === "pending";

  if (expired) {
    return (
      <AcceptInviteForm
        token={token}
        scenario="invalid"
        inviteEmail={inviteEmail}
        practiceName={invite.workspaceName}
        invalidReason="Die Frist dieser Einladung ist abgelaufen. Für einen neuen Zugang wenden Sie sich bitte an die einladende Praxis."
      />
    );
  }

  if (!pending) {
    let invalidReason: string;
    if (invite.status === "accepted") {
      invalidReason =
        "Diese Einladung wurde bereits angenommen. Melden Sie sich mit dem passenden Konto an, um fortzufahren.";
    } else if (invite.status === "revoked") {
      invalidReason =
        "Diese Einladung wurde widerrufen. Bitte wenden Sie sich an die einladende Praxis, wenn Sie weiterhin Zugang benötigen.";
    } else if (invite.status === "expired") {
      invalidReason =
        "Diese Einladung ist nicht mehr gültig (abgelaufen). Bitte fordern Sie bei Bedarf eine neue Einladung an.";
    } else {
      invalidReason = "Diese Einladung ist nicht mehr aktiv.";
    }
    return (
      <AcceptInviteForm
        token={token}
        scenario="invalid"
        inviteEmail={inviteEmail}
        practiceName={invite.workspaceName}
        invalidReason={invalidReason}
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const invitedUserId = await findAuthUserIdByEmail(inviteEmail);

  let scenario: AcceptInviteScenario;
  let sessionEmail: string | undefined;
  let otherWorkspaceName: string | undefined;

  if (!user) {
    scenario = invitedUserId ? "B" : "A";
  } else {
    sessionEmail = user.email ?? "";
    if (!user.email || user.email.toLowerCase() !== inviteEmail.toLowerCase()) {
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
      inviteEmail={inviteEmail}
      practiceName={invite.workspaceName}
      sessionEmail={sessionEmail}
      otherWorkspaceName={otherWorkspaceName}
      inviteHomePath={scenario === "F" ? workspaceRoleToHomePath(invite.role) : undefined}
    />
  );
}
