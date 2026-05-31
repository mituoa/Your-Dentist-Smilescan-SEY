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
    placeholder: "Was möchten Sie vorbereiten?",
    subtitle: "Was soll vorbereitet werden?",
    open: "Öffnen",
    quick: [
      { label: "Antwort vorbereiten", phrase: "Antwort vorbereiten" },
      { label: "Aufgabe erstellen", phrase: "Aufgabe erstellen" },
      { label: "Team informieren", phrase: "Team informieren" },
      { label: "Eingang zusammenfassen", phrase: "Eingang zusammenfassen" },
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
