import { section } from "@/lib/legal/section-builder";
import type { LegalDocument } from "@/lib/legal/types";

export const impressumDocument: LegalDocument = {
  slug: "impressum",
  title: "Impressum",
  hubLabel: "Impressum",
  hubDescription: "Anbieterkennzeichnung nach TMG / DDG.",
  sections: [
    section("anbieter", "Anbieter", [
      "[Firmenname — Platzhalter]",
      "[Straße, Hausnummer — Platzhalter]",
      "[PLZ Ort — Platzhalter]",
      "Deutschland",
    ]),
    section("kontakt", "Kontakt", [
      "Telefon: [Platzhalter]",
      "E-Mail: [kontakt@your-dentist.de — Platzhalter]",
    ]),
    section("vertretung", "Vertretungsberechtigt", [
      "[Name, Funktion — Platzhalter]",
    ]),
    section("register", "Registereintrag", [
      "Registergericht: [Platzhalter]",
      "Registernummer: [Platzhalter]",
    ]),
    section("ust", "Umsatzsteuer", [
      "USt-IdNr.: [Platzhalter], sofern vorhanden",
    ]),
    section("aufsicht", "Berufsrechtliche Angaben", [
      "Sofern einschlägig: zuständige Kammer und berufsrechtliche Regelungen [Platzhalter].",
    ]),
    section("streit", "Streitbeilegung", [
      "Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: https://ec.europa.eu/consumers/odr/",
      "Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen, sofern nicht gesetzlich anders vorgeschrieben.",
    ]),
  ],
};

export const kiGrundsaetzeDocument: LegalDocument = {
  slug: "ki-grundsaetze",
  title: "KI-Grundsätze",
  hubLabel: "KI-Grundsätze",
  hubDescription: "Leitplanken für Command AI und assistierte Funktionen.",
  sections: [
    section("rolle", "1. Rolle der KI", [
      "KI in Your Dentist unterstützt — sie entscheidet nicht. Command AI bereitet vor, strukturiert und entwirft.",
    ]),
    section("keine-diagnose", "2. Keine Diagnose", [
      "KI stellt keine Diagnosen und keine Therapieempfehlungen im medizinischen Sinne.",
    ]),
    section("keine-entscheidung", "3. Keine automatische medizinische Entscheidung", [
      "Therapie-, Medikations- oder Behandlungsentscheidungen verbleiben bei der Praxis.",
    ]),
    section("verantwortung", "4. Verantwortung der Praxis", [
      "Ärztliche und organisatorische Verantwortung liegt bei der behandelnden Praxis und den freigebenden Personen.",
    ]),
    section("freigabe", "5. Freigabe vor Versand", [
      "Antworten an Patient:innen werden erst nach Prüfung und Freigabe versendet.",
    ]),
    section("unsicherheit", "6. Unsicherheit", [
      "Bei Unsicherheit verweist das System auf Rückfragen an die Praxis statt auf automatische Antworten.",
    ]),
    section("zweck", "7. Zweck", [
      "KI dient Strukturierung, Entwurf, Zusammenfassung und Entlastung — nicht dem Ersatz menschlicher Beurteilung.",
    ]),
    section("transparenz", "8. Transparenz", [
      "Assistenz durch KI wird in der Produktnutzung erkennbar gemacht, soweit für die Praxis relevant.",
    ]),
  ],
};

export const meldenDocument: LegalDocument = {
  slug: "melden",
  title: "Rechtswidrige Inhalte melden",
  hubLabel: "Rechtswidrige Inhalte melden",
  hubDescription: "Meldewege bei Verstößen und missbräuchlicher Nutzung.",
  sections: [
    section("zweck", "1. Zweck", [
      "Your Dentist ermöglicht Praxen professionelle Kommunikation. Rechtswidrige oder missbräuchliche Inhalte werden nicht toleriert.",
    ]),
    section("was", "2. Was gemeldet werden kann", [
      "Rechtswidrige Inhalte, Urheberrechtsverletzungen, Belästigung, Malware, Umgehung von Sicherheitsmechanismen oder sonstige schwerwiegende Verstöße.",
    ]),
    section("wie", "3. Meldung", [
      "Melden Sie Verstöße an: [abuse@your-dentist.de — Platzhalter]",
      "Bitte angeben: betroffene URL/Modul, Beschreibung, Zeitpunkt, ggf. Screenshots.",
    ]),
    section("ablauf", "4. Bearbeitung", [
      "Eingänge werden werktags geprüft. Bei akuter Gefahr kann der Zugang vorläufig gesperrt werden.",
      "Die Praxis wird — soweit zulässig — über Maßnahmen informiert.",
    ]),
    section("missbrauch", "5. Missbrauch des Meldewegs", [
      "Wiederholt unbegründete Meldungen können abgewiesen werden.",
    ]),
  ],
};
