/**
 * Öffentlicher Einstieg — Produktnutzen zuerst, Ruhe als Ergebnis.
 */

import { COMMAND_AI_PUBLIC } from "@/lib/marketing/command-ai-public-copy";

export const PUBLIC_ENTRY_COPY = {
  eyebrow: "Medizinische Praxisinfrastruktur",

  title: "Patienteneingänge strukturiert.",
  titleLine2: "Direkt im Praxisbereich.",

  lead:
    "Patient:innen senden Anliegen und Fotos in Ihren Praxisbereich. Ihr Team koordiniert Übergaben, Aufgaben und Erinnerungen in einem geschützten Workspace — nicht in WhatsApp oder verstreuten Kanälen.",

  benefits: [
    "Eingänge strukturiert statt Telefon- und E-Mail-Chaos",
    "Team am gleichen Fall in Relay — Übergaben und Aufgaben",
    COMMAND_AI_PUBLIC.heroLine,
  ] as const,

  benefitsSection: {
    eyebrow: "Was Sie gewinnen",
    title: "Operativer Überblick ohne Nebenkanäle",
    items: [
      {
        label: "Eingang",
        body: "Fotos und Anliegen landen strukturiert im Tracker — Priorität auf einen Blick.",
      },
      {
        label: "Team",
        body: "Relay bündelt Nachrichten, Übergaben und Erinnerungen am Fall.",
      },
      {
        label: "Assistenz",
        body: COMMAND_AI_PUBLIC.benefitAssist,
      },
    ],
  },

  mobileValue:
    "Eingänge strukturiert. Team am Fall. Command AI unterstützt leise im Hintergrund.",

  flow: {
    title: "Vom Eingang zur Übergabe",
    body: "Sichten, priorisieren, intern abstimmen — in einem System.",
  },

  footer:
    "Patienteneingänge · interne Kommunikation · Aufgaben — eine Praxisinfrastruktur",

  /** Legacy / optionale Deep-Sections (nicht auf Startseite) */
  ecosystem: {
    eyebrow: "Plattform",
    title: "Eingang, Kommunikation, Übergaben",
    lead: "Ein Workspace für den Praxisalltag — Command AI leise im Hintergrund.",
  },
} as const;
