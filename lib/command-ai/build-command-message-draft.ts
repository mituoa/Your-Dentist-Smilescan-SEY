import {
  buildFollowUpDraft,
  buildRuckfrageDraftForSnippet,
  type UrgencyKey,
} from "@/lib/clinical/message-templates";

import type { CommandReplyIntent } from "./reply-intent";
import type { MessageSignals } from "./message-signals";

/** Eingabe für reine Textgenerierung (ohne DB). Persistenz: {@link persistCommandMessageDraft}. */
export type CommandMessageDraftParams = {
  patientName: string;
  practicePhone: string;
  appointmentUrl: string | null;
  signals: MessageSignals;
  replyIntent?: CommandReplyIntent;
  submissionUrgency?: UrgencyKey;
};

function buildCallbackPrepareDraft(params: {
  patientName: string;
  practicePhone: string;
}): string {
  const name = params.patientName.trim() || "Patient";
  const tel = params.practicePhone.trim() || "[Praxisnummer]";
  return (
    `Sehr geehrte/r ${name},\n\n` +
    `vielen Dank für Ihre Einsendung. Für eine persönliche Einordnung Ihres Anliegens wird sich unser Praxisteam in Kürze telefonisch bei Ihnen melden.\n\n` +
    `Sie erreichen uns unter ${tel}.\n\n` +
    `Mit freundlichen Grüßen\n` +
    `Ihr Praxisteam`
  );
}

function buildPhotoRequestDraft(params: {
  patientName: string;
  practicePhone: string;
  appointmentUrl: string | null;
  urgency: UrgencyKey;
}): string {
  const base = buildRuckfrageDraftForSnippet("photo", {
    patientName: params.patientName,
    urgency: params.urgency,
    practicePhone: params.practicePhone,
    appointmentUrl: params.appointmentUrl,
  });
  const extra =
    "Bitte fotografieren Sie den betroffenen Bereich bei guter, gleichmäßiger Beleuchtung (möglichst ohne Blitzreflexe) und senden Sie uns die Aufnahme erneut zu.";
  if (base.includes(extra.slice(0, 40))) return base;
  const name = params.patientName.trim() || "Patient";
  const tel = params.practicePhone.trim() || "[Praxisnummer]";
  return (
    `Sehr geehrte/r ${name},\n\n` +
    `vielen Dank für Ihre Einsendung. Für eine bessere klinische Einschätzung bitten wir Sie um eine erneute Aufnahme:\n\n` +
    `${extra}\n\n` +
    `Sie erreichen uns bei Rückfragen unter ${tel}.\n\n` +
    `Mit freundlichen Grüßen\n` +
    `Ihr Praxisteam`
  );
}

export function buildCommandMessageDraft(params: CommandMessageDraftParams): string {
  const name = params.patientName.trim() || "Patient";
  const tel = params.practicePhone.trim() || "[Praxisnummer]";
  const link = params.appointmentUrl?.trim();
  const linkLine = link ? `Online-Termin: ${link}` : "Online-Termin: [Link einfügen]";
  const replyIntent = params.replyIntent;

  const urgency: UrgencyKey = params.signals.wantsThisWeek
    ? "this_week"
    : params.submissionUrgency === "today"
      ? "today"
      : params.submissionUrgency === "this_week"
        ? "this_week"
        : params.signals.wantsAppointment
          ? "this_week"
          : params.submissionUrgency ?? "not_urgent";

  if (replyIntent === "prepare_callback" || params.signals.wantsCallback) {
    return buildCallbackPrepareDraft({ patientName: name, practicePhone: tel });
  }

  if (replyIntent === "request_photo" || (params.signals.wantsPhoto && !params.signals.wantsAppointment)) {
    return buildPhotoRequestDraft({
      patientName: name,
      practicePhone: tel,
      appointmentUrl: params.appointmentUrl,
      urgency,
    });
  }

  if (params.signals.wantsPhoto && params.signals.wantsAppointment) {
    const photoBlock = buildRuckfrageDraftForSnippet("photo", {
      patientName: name,
      urgency,
      practicePhone: tel,
      appointmentUrl: null,
    });
    const inviteBlock = buildFollowUpDraft({
      patientName: name,
      urgency: "this_week",
      practicePhone: tel,
      appointmentUrl: params.appointmentUrl,
    });
    const photoCore = photoBlock.split("\n\n").slice(2, -2).join("\n\n");
    return (
      `Sehr geehrte/r ${name},\n\n` +
      `vielen Dank für Ihre Einsendung. Wir möchten Sie innerhalb der nächsten Tage zur Klärung in die Praxis einladen.\n\n` +
      `${photoCore}\n\n` +
      `Gerne können Sie auch direkt einen Termin wählen:\n${linkLine}\n\n` +
      `Bei Rückfragen erreichen Sie uns unter ${tel}.\n\n` +
      `Mit freundlichen Grüßen\n` +
      `Ihr Praxisteam`
    );
  }

  if (
    replyIntent === "offer_appointment" ||
    params.signals.wantsAppointment ||
    params.signals.wantsThisWeek
  ) {
    return buildFollowUpDraft({
      patientName: name,
      urgency: params.signals.wantsThisWeek ? "this_week" : urgency,
      practicePhone: tel,
      appointmentUrl: params.appointmentUrl,
    });
  }

  return buildFollowUpDraft({
    patientName: name,
    urgency,
    practicePhone: tel,
    appointmentUrl: params.appointmentUrl,
  });
}
