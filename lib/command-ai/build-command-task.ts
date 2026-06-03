import { parseTaskFromVoice } from "./task-intent";
import {
  detectGroupRecipientHint,
  groupRecipientLabel,
  type GroupRecipientHint,
  type PersonAssigneeResolution,
} from "./task-assignee-resolve";
import { isImportantTaskPriority, resolveTaskDueDateFromText } from "./task-due-date";

export type CommandTaskRecipientPlan =
  | {
      recipientType: "specific_person";
      assigneeUserIds: string[];
      assignmentNote: null;
      groupLabel: null;
    }
  | {
      recipientType: "all_team";
      assigneeUserIds: [];
      assignmentNote: null;
      groupLabel: string;
    }
  | {
      recipientType: "doctor_only";
      assigneeUserIds: [];
      assignmentNote: string;
      groupLabel: string | null;
    };

export type CommandTaskPlan = {
  title: string;
  content: string;
  priority: "normal" | "important";
  dueDateIso: string | null;
  recipient: CommandTaskRecipientPlan;
  assignmentUnclear: boolean;
};

function refineTaskTitle(rawText: string, parsedTitle: string): string {
  const t = rawText.toLowerCase();
  if (/\bdvt\b/.test(t) && /(versend|schick|send|weiter)/.test(t)) {
    return "DVT versenden";
  }
  if (/(einbestellen|termin).*(diese woche|woche)/.test(t)) {
    return "Termin diese Woche abstimmen";
  }
  if (/(foto|bild).*(prüf)/.test(t)) {
    return "Foto prüfen";
  }
  if (/(zurückruf|rückruf)/.test(t)) {
    return "Rückruf vorbereiten";
  }
  if (parsedTitle.length > 3) return parsedTitle;
  const short = rawText.trim().slice(0, 80);
  return short.length > 0 ? short : "Aufgabe";
}

function buildRecipientPlan(
  rawText: string,
  person: PersonAssigneeResolution,
  groupHint: GroupRecipientHint
): CommandTaskRecipientPlan {
  if (person.kind === "matched") {
    return {
      recipientType: "specific_person",
      assigneeUserIds: [person.userId],
      assignmentNote: null,
      groupLabel: null,
    };
  }

  if (groupHint) {
    const label = groupRecipientLabel(groupHint) ?? "Team";
    return {
      recipientType: "all_team",
      assigneeUserIds: [],
      assignmentNote: null,
      groupLabel: label,
    };
  }

  const note =
    person.kind === "ambiguous"
      ? `Gewünschte Zuweisung „${person.label}“ — bitte prüfen.`
      : "Zuweisung bitte prüfen.";

  return {
    recipientType: "doctor_only",
    assigneeUserIds: [],
    assignmentNote: note,
    groupLabel: null,
  };
}

export function buildCommandTaskPlan(input: {
  rawText: string;
  patientName: string | null;
  patientNotes: string | null;
  personResolution: PersonAssigneeResolution;
}): CommandTaskPlan {
  const parsed = parseTaskFromVoice(input.rawText);
  const groupHint = detectGroupRecipientHint(input.rawText);
  const recipient = buildRecipientPlan(input.rawText, input.personResolution, groupHint);

  const due = resolveTaskDueDateFromText(input.rawText);
  const priority = isImportantTaskPriority(input.rawText) ? "important" : "normal";
  const title = refineTaskTitle(input.rawText, parsed.taskTitle);

  const patientLine = input.patientName?.trim()
    ? `Patient: ${input.patientName.trim()}`
    : null;
  const notesLine = input.patientNotes?.trim()
    ? `Anliegen (Auszug): ${input.patientNotes.trim().slice(0, 400)}${input.patientNotes.length > 400 ? "…" : ""}`
    : null;

  const assignmentLines: string[] = [];
  if (recipient.recipientType === "all_team" && recipient.groupLabel) {
    assignmentLines.push(`Gewünschte Gruppe: ${recipient.groupLabel}`);
  }
  if (recipient.assignmentNote) {
    assignmentLines.push(recipient.assignmentNote);
  }
  if (due.label && !due.dueDateIso) {
    assignmentLines.push(`Fälligkeit: ${due.label}`);
  } else if (due.label) {
    assignmentLines.push(`Fälligkeit: ${due.label}`);
  }

  const content = [
    patientLine,
    notesLine,
    "",
    `Befehl: ${input.rawText.trim()}`,
    ...assignmentLines,
    "",
    "(Erstellt über Command — organisatorische Aufgabe, keine automatische Patientennachricht.)",
  ]
    .filter((line) => line !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const assignmentUnclear =
    recipient.assignmentNote !== null || personResolutionKindUnclear(input.personResolution);

  return {
    title,
    content,
    priority,
    dueDateIso: due.dueDateIso,
    recipient,
    assignmentUnclear,
  };
}

function personResolutionKindUnclear(res: PersonAssigneeResolution): boolean {
  return res.kind === "ambiguous" || res.kind === "none";
}
