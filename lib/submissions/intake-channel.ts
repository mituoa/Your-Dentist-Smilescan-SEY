/**
 * Eingangskanal-Klassifikation für Submissions (Tracker, Detail, spätere Filter).
 */

export const INTAKE_CHANNEL_VALUES = [
  "patient_upload",
  "practice_manual",
  "follow_up",
  "recall",
  "unknown",
] as const;

export type IntakeChannel = (typeof INTAKE_CHANNEL_VALUES)[number];

export const INTAKE_CHANNEL_PATIENT_UPLOAD = "patient_upload" as const;
export const INTAKE_CHANNEL_PRACTICE_MANUAL = "practice_manual" as const;

export function isIntakeChannel(value: string): value is IntakeChannel {
  return (INTAKE_CHANNEL_VALUES as readonly string[]).includes(value);
}

export function normalizeIntakeChannel(value: unknown): IntakeChannel {
  if (typeof value === "string" && isIntakeChannel(value)) {
    return value;
  }
  return "unknown";
}

export function getIntakeChannelLabel(channel: IntakeChannel): string {
  switch (channel) {
    case "patient_upload":
      return "Patienteneingang";
    case "practice_manual":
      return "Praxisfall";
    case "follow_up":
      return "Nachsorge";
    case "recall":
      return "Recall";
    case "unknown":
    default:
      return "Unklar";
  }
}

export type IntakeChannelBadgeVariant =
  | "patient"
  | "practice"
  | "follow_up"
  | "recall"
  | "unknown";

export function intakeChannelBadgeVariant(
  channel: IntakeChannel
): IntakeChannelBadgeVariant {
  switch (channel) {
    case "patient_upload":
      return "patient";
    case "practice_manual":
      return "practice";
    case "follow_up":
      return "follow_up";
    case "recall":
      return "recall";
    default:
      return "unknown";
  }
}
