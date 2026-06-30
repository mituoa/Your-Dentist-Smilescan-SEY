export type TaskRecipientType = "doctor_only" | "all_team" | "specific_person";

export type ResolvedTaskAssignment = {
  recipientType: TaskRecipientType;
  assignAllTeam: boolean;
  assignToMe: boolean;
  finalSpecificRecipientIds: string[];
  specificRecipientIdForRow: string | null;
};

/**
 * Normalisiert Zuweisung für neue Aufgaben — auch ohne eingeladene Teammitglieder.
 * „Gesamtes Team“ ohne weitere Mitglieder wird zu „Mir zuweisen“.
 */
export function resolveTaskCreateAssignment(input: {
  assignAllTeam: boolean;
  assignToMe: boolean;
  assignToDoctor: boolean;
  specificRecipientId: string | null;
  specificRecipientIds: string[];
  creatorUserId: string;
  otherMemberCount: number;
}): ResolvedTaskAssignment {
  let assignAllTeam = input.assignAllTeam;
  let assignToMe = input.assignToMe;
  const specificRecipientId = input.specificRecipientId?.trim() || null;
  const specificRecipientIds = [...input.specificRecipientIds];

  const hasExplicitRecipients =
    specificRecipientIds.length > 0 || Boolean(specificRecipientId);

  if (
    !input.assignToDoctor &&
    !assignToMe &&
    !assignAllTeam &&
    !hasExplicitRecipients
  ) {
    assignToMe = true;
  }

  if (assignAllTeam && input.otherMemberCount === 0) {
    assignAllTeam = false;
    assignToMe = true;
  }

  if (input.assignToDoctor) {
    return {
      recipientType: "doctor_only",
      assignAllTeam: false,
      assignToMe: false,
      finalSpecificRecipientIds: [],
      specificRecipientIdForRow: null,
    };
  }

  const recipientType: TaskRecipientType = assignAllTeam ? "all_team" : "specific_person";

  const normalizedSpecificRecipientIds =
    recipientType === "specific_person"
      ? specificRecipientIds.length > 0
        ? specificRecipientIds
        : specificRecipientId
          ? [specificRecipientId]
          : []
      : [];

  const finalSpecificRecipientIds = assignToMe
    ? Array.from(new Set([...normalizedSpecificRecipientIds, input.creatorUserId]))
    : normalizedSpecificRecipientIds;

  return {
    recipientType,
    assignAllTeam,
    assignToMe,
    finalSpecificRecipientIds,
    specificRecipientIdForRow: assignAllTeam
      ? null
      : finalSpecificRecipientIds[0] ?? specificRecipientId,
  };
}

/** Prüft nur Fremd-IDs — Ersteller:in ist immer gültig. */
export function recipientIdsRequiringMembershipCheck(
  recipientIds: string[],
  creatorUserId: string
): string[] {
  return recipientIds.filter((id) => id !== creatorUserId);
}
