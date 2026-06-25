import type { LandingPageConfig } from "./types";
import { LANDING_IMG } from "./shared-images";

export const implantologieLandingConfig: LandingPageConfig = {
  id: "implantologie",
  productName: "Implantologie",
  modalTitle: "Implantologie — Landingpage briefen",
  solutionId: "implantologie",
  fields: [
    {
      id: "system",
      type: "radio",
      label: "Welches Implantatsystem verwenden Sie?",
      description: "Ihr System wird in Headline und Vertrauensbereich sichtbar.",
      options: [
        { id: "straumann", label: "Straumann", description: "Schweizer Premium-Implantologie." },
        { id: "camlog", label: "Camlog", description: "Bewährtes deutsches Implantatsystem." },
        { id: "nobel", label: "Nobel Biocare", description: "Internationale Implantat-Expertise." },
        { id: "sic", label: "SIC", description: "Präzise Implantologie mit SIC." },
        { id: "astra", label: "Astra", description: "Astra Tech Implant System." },
        { id: "custom", label: "Eigenes System", description: "Individuelle Darstellung Ihrer Systemwahl." },
      ],
      defaultValue: "straumann",
    },
    {
      id: "services",
      type: "checkbox",
      label: "Leistungsschwerpunkte",
      description: "Diese Schwerpunkte strukturieren Ihre Implantat-Landingpage.",
      options: [
        { id: "single", label: "Einzelimplantate", description: "Einzelzahnversorgung verständlich erklärt." },
        { id: "allon4", label: "All-on-4", description: "Festsitzender Zahnersatz auf Implantaten." },
        { id: "bone", label: "Knochenaufbau", description: "Aufklärung zu augmentativen Verfahren." },
        { id: "immediate", label: "Sofortversorgung", description: "Schnelle Versorgung nach Implantation." },
        { id: "sedation", label: "Sedierung", description: "Behutsame Behandlung für ängstliche Patienten." },
      ],
      defaultSelected: ["single", "immediate"],
    },
    {
      id: "goal",
      type: "radio",
      label: "Kampagnenziel",
      description: "Der Call-to-Action richtet sich nach diesem Ziel.",
      options: [
        {
          id: "implant_consult",
          label: "Implantatberatung",
          description: "Patienten sollen einen persönlichen Beratungstermin vereinbaren.",
        },
        {
          id: "second_opinion",
          label: "Zweitmeinungen",
          description: "Patienten mit bestehender Indikation gezielt ansprechen.",
        },
        {
          id: "more_cases",
          label: "Mehr Implantatfälle",
          description: "Fokus auf neue Implantatbehandlungen.",
        },
        {
          id: "visibility",
          label: "Sichtbarkeit erhöhen",
          description: "Positionierung als Implantat-Experten stärken.",
        },
      ],
      defaultValue: "implant_consult",
    },
    {
      id: "notes",
      type: "text",
      label: "Besonderheiten der Praxis",
      description: "Optional — z. B. digitale Planung, minimalinvasive Verfahren.",
      optional: true,
      placeholder: "z. B. digitale Implantatplanung, 3D-Diagnostik vor Ort …",
    },
  ],
  preview: {
    eyebrow: "Implantologie",
    headline: "Digitale Implantologie für festen Zahnersatz",
    subheadline: "Individuelle Beratung, moderne Diagnostik und persönliche Therapieplanung.",
    heroImage: LANDING_IMG.implantologie,
    secondaryImage: LANDING_IMG.implantDigital,
    defaultCta: "Implantat-Beratung vereinbaren",
    trustBullets: ["Medizinische Seriosität", "Moderne Diagnostik", "Persönliche Therapieplanung"],
    headlineByRadio: {
      system: {
        straumann: "Straumann Implantologie in Ihrer Praxis",
        nobel: "Nobel Biocare — Implantologie",
        camlog: "Camlog Implantate — sicher versorgt",
      },
    },
    heroByRadio: {
      system: {
        straumann: LANDING_IMG.implantologie,
        nobel: LANDING_IMG.implantDigital,
      },
    },
    heroByCheckbox: {
      services: {
        allon4: LANDING_IMG.implantologie,
        immediate: LANDING_IMG.implantDigital,
      },
    },
    ctaByRadio: {
      goal: {
        implant_consult: "Implantat-Beratung vereinbaren",
        second_opinion: "Zweitmeinung anfragen",
        more_cases: "Implantat-Beratung starten",
        visibility: "Mehr erfahren",
      },
    },
  },
};
