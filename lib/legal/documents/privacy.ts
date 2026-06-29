import { section } from "@/lib/legal/section-builder";
import type { LegalDocument } from "@/lib/legal/types";

export const datenschutzDocument: LegalDocument = {
  slug: "datenschutz",
  title: "Datenschutzerklärung",
  hubLabel: "Datenschutzerklärung",
  hubDescription: "Informationen zur Verarbeitung personenbezogener Daten (Praxis & Nutzer).",
  sections: [
    section("verantwortlicher", "1. Verantwortlicher", [
      "[Firmenname / Anbieter — Platzhalter] ist Verantwortlicher im Sinne der DSGVO für die Plattform Your Dentist.",
      "Kontakt Datenschutz: [datenschutz@your-dentist.de — Platzhalter]",
    ]),
    section("geltung", "2. Geltungsbereich", [
      "Diese Erklärung gilt für die Website, die Praxisanwendung und damit verbundene Dienste von Your Dentist.",
      "Für Patient:innen gelten ergänzend die Patienten-Datenschutzerklärung.",
    ]),
    section("datenarten", "3. Kategorien personenbezogener Daten", [
      "Stammdaten (Name, E-Mail, Rolle), Nutzungs- und Protokolldaten, Kommunikationsinhalte, Aufgaben- und Fallbezüge, ggf. Gesundheitsdaten in Einsendungen.",
      "Technische Daten: IP-Adresse, Geräteinformationen, Cookies (siehe Cookie-Richtlinie).",
    ]),
    section("gesundheit", "4. Gesundheits- und Patientendaten", [
      "Soweit Patient:innen Fotos, Beschwerden oder Verlaufsinformationen übermitteln, können besondere Kategorien personenbezogener Daten betroffen sein.",
      "Die Praxis ist in der Regel Verantwortliche für die Behandlung dieser Daten; Your Dentist verarbeitet sie als Auftragsverarbeiter, soweit vereinbart.",
    ]),
    section("praxis", "5. Praxisdaten", [
      "Praxisname, Standort, Öffnungszeiten, Teamstruktur, Abrechnungs- und Vertragsdaten zur Bereitstellung des Dienstes.",
    ]),
    section("konten", "6. Nutzerkonten", [
      "Authentifizierung über E-Mail/Passwort oder verbundene Identitätsanbieter. Sitzungs- und Sicherheitsprotokolle zum Schutz der Accounts.",
    ]),
    section("fotos", "7. Foto-Uploads und Dokumente", [
      "Uploads werden verschlüsselt übertragen und zweckgebunden gespeichert. Zugriff nur für autorisierte Rollen der jeweiligen Praxis.",
    ]),
    section("nachrichten", "8. Nachrichten und Aufgaben", [
      "Inhalte in Tracker, Relay und verwandten Modulen werden zur Erfüllung des Praxisworkflows verarbeitet.",
    ]),
    section("ki", "9. KI-Verarbeitung", [
      "KI-Funktionen verarbeiten Fallkontext zur Erstellung von Entwürfen. Es erfolgt keine automatische medizinische Entscheidung.",
      "Soweit externe Modellanbieter eingesetzt werden, erfolgt dies auf Grundlage von Auftragsverarbeitungsverträgen und Datenschutz-Folgenabschätzungen.",
    ]),
    section("hosting", "10. Hosting und Speicherort", [
      "Betrieb auf Infrastruktur in der EU bzw. dem EWR, soweit nicht einzeln anders dokumentiert.",
      "Subdienstleister werden vertraglich gebunden.",
    ]),
    section("dauer", "11. Speicherdauer", [
      "Daten werden nur so lange gespeichert, wie es für den Zweck erforderlich ist oder gesetzliche Pflichten bestehen.",
      "Löschkonzepte werden mit der Praxis abgestimmt, soweit Patientendaten betroffen sind.",
    ]),
    section("rechte", "12. Betroffenenrechte", [
      "Betroffene haben Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch und Datenübertragbarkeit im Rahmen der DSGVO.",
      "Beschwerden können bei einer Aufsichtsbehörde erhoben werden.",
    ]),
    section("av", "13. Auftragsverarbeiter", [
      "Your Dentist setzt Auftragsverarbeiter (Hosting, E-Mail, ggf. KI) ein. Eine aktuelle Liste wird auf Anfrage bereitgestellt.",
    ]),
    section("sicherheit", "14. Sicherheit", [
      "Technische und organisatorische Maßnahmen: Verschlüsselung in Transit, rollenbasierte Zugriffe, Protokollierung, Backups.",
    ]),
    section("kontakt", "15. Kontakt", [
      "Datenschutzanfragen: [datenschutz@your-dentist.de — Platzhalter]",
    ]),
  ],
};

export const patientenDatenschutzDocument: LegalDocument = {
  slug: "patienten-datenschutz",
  title: "Patienten-Datenschutzerklärung",
  hubLabel: "Patienten-Datenschutzerklärung",
  hubDescription: "Datenschutzinformationen für Patient:innen der Praxis.",
  sections: [
    section("einleitung", "1. Für wen gilt diese Information?", [
      "Diese Information richtet sich an Patient:innen, die Your Dentist über die jeweilige Zahnarztpraxis nutzen (z. B. Einsendungen, Rückfragen, Patientenportal).",
      "Verantwortliche für die Behandlung ist in der Regel Ihre Praxis; Your Dentist stellt die technische Plattform bereit.",
    ]),
    section("zwecke", "2. Zwecke der Verarbeitung", [
      "Entgegennahme von Anfragen und Fotos, strukturierte Bearbeitung durch das Praxisteam, Kommunikation mit Ihnen nach Freigabe durch die Praxis.",
    ]),
    section("daten", "3. Welche Daten verarbeitet werden", [
      "Kontaktdaten, Anfrageinhalte, ggf. Fotos der Mundhöhle/Behandlungsregion, Termin- und Verlaufsinformationen.",
    ]),
    section("rechtsgrundlagen", "4. Rechtsgrundlagen", [
      "Je nach Kontext: Einwilligung, Vertrag, berechtigte Interessen der Praxis oder gesetzliche Pflichten im Gesundheitsbereich.",
    ]),
    section("weitergabe", "5. Weitergabe", [
      "Zugriff haben autorisierte Mitarbeitende Ihrer Praxis. Technische Dienstleister handeln als Auftragsverarbeiter.",
    ]),
    section("speicherung", "6. Speicherdauer", [
      "Orientierung an medizinischen Aufbewahrungsfristen und den Vorgaben Ihrer Praxis.",
    ]),
    section("rechte", "7. Ihre Rechte", [
      "Sie können Rechte nach DSGVO gegenüber Ihrer Praxis geltend machen. Your Dentist unterstützt die Praxis technisch.",
    ]),
    section("kontakt", "8. Kontakt", [
      "Wenden Sie sich für patientenbezogene Anfragen zuerst an Ihre behandelnde Praxis.",
    ]),
  ],
};

export const cookiesDocument: LegalDocument = {
  slug: "cookies",
  title: "Cookie-Richtlinie",
  hubLabel: "Cookie-Richtlinie",
  hubDescription: "Cookies, lokale Speicherung und ähnliche Technologien.",
  sections: [
    section("was", "1. Was sind Cookies?", [
      "Cookies sind kleine Textdateien, die beim Besuch einer Website gespeichert werden können.",
    ]),
    section("welche", "2. Welche Technologien wir einsetzen", [
      "Notwendige Cookies/Sitzungen für Login und Sicherheit.",
      "Präferenz-Cookies (z. B. Darstellung), soweit aktiviert.",
      "Keine Werbe-Cookies Dritter im Praxisbereich.",
    ]),
    section("steuerung", "3. Steuerung", [
      "Browser-Einstellungen erlauben das Löschen oder Blockieren von Cookies. Notwendige Cookies sind für den Betrieb erforderlich.",
    ]),
    section("dauer", "4. Speicherdauer", [
      "Sitzungs-Cookies bis Logout; persistente Cookies gemäß jeweiliger Angabe in der Einwilligungsverwaltung.",
    ]),
    section("kontakt", "5. Kontakt", [
      "Fragen: [datenschutz@your-dentist.de — Platzhalter]",
    ]),
  ],
};
