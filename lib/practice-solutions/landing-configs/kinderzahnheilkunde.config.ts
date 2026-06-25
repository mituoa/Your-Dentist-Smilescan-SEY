import type { LandingPageConfig } from "./types";
import { LANDING_IMG } from "./shared-images";

export const kinderzahnheilkundeLandingConfig: LandingPageConfig = {
  id: "kinderzahnheilkunde",
  productName: "Kinderzahnheilkunde",
  modalTitle: "Kinderzahnheilkunde Landingpage konfigurieren",
  solutionId: "kinderzahnheilkunde",
  fields: [
    {
      id: "audience",
      type: "checkbox",
      label: "Welche Zielgruppe möchten Sie ansprechen?",
      options: [
        { id: "toddlers", label: "Kleinkinder" },
        { id: "school", label: "Schulkinder" },
        { id: "parents", label: "Eltern" },
        { id: "anxiety", label: "Ängstliche Kinder" },
      ],
      defaultSelected: ["school", "parents"],
    },
    {
      id: "services",
      type: "checkbox",
      label: "Welche Leistungen sollen hervorgehoben werden?",
      options: [
        { id: "first_visit", label: "Erstbesuch erklärt" },
        { id: "prophylaxe", label: "Kinderprophylaxe" },
        { id: "trauma", label: "Zahnunfall-Versorgung" },
        { id: "sedation", label: "Behutsame Behandlung" },
        { id: "parents_info", label: "Elternberatung" },
      ],
      defaultSelected: ["first_visit", "prophylaxe", "parents_info"],
    },
    {
      id: "goal",
      type: "radio",
      label: "Welches Hauptziel verfolgt die Landingpage?",
      options: [
        { id: "appointments", label: "Mehr Kindertermine" },
        { id: "online", label: "Mehr Online-Anfragen" },
        { id: "visibility", label: "Sichtbarkeit steigern" },
      ],
      defaultValue: "appointments",
    },
    {
      id: "notes",
      type: "text",
      label: "Gibt es besondere Praxismerkmale?",
      optional: true,
      placeholder: "z. B. familienfreundliche Atmosphäre, Erstbesuch-Konzept …",
    },
  ],
  preview: {
    eyebrow: "Kinderzahnheilkunde",
    headline: "Zahnarzt für Familien",
    subheadline: "Warme Elternansprache — medizinisch professionell und einladend.",
    heroImage: LANDING_IMG.kinder,
    secondaryImage: LANDING_IMG.prophylaxe,
    defaultCta: "Kindertermin anfragen",
    trustBullets: ["Familienorientiert", "Erstbesuch erklärt", "Vertrauensvoll"],
    ctaByRadio: {
      goal: {
        appointments: "Kindertermin anfragen",
        online: "Online-Anfrage starten",
        visibility: "Mehr erfahren",
      },
    },
  },
};
