/**
 * Öffentlicher Einstieg — Produktnutzen zuerst, Ruhe als Ergebnis.
 * Warm und hochwertig, aber in 3 Sekunden klar: Infrastruktur für den Praxisalltag.
 */

import { COMMAND_AI_PUBLIC } from "@/lib/marketing/command-ai-public-copy";

export const PUBLIC_ENTRY_COPY = {
  eyebrow: "Medizinische Praxisinfrastruktur",

  title: "Patienteneingänge strukturiert. Team am gleichen Fall.",

  lead:
    "Patient:innen senden Fotos und Anliegen direkt in Ihren Praxisbereich. Sie sichten und schätzen schneller ein — das Team koordiniert Übergaben, Aufgaben und Erinnerungen in Relay, nicht in WhatsApp, am Telefon oder in verstreuten E-Mails.",

  benefits: [
    "Fotos & Anliegen von Patient:innen — strukturiert statt Anruf-Stau und Mailbox-Chaos",
    "Ersteinschätzung im Praxisbereich: Priorität sehen, schneller reagieren",
    "Teamkommunikation direkt am Fall — Übergaben, Aufgaben, Erinnerungen in Relay",
    "Weniger Telefon, WhatsApp und E-Mail — ein Ort für den gesamten Praxisalltag",
    COMMAND_AI_PUBLIC.heroLine,
  ] as const,

  whisper:
    "Ruhe im Team ist das Ergebnis — wenn Eingang, Kommunikation und Übergaben endlich einen festen Ort haben.",

  mobileValue:
    "Fotos & Anliegen strukturiert ein. Schnellere Einschätzung. Team am Fall in Relay — nicht in WhatsApp oder am Telefon.",

  ecosystem: {
    eyebrow: "Was die Plattform leistet",
    title: "Eingang, Kommunikation, Übergaben — in einem System",
    lead:
      "Strukturierte Patienteneingänge, interne Abstimmung am Fall, verlässliche Aufgaben und Routinen. Command AI entlastet zwischen den Behandlungen — ohne Lautstärke.",
  },

  flow: {
    title: "Vom Patienteneingang bis zur strukturierten Übergabe",
    body:
      "Fotos und Anliegen kommen strukturiert an, die Praxis priorisiert, das Team arbeitet in Relay weiter — Command AI unterstützt leise dazwischen.",
  },

  modules: {
    title: "Infrastruktur für den Praxisalltag",
    body:
      "Tracker für Eingänge, Relay für Kommunikation und Routinen, Atlas für den Überblick — Command AI als leise Assistenz im Hintergrund.",
  },

  footer:
    "Patienteneingänge · interne Kommunikation · Aufgaben & Erinnerungen — eine Praxisinfrastruktur",
} as const;
