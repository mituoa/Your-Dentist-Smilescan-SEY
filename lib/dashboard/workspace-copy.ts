/**
 * In-App-Copy — kurz, operativ, kein SaaS-Erklärtext.
 */

export const WORKSPACE_COPY = {
  today: "Heute",
  allCurrent: "Alles aktuell",
  allDone: "Alles erledigt",
  loadGap: "—",

  intake: {
    title: "Eingänge",
    empty: "Alles aktuell",
    new: "Neu",
    seen: "Gesehen",
    recent: "Zuletzt",
  },

  relay: {
    title: "Relay",
    team: "Relay · Team",
    quiet: "Keine offenen Übergaben",
    open: "Rückfragen offen",
    teamCurrent: "Team aktuell",
  },

  tasks: {
    title: "Aufgaben",
    empty: "Alles erledigt",
    oneOpen: "1 offen",
    routinesEmpty: "Keine Routine offen",
  },

  activity: {
    title: "Aktivität",
    empty: "Noch nichts heute",
    showAll: "Alle",
    showLess: "Weniger",
  },

  command: {
    placeholder: "Was soll erledigt werden?",
    open: "Öffnen",
    quick: [
      { label: "Termin senden", phrase: "Termin senden" },
      { label: "Patient informieren", phrase: "Patient informieren" },
      { label: "Aufgabe erstellen", phrase: "Aufgabe erstellen" },
      { label: "Team erinnern", phrase: "Team erinnern" },
    ] as const,
  },

  flow: {
    intake: "Eingänge",
    tasks: "Aufgaben",
    relay: "Relay",
    routines: "Routinen",
    reminders: "Erinnerungen",
    steady: "ruhig",
    stand: "auf Stand",
  },
} as const;
