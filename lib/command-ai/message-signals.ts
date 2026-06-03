/** Parsed communication intent from doctor voice/text — rule-based. */

export type MessageSignals = {
  wantsPhoto: boolean;
  wantsAppointment: boolean;
  wantsThisWeek: boolean;
  wantsTeamHandoff: boolean;
  wantsCallback: boolean;
};

export function parseMessageSignals(rawText: string): MessageSignals {
  const t = rawText.toLowerCase();
  const wantsPhoto =
    (/(erneut|neues|neue|weiteres|zusätzlich|zusaetzlich|besser|neu)/.test(t) &&
      /(bild|foto|aufnahme|scan)/.test(t)) ||
    /(bild|foto).*(schick|send|anfordern|bitte)/.test(t) ||
    /(schärfer|scharfer|schaerfer|schärferes|schaerferes)/.test(t) ||
    /(besser|erneut|nochmal|wieder).*(foto|bild|aufnahme)/.test(t) ||
    /(mehr|besser).*(licht|beleuchtung)/.test(t) ||
    /(foto|bild).*(erneut|nochmal|wieder|neu|senden)/.test(t);
  const wantsAppointment =
    /(termin|terminlink|einlad|kommen|reinkommen|praxis|einbestellen)/.test(t) ||
    /(link).*(termin|buch)/.test(t) ||
    /(termin).*(anbieten|schicken|senden|geben)/.test(t);
  const wantsThisWeek =
    /(diese woche|noch diese woche|innerhalb der woche|zeitnah|bald)/.test(t);
  const wantsTeamHandoff =
    /(durchgeb|weiterleit|informier|bescheid|mitgeben)/.test(t) &&
    /(rezeption|empfang|team|zfa|assistent|durchgeb|weiterleit)/.test(t);
  const wantsCallback =
    /(rückruf|rueckruf).*(vorbereit|anlegen|erstellen|bitte)/.test(t) ||
    (/(empfang|rezeption|team)/.test(t) &&
      /(rückruf|rueckruf|zurückruf|zurueckruf|zurück|rueck)/.test(t)) ||
    (/(patient).*(zurückruf|rueckruf|rückruf)/.test(t) &&
      /(vorbereit|bitte|empfang)/.test(t));

  return {
    wantsPhoto,
    wantsAppointment: wantsAppointment || wantsThisWeek,
    wantsThisWeek,
    wantsTeamHandoff,
    wantsCallback,
  };
}

/** Submission-Kontext in Signale einfließen lassen (keine Diagnose). */
export function mergeSubmissionContextIntoSignals(
  signals: MessageSignals,
  context: {
    urgency: string | null;
    photoCount: number;
  }
): MessageSignals {
  const next = { ...signals };
  if (context.urgency === "today" || context.urgency === "this_week") {
    next.wantsThisWeek = next.wantsThisWeek || context.urgency === "this_week";
    next.wantsAppointment = next.wantsAppointment || true;
  }
  if (context.photoCount === 0 && !next.wantsAppointment) {
    next.wantsPhoto = next.wantsPhoto || false;
  }
  return next;
}
