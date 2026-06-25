import type { LandingPageConfig } from "./types";
import { LANDING_IMG } from "./shared-images";

export const bleachingLandingConfig: LandingPageConfig = {
  id: "bleaching",
  productName: "Bleaching",
  modalTitle: "Bleaching Landingpage konfigurieren",
  solutionId: "aesthetik",
  fields: [
    {
      id: "services",
      type: "checkbox",
      label: "Welche Bleaching-Angebote sollen hervorgehoben werden?",
      options: [
        { id: "in_office", label: "In-Office" },
        { id: "home", label: "Home Bleaching" },
        { id: "combo_prophy", label: "Kombination mit Prophylaxe" },
        { id: "sensitive", label: "Sensible Zähne" },
        { id: "before_after", label: "Vorher-Nachher" },
      ],
      defaultSelected: ["in_office", "home"],
    },
    {
      id: "goal",
      type: "radio",
      label: "Welches Hauptziel verfolgt die Landingpage?",
      options: [
        { id: "appointments", label: "Mehr Beratungstermine" },
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
      placeholder: "z. B. schonendes Bleaching, Aufklärung zu Empfindlichkeit …",
    },
  ],
  preview: {
    eyebrow: "Bleaching",
    headline: "Professionelles Bleaching",
    subheadline: "Strahlendes Lächeln — medizinisch fundiert und diskret erklärt.",
    heroImage: LANDING_IMG.bleaching,
    secondaryImage: LANDING_IMG.aesthetik,
    defaultCta: "Bleaching-Beratung vereinbaren",
    trustBullets: ["Medizinisch seriös", "Individuelle Beratung", "Diskret"],
    ctaByRadio: {
      goal: {
        appointments: "Bleaching-Beratung vereinbaren",
        online: "Online-Anfrage starten",
        visibility: "Mehr erfahren",
      },
    },
  },
};
