import { section } from "@/lib/legal/section-builder";
import type { LegalDocument } from "@/lib/legal/types";

export const agbDocument: LegalDocument = {
  slug: "agb",
  title: "Allgemeine Geschäftsbedingungen",
  hubLabel: "Allgemeine Geschäftsbedingungen",
  hubDescription: "Vertragsrahmen für Praxiszugänge und kostenpflichtige Leistungen.",
  sections: [
    section("gegenstand", "1. Vertragsgegenstand", [
      "Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der Plattform Your Dentist durch Zahnarztpraxen und deren autorisierte Nutzerinnen und Nutzer.",
      "Your Dentist ist eine digitale Infrastrukturschicht für Praxen: strukturierte Patientenwege, Teamarbeit, Wissensbasis und assistierte Vorarbeit — ohne Ersatz ärztlicher Verantwortung.",
    ]),
    section("registrierung", "2. Registrierung und Praxisaccount", [
      "Die Registrierung richtet sich an Zahnarztpraxen und deren Vertretungsberechtigte. Angaben müssen wahrheitsgemäß und vollständig sein.",
      "Nach Prüfung der Unterlagen wird ein geschützter Praxisbereich freigeschaltet. Bis zur Freischaltung besteht kein Anspruch auf vollständigen Leistungszugang.",
    ]),
    section("rollen", "3. Benutzerrollen", [
      "Praxen können Rollen vergeben (z. B. ärztliche Leitung, Team). Jede Nutzerin und jeder Nutzer handelt im Rahmen der zugewiesenen Berechtigungen.",
      "Zugangsdaten sind vertraulich zu behandeln. Die Praxis ist für Handlungen ihrer Nutzerinnen und Nutzer verantwortlich, soweit diese im Rahmen des Accounts erfolgen.",
    ]),
    section("leistungen", "4. Leistungen von Your Dentist", [
      "Your Dentist stellt Module für Praxisarbeit bereit, darunter Atlas (Überblick), Tracker (Patientenfälle), Relay (Aufgaben und Team), Care Center (Praxiswissen), Command AI (assistierte Vorarbeit) sowie Landingpages und Kampagnen.",
      "Funktionsumfang und Verfügbarkeit können sich im Rahmen produktiver Weiterentwicklung ändern. Wesentliche Einschränkungen werden rechtzeitig kommuniziert.",
    ]),
    section("module", "5. Module im Überblick", [
      "Atlas: Prioritäten, Entscheidungen und Praxisstatus.",
      "Tracker: strukturierte Fälle, Einsendungen, Fotos und Verlauf.",
      "Relay: Aufgaben, Übergaben, Erinnerungen und Teamumsetzung.",
      "Care Center: patientenorientierte Inhalte und Nachsorge-Wissen der Praxis.",
      "Command AI: Entwürfe, Zusammenfassungen und Strukturierung — stets mit Freigabe durch die Praxis.",
      "Landingpages & Kampagnen: öffentliche Praxisauftritte und Einsendewege.",
      "Patientenportal: kommunikative und organisatorische Anbindung von Patient:innen an die Praxis.",
    ]),
    section("pflichten", "6. Pflichten der Praxis", [
      "Die Praxis nutzt Your Dentist nur im Rahmen geltenden Rechts, beruflicher Pflichten und dieser AGB.",
      "Inhalte, Freigaben und Kommunikation gegenüber Patient:innen liegen in der Verantwortung der Praxis. Uploads dürfen nur mit erforderlicher Rechtsgrundlage erfolgen.",
    ]),
    section("aerztliche-verantwortung", "7. Ärztliche Verantwortung und KI", [
      "Your Dentist trifft keine Diagnose, keine Therapieentscheidung und keinen automatischen Versand an Patient:innen ohne Freigabe der Praxis.",
      "KI-gestützte Funktionen dienen ausschließlich der Vorarbeit und Strukturierung. Ärztliche und organisatorische Entscheidungen verbleiben bei der Praxis.",
    ]),
    section("verfuegbarkeit", "8. Verfügbarkeit", [
      "Your Dentist wird mit branchenüblicher Sorgfalt betrieben. Wartungen, Updates oder höhere Gewalt können zu vorübergehenden Einschränkungen führen.",
      "Ein bestimmter Verfügbarkeitsgrad wird nur geschuldet, wenn er ausdrücklich vereinbart ist.",
    ]),
    section("preise", "9. Preise und Abrechnung", [
      "Preise und Abrechnungsintervalle ergeben sich aus der jeweils gültigen Preisübersicht zum Zeitpunkt der Registrierung bzw. Verlängerung.",
      "Preisänderungen werden rechtzeitig vor Wirksamwerden mitgeteilt. Gesetzliche Verbraucherrechte bleiben unberührt, soweit anwendbar.",
    ]),
    section("laufzeit", "10. Laufzeit und Kündigung", [
      "Vertragslaufzeit und Kündigungsfristen richten sich nach dem gewählten Tarif. Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.",
      "Nach Vertragsende werden Zugänge deaktiviert; gesetzliche Aufbewahrungspflichten und vereinbarte Datenlöschfristen bleiben bestehen.",
    ]),
    section("haftung", "11. Haftung", [
      "Your Dentist haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit.",
      "Bei leichter Fahrlässigkeit haftet Your Dentist nur bei Verletzung wesentlicher Vertragspflichten, begrenzt auf den vorhersehbaren, typischen Schaden.",
      "Eine Haftung für mittelbare Schäden, entgangenen Gewinn oder Datenverluste über die gesetzlichen Grenzen hinaus ist ausgeschlossen, soweit zulässig.",
    ]),
    section("datenschutz", "12. Datenschutz", [
      "Die Verarbeitung personenbezogener Daten richtet sich nach der Datenschutzerklärung und — soweit Patientendaten betroffen sind — der Patienten-Datenschutzerklärung.",
      "Auftragsverarbeitungsverträge werden bereitgestellt, soweit erforderlich.",
    ]),
    section("schluss", "13. Schlussbestimmungen", [
      "Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts, soweit zulässig.",
      "Gerichtsstand ist — soweit gesetzlich zulässig — der Sitz des Anbieters. Verbraucherrechtliche Zuständigkeiten bleiben unberührt.",
      "Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Regelungen unberührt.",
    ]),
  ],
};

export const nutzungsbedingungenDocument: LegalDocument = {
  slug: "nutzungsbedingungen",
  title: "Nutzungsbedingungen",
  hubLabel: "Nutzungsbedingungen",
  hubDescription: "Regeln für die Nutzung der Plattform, Module und Zugänge.",
  sections: [
    section("geltung", "1. Geltungsbereich", [
      "Diese Nutzungsbedingungen ergänzen die AGB und regeln das konkrete Nutzungsverhalten auf Your Dentist.",
      "Mit Registrierung oder Nutzung stimmen autorisierte Nutzerinnen und Nutzer diesen Bedingungen zu.",
    ]),
    section("zugang", "2. Zugang und Authentifizierung", [
      "Zugänge sind persönlich und nicht übertragbar. Mehrfaktor-Authentifizierung kann vorgeschrieben werden.",
      "Verdacht auf Missbrauch berechtigt zur Sperrung bis zur Klärung.",
    ]),
    section("module-nutzung", "3. Nutzung der Module", [
      "Module dürfen nur für den Praxiszweck genutzt werden. Automatisierte Zugriffe außerhalb dokumentierter Schnittstellen sind untersagt.",
      "Freigaben in Tracker, Relay und Command AI sind dokumentationsrelevante Praxishandlungen.",
    ]),
    section("inhalte", "4. Inhalte und Uploads", [
      "Hochgeladene Fotos, Nachrichten und Dokumente müssen zweckgebunden und rechtlich zulässig sein.",
      "Die Praxis stellt sicher, dass erforderliche Einwilligungen oder sonstige Rechtsgrundlagen vorliegen.",
    ]),
    section("ki", "5. KI-Funktionen", [
      "KI erstellt Entwürfe und Strukturvorschläge. Sie ersetzt keine fachliche Beurteilung.",
      "Automatischer Versand ohne Prüfung ist ausgeschlossen. Details siehe KI-Grundsätze.",
    ]),
    section("patienten", "6. Patientenportal", [
      "Patient:innen erhalten nur die Kommunikation und Informationen, die die Praxis freigegeben hat.",
      "Die Praxis informiert Patient:innen im erforderlichen Umfang über digitale Kanäle und Datenschutz.",
    ]),
    section("verboten", "7. Unzulässige Nutzung", [
      "Untersagt sind rechtswidrige Inhalte, Umgehung von Sicherheitsmechanismen, Reverse Engineering und Belastung der Infrastruktur über übliche Nutzung hinaus.",
      "Rechtswidrige Inhalte können gemeldet und entfernt werden (siehe „Rechtswidrige Inhalte melden“).",
    ]),
    section("widerruf", "8. Widerruf bei Verbraucher:innen", [
      "Sofern Verbraucherrecht Anwendung findet, gelten die gesetzlichen Widerrufsrechte. Einzelheiten werden bei Vertragsschluss gesondert mitgeteilt.",
    ]),
    section("aenderungen", "9. Änderungen", [
      "Your Dentist kann diese Nutzungsbedingungen anpassen. Wesentliche Änderungen werden mit angemessener Frist angekündigt.",
      "Bei Widerspruch kann das Vertragsverhältnis zum Änderungszeitpunkt beendet werden, soweit gesetzlich vorgesehen.",
    ]),
  ],
};
