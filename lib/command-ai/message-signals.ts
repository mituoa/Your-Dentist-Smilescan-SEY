/** Parsed communication intent from doctor voice/text — rule-based. */

export type MessageSignals = {
  wantsPhoto: boolean;
  wantsAppointment: boolean;
  wantsThisWeek: boolean;
  wantsTeamHandoff: boolean;
};

export function parseMessageSignals(rawText: string): MessageSignals {
  const t = rawText.toLowerCase();
  const wantsPhoto =
    (/(erneut|neues|neue|weiteres|zusätzlich|zusaetzlich|besser|neu)/.test(t) &&
      /(bild|foto|aufnahme|scan)/.test(t)) ||
    /(bild|foto).*(schick|send|anfordern|bitte)/.test(t);
  const wantsAppointment =
    /(termin|terminlink|einlad|kommen|reinkommen|praxis)/.test(t) ||
    /(link).*(termin|buch)/.test(t);
  const wantsThisWeek =
    /(diese woche|noch diese woche|innerhalb der woche|zeitnah|bald)/.test(t);
  const wantsTeamHandoff =
    /(durchgeb|weiterleit|informier|bescheid|mitgeben)/.test(t) &&
    /(rezeption|empfang|team|zfa|assistent|durchgeb|weiterleit)/.test(t);

  return {
    wantsPhoto,
    wantsAppointment: wantsAppointment || wantsThisWeek,
    wantsThisWeek,
    wantsTeamHandoff,
  };
}
