import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { AssignableMember } from "@/lib/queries/team-members";
import { getAssignableWorkspaceMembers } from "@/lib/queries/team-members";

export type CommandAssignableMember = AssignableMember & {
  displayLabel: string;
  firstNameToken: string | null;
};

export type GroupRecipientHint =
  | "empfang"
  | "assistenz"
  | "team"
  | "implantologie"
  | null;

export type PersonAssigneeResolution =
  | { kind: "matched"; userId: string; label: string }
  | { kind: "ambiguous"; label: string }
  | { kind: "none" };

export async function getCommandAssignableMembers(
  workspaceId: string
): Promise<CommandAssignableMember[]> {
  const members = await getAssignableWorkspaceMembers(workspaceId);
  const admin = createAdminClient();
  const enriched: CommandAssignableMember[] = [];

  for (const member of members) {
    const { data } = await admin.auth.admin.getUserById(member.user_id);
    const meta = data?.user?.user_metadata as Record<string, unknown> | undefined;
    const displayName =
      typeof meta?.display_name === "string"
        ? meta.display_name.trim()
        : typeof meta?.full_name === "string"
          ? meta.full_name.trim()
          : "";
    const emailLocal = member.email.split("@")[0]?.toLowerCase() ?? "";
    const displayLabel = displayName || emailLocal || member.email;
    const firstNameToken =
      displayName.split(/\s+/)[0]?.toLowerCase() ||
      emailLocal.split(/[._-]/)[0]?.toLowerCase() ||
      null;

    enriched.push({
      ...member,
      displayLabel,
      firstNameToken,
    });
  }

  return enriched;
}

export function detectGroupRecipientHint(rawText: string): GroupRecipientHint {
  const t = rawText.toLowerCase();
  if (/(empfang|rezeption)/.test(t)) return "empfang";
  if (/(assistenz|zfa|dh\b)/.test(t)) return "assistenz";
  if (/(implantat|implantologie|implant)/.test(t)) return "implantologie";
  if (/\bteam\b/.test(t) && /(soll|bitte|prüfen|inform)/.test(t)) return "team";
  return null;
}

export function groupRecipientLabel(hint: GroupRecipientHint): string | null {
  switch (hint) {
    case "empfang":
      return "Empfang";
    case "assistenz":
      return "Assistenz";
    case "implantologie":
      return "Implantologie";
    case "team":
      return "Team";
    default:
      return null;
  }
}

export function resolvePersonAssignee(
  assigneeHint: string | null,
  members: CommandAssignableMember[]
): PersonAssigneeResolution {
  if (!assigneeHint?.trim()) return { kind: "none" };

  const hint = assigneeHint.trim().toLowerCase();
  const generic = new Set([
    "team",
    "empfang",
    "rezeption",
    "assistenz",
    "assistent",
    "assistentin",
    "zfa",
    "dh",
  ]);
  if (generic.has(hint)) return { kind: "none" };

  const matches = members.filter((m) => {
    const label = m.displayLabel.toLowerCase();
    const email = m.email.toLowerCase();
    const local = email.split("@")[0] ?? "";
    return (
      m.firstNameToken === hint ||
      label.startsWith(`${hint} `) ||
      label === hint ||
      local === hint ||
      local.startsWith(`${hint}.`) ||
      local.startsWith(`${hint}_`) ||
      email.startsWith(`${hint}@`)
    );
  });

  if (matches.length === 1) {
    return { kind: "matched", userId: matches[0]!.user_id, label: matches[0]!.displayLabel };
  }

  if (matches.length > 1) {
    const exact = matches.filter((m) => m.firstNameToken === hint);
    if (exact.length === 1) {
      return { kind: "matched", userId: exact[0]!.user_id, label: exact[0]!.displayLabel };
    }
    return { kind: "ambiguous", label: assigneeHint };
  }

  return { kind: "none" };
}
