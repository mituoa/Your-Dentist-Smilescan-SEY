import type { LandingPageConfig } from "./types";
import { LANDING_IMG } from "./shared-images";

export const oralHealthPassLandingConfig: LandingPageConfig = {
  id: "oral-health-pass",
  productName: "Oral Health Pass",
  modalTitle: "Oral Health Pass Landingpage konfigurieren",
  solutionId: "oral-health-pass",
  fields: [
    {
      id: "institutions",
      type: "checkbox",
      label: "Welche Zielgruppen möchten Sie ansprechen?",
      options: [
        { id: "schools", label: "Schulen" },
        { id: "companies", label: "Betriebe" },
        { id: "care", label: "Pflegeeinrichtungen" },
        { id: "clubs", label: "Vereine" },
        { id: "municipal", label: "Kommunen" },
      ],
      defaultSelected: ["companies", "schools"],
    },
    {
      id: "services",
      type: "checkbox",
      label: "Welche Angebote sollen hervorgehoben werden?",
      options: [
        { id: "prevention", label: "Präventionsprogramme" },
        { id: "workshops", label: "Workshops" },
        { id: "screenings", label: "Screenings" },
        { id: "reporting", label: "Reporting & Dokumentation" },
        { id: "on_site", label: "Vor-Ort-Betreuung" },
      ],
      defaultSelected: ["prevention", "screenings"],
    },
    {
      id: "goal",
      type: "radio",
      label: "Welches Hauptziel verfolgt die Landingpage?",
      options: [
        { id: "inquiries", label: "Mehr Programm-Anfragen" },
        { id: "partnerships", label: "Neue Kooperationen" },
        { id: "visibility", label: "Sichtbarkeit steigern" },
      ],
      defaultValue: "inquiries",
    },
    {
      id: "notes",
      type: "text",
      label: "Gibt es besondere Praxismerkmale?",
      optional: true,
      placeholder: "z. B. Erfahrung mit Betriebsprogrammen, regionale Reichweite …",
    },
  ],
  preview: {
    eyebrow: "Oral Health Pass",
    headline: "Präventionsprogramme für Institutionen",
    subheadline: "Programme für Betriebe, Schulen und Einrichtungen — professionell und skalierbar.",
    heroImage: LANDING_IMG.oralHealth,
    secondaryImage: LANDING_IMG.kinder,
    defaultCta: "Programm anfragen",
    trustBullets: ["B2B-Prävention", "Strukturierte Betreuung", "Professionell"],
    heroByCheckbox: {
      institutions: {
        schools: LANDING_IMG.kinder,
        companies: LANDING_IMG.oralHealth,
        care: LANDING_IMG.oralHealth,
      },
    },
    ctaByRadio: {
      goal: {
        inquiries: "Programm anfragen",
        partnerships: "Kooperation anfragen",
        visibility: "Mehr erfahren",
      },
    },
  },
};
