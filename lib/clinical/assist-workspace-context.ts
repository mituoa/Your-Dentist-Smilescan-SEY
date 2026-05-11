/**
 * Kontext-Zonen für Command (Navigation + Schnelltexte, kein Auto-Versand).
 */

export type AssistZone =
  | "inbox"
  | "dashboard"
  | "relay"
  | "journal"
  | "settings"
  | "default";

export function detectAssistZone(pathname: string): AssistZone {
  if (pathname.startsWith("/inbox")) return "inbox";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/relay") || pathname.startsWith("/my-tasks")) return "relay";
  if (pathname.startsWith("/journal")) return "journal";
  if (pathname.startsWith("/settings") || pathname.startsWith("/admin")) return "settings";
  if (pathname.startsWith("/profile")) return "settings";
  return "default";
}

export type AssistContextQuick = {
  id: string;
  label: string;
  /** Vollständiger Text für das Textfeld (Entwurf). */
  template: string;
};

export function assistContextQuickActions(zone: AssistZone): AssistContextQuick[] {
  switch (zone) {
    case "inbox":
      return [
        {
          id: "inbox_triage",
          label: "Triage-Notiz",
          template:
            "Interne Triage-Notiz (kein Patientenversand):\n\n" +
            "• Dringlichkeit: heute / diese Woche / nicht dringend\n" +
            "• Kurzbegründung:\n" +
            "• Nächster Schritt (Termin / Rückfrage / Abwarten):\n",
        },
        {
          id: "inbox_prep",
          label: "Terminvorbereitung",
          template:
            "Vorbereitung Termin / Einladung:\n\n" +
            "• Welche Informationen fehlen noch beim Patienten?\n" +
            "• Welche Unterlagen soll mitgebracht werden?\n",
        },
        {
          id: "inbox_open",
          label: "Fall im Posteingang öffnen",
          template:
            "Bitte im **Posteingang** einen konkreten Fall öffnen — dort finden Sie **Entwürfe** zur Patienten-Rückmeldung und den **Terminlink** (alles nur nach Ihrer Prüfung, kein automatischer Versand).",
        },
      ];
    case "dashboard":
      return [
        {
          id: "dash_relay",
          label: "Aufgabe skizzieren",
          template:
            "Neue Relay-Aufgabe für das Team:\n\n" +
            "• Was soll erledigt werden?\n" +
            "• Bis wann?\n" +
            "• Wer ist zuständig?\n\n" +
            "[Bitte in Relay anlegen — kein automatischer Versand.]",
        },
        {
          id: "dash_case",
          label: "Fall anlegen",
          template:
            "Neuer Patientenfall — vor dem Anlegen prüfen:\n\n" +
            "• Patientenstammdaten vollständig?\n" +
            "• Dringlichkeit / Triage?\n\n" +
            "→ Über „Neuer Fall“ in der Kopfzeile anlegen.",
        },
        {
          id: "dash_inbox",
          label: "Zum Posteingang",
          template:
            "Kurzüberblick für den Posteingang:\n\n" +
            "• Ungelesene Einsendungen zuerst bearbeiten.\n" +
            "• Zeitraum setzen, dann Entwurf oder Terminlink vorbereiten.\n\n" +
            "→ Posteingang öffnen und Fall auswählen.",
        },
      ];
    case "relay":
      return [
        {
          id: "relay_delegate",
          label: "Delegation",
          template:
            "Bitte folgende Aufgabe übernehmen:\n\n" +
            "• Beschreibung:\n" +
            "• Frist:\n" +
            "• Rückfragen an:\n\n" +
            "[In Relay als Aufgabe anlegen — kein automatischer Versand.]",
        },
        {
          id: "relay_priority",
          label: "Priorität",
          template:
            "Priorität für die Aufgabe: hoch — bitte bis [Datum/Uhrzeit] bearbeiten.\n\n" +
            "Begründung:\n",
        },
        {
          id: "relay_team",
          label: "Teaminfo",
          template:
            "Info an das Team:\n\n" +
            "Betrifft: \n" +
            "Wichtig für: \n" +
            "Nächster Schritt: \n",
        },
      ];
    case "journal":
      return [
        {
          id: "jr_summary",
          label: "Kurzfassung",
          template:
            "Kurzfassung (Zielgruppe: Fachkolleg:innen / intern):\n\n" +
            "• Kernthese:\n" +
            "• Evidenz / Praxisbezug:\n" +
            "• Take-home:\n",
        },
        {
          id: "jr_outline",
          label: "Gliederung",
          template:
            "Gliederungsvorschlag:\n\n" +
            "1. Einleitung\n" +
            "2. Hintergrund\n" +
            "3. Klinische Relevanz\n" +
            "4. Fazit\n",
        },
        {
          id: "jr_clinical",
          label: "Notiz strukturieren",
          template:
            "Strukturierte medizinische Notiz:\n\n" +
            "Anamnese:\n" +
            "Befund:\n" +
            "Beurteilung:\n" +
            "Prozedere:\n",
        },
      ];
    case "settings":
      return [
        {
          id: "set_roles",
          label: "Rollen",
          template:
            "Rollen in der Praxis — Kurzüberblick:\n\n" +
            "• Arzt: voller Zugriff inkl. Atlas, Posteingang, Relay, Admin.\n" +
            "• Team: Relay & zugewiesene Bereiche.\n\n" +
            "Details unter Einstellungen → Benutzer / Admin.",
        },
        {
          id: "set_find",
          label: "Einstellung finden",
          template:
            "Ich suche in den Einstellungen nach:\n\n" +
            "[Stichwort eintragen]\n\n" +
            "Typische Bereiche: Praxisdaten, Terminlink, Benachrichtigungen, Team.",
        },
        {
          id: "set_practice",
          label: "Praxis-Konfig",
          template:
            "Checkliste Praxis-Konfiguration:\n\n" +
            "• Kontaktdaten & Öffnungszeiten aktuell?\n" +
            "• Online-Terminlink hinterlegt?\n" +
            "• Benachrichtigungen getestet?\n",
        },
      ];
    default:
      return [
        {
          id: "gen_tracker",
          label: "Zum Posteingang",
          template:
            "Für klinische Einsendungen und Triage bitte den **Posteingang** öffnen — dort liegen **Entwürfe** zur Patienten-Rückmeldung und der Terminlink (kein automatischer Versand).",
        },
        {
          id: "gen_relay",
          label: "Zu Relay",
          template:
            "Für Teamaufgaben und Delegation bitte Relay nutzen — Aufgaben dort anlegen und Priorität kommunizieren.",
        },
      ];
  }
}
