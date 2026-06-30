import type { Messages } from "./en";

export const de: Messages = {
  common: {
    language: "Sprache",
    or: "oder",
    signOut: "Abmelden",
    doctor: "Arzt",
    team: "Team",
  },
  login: {
    title: "Anmelden",
    lead: "Melden Sie sich mit Ihrem Praxiszugang an.",
    emailPlaceholder: "E-Mail-Adresse",
    forgotPassword: "Passwort vergessen?",
    submit: "Anmelden",
    submitPending: "Anmeldung…",
    password: "Passwort",
    showPassword: "Passwort anzeigen",
    hidePassword: "Passwort verbergen",
    google: "Mit Google anmelden",
    googlePending: "Weiter zu Google…",
    resendTitle: "Keine Bestätigungs‑E‑Mail erhalten?",
    resent: "Bestätigungs‑E‑Mail wurde erneut versendet. Bitte prüfen Sie auch den Spam‑Ordner.",
    privacy: "Datenschutz",
    imprint: "Impressum",
    errors: {
      accountPendingTitle: "Praxis wird geprüft",
      accountPendingBody:
        "Ihre Registrierung und Unterlagen werden validiert. Sobald Ihr Zugang freigeschaltet ist, können Sie sich anmelden.",
      workspaceMissingTitle: "Kein Praxiszugang gefunden",
      workspaceMissingBody:
        "Ihrem Benutzerkonto ist derzeit keine Praxis zugeordnet, oder eine Team-Einladung ist noch ausstehend. Bitte prüfen Sie Ihre E‑Mails auf eine Einladung oder wenden Sie sich an Ihre Praxis.",
      emailNotConfirmedTitle: "E‑Mail noch nicht bestätigt",
      emailNotConfirmedBody:
        "Bitte bestätigen Sie zuerst Ihre E‑Mail-Adresse. Wenn Sie keine Mail finden, können Sie sie erneut senden.",
      authCallbackTitle: "Link ungültig oder abgelaufen",
      authCallbackBody:
        "Bitte versuchen Sie es erneut oder lassen Sie sich eine neue Bestätigungs‑E‑Mail senden.",
      providerTitle: "Anmeldung mit diesem Anbieter nicht verfügbar",
      providerBody:
        "Der gewählte Anmelde‑Anbieter ist in Ihrer Umgebung noch nicht freigeschaltet. Bitte nutzen Sie E‑Mail und Passwort.",
      generic: "Die Anmeldung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.",
      invalidCredentials: "E-Mail oder Passwort ist ungültig.",
    },
  },
  settings: {
    language: {
      title: "Sprache",
      description:
        "Wählen Sie die Sprache für Menüs, Einstellungen und Systemhinweise in diesem Browser.",
      saved: "Sprache aktualisiert.",
      note: "Klinische Inhalte, Patientenfälle und Praxisdaten bleiben unverändert.",
      uiEnglish: "UI auf Englisch",
      partialActive:
        "Menüs und Einstellungen erscheinen auf Englisch. Ihre Praxisinhalte bleiben wie bisher.",
    },
    security: {
      title: "Sicherheit",
      description: "Passwort, Erscheinungsbild und Sitzung Ihres Kontos.",
      appearance: "Erscheinungsbild",
      light: "Hell",
      dark: "Dunkel",
      changePassword: "Passwort ändern",
      email: "E-Mail",
    },
    nav: {
      sprache: "Sprache",
      spracheHint: "Oberflächensprache",
    },
  },
  nav: {
    atlas: "Atlas",
    atlasDesc: "Praxisüberblick",
    tracker: "Tracker",
    trackerDesc: "Patientenfälle",
    relay: "Relay",
    relayDesc: "Aufgaben & Nachrichten",
    profile: "Profil",
    profileDesc: "Benutzer",
    careCenter: "Care Center",
    careCenterDesc: "Patientenwissen",
    admin: "Admin",
    adminDesc: "Einstellungen",
    closeNav: "Navigation schließen",
  },
};
