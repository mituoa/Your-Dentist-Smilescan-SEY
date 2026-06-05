/** Parsed communication intent from doctor voice/text — rule-based. */

export type MessageSignals = {
  wantsPhoto: boolean;
  wantsAppointment: boolean;
  wantsThisWeek: boolean;
  wantsToday: boolean;
  wantsRuckfrage: boolean;
  wantsWatch: boolean;
  wantsTeamHandoff: boolean;
  wantsCallback: boolean;
  ruckfrageTopicId?: string | null;
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
  const wantsToday =
    /(noch heute|heute noch|termin heute|heute einen termin|heute kurzfristig)/.test(t);
  const wantsThisWeek =
    /(diese woche|noch diese woche|innerhalb der woche|zeitnah|bald)/.test(t);
  const wantsWatch =
    /(beobachten|beobachtung|abwarten)/.test(t) ||
    /(verschlechterung|schlechter).*(termin|melden)/.test(t);
  const wantsRuckfrage =
    /(nach|wegen|bezüglich).*(fieber|temperatur|schmerz|schwellung|medikament)/.test(t) ||
    /(fragen|nachfragen|rückfrage).*(fieber|temperatur|schmerz|schwellung)/.test(t) ||
    /bitte.*(fragen|nachfragen)/.test(t);

  let ruckfrageTopicId: string | null = null;
  if (/fieber|temperatur/.test(t)) ruckfrageTopicId = "fever";
  else if (/schwell/.test(t)) ruckfrageTopicId = "swelling";
  else if (/schmerz|weh/.test(t)) ruckfrageTopicId = "pain";
  else if (/medikament/.test(t)) ruckfrageTopicId = "meds";
  else if (/seit wann|dauer|verlauf/.test(t)) ruckfrageTopicId = "course";
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
    wantsAppointment: wantsAppointment || wantsThisWeek || wantsToday,
    wantsThisWeek,
    wantsToday,
    wantsRuckfrage,
    wantsWatch,
    wantsTeamHandoff,
    wantsCallback,
    ruckfrageTopicId,
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
  if (context.urgency === "today") {
    next.wantsToday = next.wantsToday || true;
    next.wantsAppointment = next.wantsAppointment || true;
  }
  if (context.urgency === "this_week") {
    next.wantsThisWeek = next.wantsThisWeek || true;
    next.wantsAppointment = next.wantsAppointment || true;
  }
  if (context.photoCount === 0 && !next.wantsAppointment) {
    next.wantsPhoto = next.wantsPhoto || false;
  }
  return next;
}
