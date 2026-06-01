import {
  buildFollowUpDraft,
  buildRuckfrageDraftForSnippet,
  type UrgencyKey,
} from "@/lib/clinical/message-templates";

import type { MessageSignals } from "./message-signals";

export function buildCommandMessageDraft(params: {
  patientName: string;
  practicePhone: string;
  appointmentUrl: string | null;
  signals: MessageSignals;
}): string {
  const name = params.patientName.trim() || "Patient";
  const tel = params.practicePhone.trim() || "[Praxisnummer]";
  const link = params.appointmentUrl?.trim();
  const linkLine = link ? `Online-Termin: ${link}` : "Online-Termin: [Link einfügen]";

  const urgency: UrgencyKey = params.signals.wantsThisWeek
    ? "this_week"
    : params.signals.wantsAppointment
      ? "this_week"
      : "not_urgent";

  if (params.signals.wantsPhoto && !params.signals.wantsAppointment) {
    return buildRuckfrageDraftForSnippet("photo", {
      patientName: name,
      urgency,
      practicePhone: tel,
      appointmentUrl: params.appointmentUrl,
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

  if (params.signals.wantsAppointment || params.signals.wantsThisWeek) {
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
