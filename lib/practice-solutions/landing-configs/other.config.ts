import type { LandingPageConfig } from "./types";
import { LANDING_IMG } from "./shared-images";

export const smilescanLandingConfig: LandingPageConfig = {
  id: "smilescan",
  productName: "SmileScan",
  modalTitle: "SmileScan Landingpage konfigurieren",
  solutionId: "smilescan",
  fields: [
    {
      id: "integration",
      type: "radio",
      label: "Gewünschte Anbindung",
      options: [
        { id: "landing", label: "Nur Landingpage" },
        { id: "tracker", label: "Mit Tracker" },
        { id: "full", label: "Tracker + Relay" },
      ],
      defaultValue: "tracker",
    },
    {
      id: "services",
      type: "checkbox",
      label: "Welche Einstiege sollen hervorgehoben werden?",
      options: [
        { id: "first_assessment", label: "Digitale Ersteinschätzung" },
        { id: "photo_upload", label: "Foto-Upload" },
        { id: "new_patients", label: "Für Neupatienten" },
        { id: "existing", label: "Für Bestandskunden" },
      ],
      defaultSelected: ["first_assessment", "photo_upload", "new_patients"],
    },
    {
      id: "goal",
      type: "radio",
      label: "Welches Hauptziel verfolgt die Landingpage?",
      options: [
        { id: "new_patients", label: "Mehr Neupatienten" },
        { id: "qualified", label: "Qualifiziertere Anfragen" },
        { id: "visibility", label: "Sichtbarkeit steigern" },
      ],
      defaultValue: "new_patients",
    },
    {
      id: "notes",
      type: "text",
      label: "Gibt es besondere Praxismerkmale?",
      optional: true,
      placeholder: "z. B. Aligner-Einstieg, Ästhetik-Schwerpunkt …",
    },
  ],
  preview: {
    eyebrow: "Digitale Ersteinschätzung",
    headline: "SmileScan — Ihr digitaler Einstieg",
    subheadline: "Strukturierter Patienteneinstieg — ruhig geführt und medizinisch seriös.",
    heroImage: LANDING_IMG.smilescan,
    secondaryImage: LANDING_IMG.smilescan,
    defaultCta: "Ersteinschätzung starten",
    trustBullets: ["Geführter Einstieg", "Sichere Übermittlung", "Persönliche Rückmeldung"],
    ctaByRadio: {
      goal: {
        new_patients: "Ersteinschätzung starten",
        qualified: "Digitale Anfrage senden",
        visibility: "Mehr erfahren",
      },
    },
  },
};

export const prophylaxeLandingConfig: LandingPageConfig = {
  id: "prophylaxe",
  productName: "Prophylaxe",
  modalTitle: "Prophylaxe Landingpage konfigurieren",
  solutionId: "prophylaxe",
  fields: [
    {
      id: "recall",
      type: "radio",
      label: "Recall-Modell",
      options: [
        { id: "recall", label: "Recall-Erinnerung" },
        { id: "booking", label: "Direkte PZR-Buchung" },
        { id: "both", label: "Recall + Online-Buchung" },
      ],
      defaultValue: "both",
    },
    {
      id: "services",
      type: "checkbox",
      label: "Welche Leistungen sollen hervorgehoben werden?",
      options: [
        { id: "pzr", label: "Professionelle Zahnreinigung" },
        { id: "kids", label: "Kinderprophylaxe" },
        { id: "perio", label: "Parodontale Nachsorge" },
        { id: "home_care", label: "Pflegeberatung" },
      ],
      defaultSelected: ["pzr", "home_care"],
    },
    {
      id: "goal",
      type: "radio",
      label: "Welches Hauptziel verfolgt die Landingpage?",
      options: [
        { id: "recall", label: "Mehr Recall-Termine" },
        { id: "new_patients", label: "Mehr Neupatienten" },
        { id: "visibility", label: "Sichtbarkeit steigern" },
      ],
      defaultValue: "recall",
    },
    {
      id: "notes",
      type: "text",
      label: "Gibt es besondere Praxismerkmale?",
      optional: true,
      placeholder: "z. B. Recall-Intervall, PZR-Preise transparent …",
    },
  ],
  preview: {
    eyebrow: "Prophylaxe & PZR",
    headline: "Professionelle Zahnreinigung",
    subheadline: "Recall, Prävention und langfristige Zahngesundheit.",
    heroImage: LANDING_IMG.prophylaxe,
    secondaryImage: LANDING_IMG.smilescan,
    defaultCta: "PZR-Termin anfragen",
    trustBullets: ["Professionelle Zahnreinigung", "Recall digital", "Langfristige Betreuung"],
    ctaByRadio: {
      goal: {
        recall: "PZR-Termin anfragen",
        new_patients: "Ersttermin anfragen",
        visibility: "Mehr erfahren",
      },
    },
  },
};

export const parodontologieLandingConfig: LandingPageConfig = {
  id: "parodontologie",
  productName: "Parodontologie",
  modalTitle: "Parodontologie Landingpage konfigurieren",
  solutionId: "individuell",
  fields: [
    {
      id: "services",
      type: "checkbox",
      label: "Welche Leistungen sollen hervorgehoben werden?",
      options: [
        { id: "periodontitis", label: "Parodontitis-Behandlung" },
        { id: "recall", label: "Recall & Nachsorge" },
        { id: "laser", label: "Lasertherapie" },
        { id: "maintenance", label: "Langzeitbetreuung" },
        { id: "surgery", label: "Parodontale Chirurgie" },
      ],
      defaultSelected: ["periodontitis", "maintenance"],
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
      placeholder: "z. B. systematische Parodontologie, Recall-Konzept …",
    },
  ],
  preview: {
    eyebrow: "Parodontologie",
    headline: "Parodontale Gesundheit erhalten",
    subheadline: "Parodontale Behandlung verständlich und seriös kommuniziert.",
    heroImage: LANDING_IMG.parodontologie,
    secondaryImage: LANDING_IMG.implantologie,
    defaultCta: "Beratungstermin vereinbaren",
    trustBullets: ["Aufklärung", "Langfristige Betreuung", "Individuelle Therapie"],
    ctaByRadio: {
      goal: {
        appointments: "Beratungstermin vereinbaren",
        online: "Online-Anfrage starten",
        visibility: "Mehr erfahren",
      },
    },
  },
};

export const endodontieLandingConfig: LandingPageConfig = {
  id: "endodontie",
  productName: "Endodontie",
  modalTitle: "Endodontie Landingpage konfigurieren",
  solutionId: "endodontie",
  fields: [
    {
      id: "services",
      type: "checkbox",
      label: "Welche Schwerpunkte sollen hervorgehoben werden?",
      options: [
        { id: "root_canal", label: "Wurzelkanalbehandlung" },
        { id: "microscope", label: "Mikroskopische Endodontie" },
        { id: "anxiety", label: "Angstpatienten" },
        { id: "referral", label: "Überweisungen" },
        { id: "emergency", label: "Akutversorgung" },
      ],
      defaultSelected: ["root_canal", "microscope"],
    },
    {
      id: "goal",
      type: "radio",
      label: "Welches Hauptziel verfolgt die Landingpage?",
      options: [
        { id: "appointments", label: "Mehr Beratungstermine" },
        { id: "referrals", label: "Mehr Überweisungen" },
        { id: "visibility", label: "Sichtbarkeit steigern" },
      ],
      defaultValue: "appointments",
    },
    {
      id: "notes",
      type: "text",
      label: "Gibt es besondere Praxismerkmale?",
      optional: true,
      placeholder: "z. B. Mikroskop, schonende Aufklärung …",
    },
  ],
  preview: {
    eyebrow: "Endodontie",
    headline: "Wurzelkanalbehandlung verständlich erklärt",
    subheadline: "Komplexe Endodontie — Angst reduzieren, Vertrauen schaffen.",
    heroImage: LANDING_IMG.endodontie,
    secondaryImage: LANDING_IMG.implantologie,
    defaultCta: "Termin anfragen",
    trustBullets: ["Verständliche Aufklärung", "Schonende Behandlung", "Persönliche Betreuung"],
    ctaByRadio: {
      goal: {
        appointments: "Termin anfragen",
        referrals: "Überweisung anfragen",
        visibility: "Mehr erfahren",
      },
    },
  },
};

export const aesthetikLandingConfig: LandingPageConfig = {
  id: "aesthetik",
  productName: "Ästhetische Zahnmedizin",
  modalTitle: "Ästhetik Landingpage konfigurieren",
  solutionId: "aesthetik",
  fields: [
    {
      id: "focus",
      type: "radio",
      label: "Hauptschwerpunkt",
      options: [
        { id: "smile_design", label: "Smile Design" },
        { id: "veneers", label: "Veneers" },
        { id: "combined", label: "Kombination" },
      ],
      defaultValue: "smile_design",
    },
    {
      id: "services",
      type: "checkbox",
      label: "Welche Leistungen sollen hervorgehoben werden?",
      options: [
        { id: "bonding", label: "Bonding" },
        { id: "gum", label: "Gingiva-Ästhetik" },
        { id: "before_after", label: "Vorher-Nachher-Beratung" },
        { id: "financing", label: "Finanzierung" },
      ],
      defaultSelected: ["before_after"],
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
      placeholder: "z. B. Smile Design, diskrete Beratung …",
    },
  ],
  preview: {
    eyebrow: "Ästhetische Zahnmedizin",
    headline: "Ihr Smile Design",
    subheadline: "Bleaching, Veneers und Ästhetik — hochwertig und medizinisch fundiert.",
    heroImage: LANDING_IMG.aesthetik,
    secondaryImage: LANDING_IMG.bleaching,
    defaultCta: "Ästhetik-Beratung vereinbaren",
    trustBullets: ["Smile Design", "Erwartungsmanagement", "Diskrete Beratung"],
    headlineByRadio: {
      focus: {
        veneers: "Veneers & Smile Design",
        combined: "Ästhetische Gesamtlösungen",
      },
    },
    ctaByRadio: {
      goal: {
        appointments: "Ästhetik-Beratung vereinbaren",
        online: "Online-Anfrage starten",
        visibility: "Mehr erfahren",
      },
    },
  },
};

export const praxiswebsiteLandingConfig: LandingPageConfig = {
  id: "praxiswebsite",
  productName: "Praxiswebsite",
  modalTitle: "Praxiswebsite konfigurieren",
  solutionId: "individuell",
  fields: [
    {
      id: "focus",
      type: "checkbox",
      label: "Welche Bereiche sollen im Fokus stehen?",
      options: [
        { id: "team", label: "Team & Praxis" },
        { id: "services", label: "Leistungen" },
        { id: "booking", label: "Terminbuchung" },
        { id: "location", label: "Standort & Anfahrt" },
      ],
      defaultSelected: ["team", "services", "booking"],
    },
    {
      id: "goal",
      type: "radio",
      label: "Welches Hauptziel verfolgt die Seite?",
      options: [
        { id: "booking", label: "Mehr Terminbuchungen" },
        { id: "trust", label: "Vertrauen aufbauen" },
        { id: "visibility", label: "Sichtbarkeit steigern" },
      ],
      defaultValue: "booking",
    },
    {
      id: "notes",
      type: "text",
      label: "Gibt es besondere Wünsche?",
      optional: true,
      placeholder: "z. B. CI-Vorgaben, vorhandene Texte …",
    },
  ],
  preview: {
    eyebrow: "Praxiswebsite",
    headline: "Ihre Praxis online",
    subheadline: "Digitale Visitenkarte — ruhig, vertrauenswürdig, patientenorientiert.",
    heroImage: LANDING_IMG.praxiswebsite,
    secondaryImage: LANDING_IMG.aesthetik,
    defaultCta: "Termin online buchen",
    trustBullets: ["Vertrauen", "Klare Struktur", "Terminbuchung"],
    ctaByRadio: {
      goal: {
        booking: "Termin online buchen",
        trust: "Praxis kennenlernen",
        visibility: "Mehr erfahren",
      },
    },
  },
};

export const individuellLandingConfig: LandingPageConfig = {
  id: "individuell",
  productName: "Individuelle Landingpage",
  modalTitle: "Landingpage konfigurieren",
  solutionId: "individuell",
  fields: [
    {
      id: "schwerpunkt",
      type: "text",
      label: "Behandlungsschwerpunkt",
      placeholder: "z. B. CMD, Schlafmedizin, Parodontologie …",
    },
    {
      id: "services",
      type: "checkbox",
      label: "Welche Leistungen sollen hervorgehoben werden?",
      options: [
        { id: "consultation", label: "Beratungsgespräch" },
        { id: "second_opinion", label: "Zweitmeinung" },
        { id: "digital", label: "Digitale Beratung" },
        { id: "followup", label: "Nachsorge" },
      ],
      defaultSelected: ["consultation"],
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
      label: "Projektbeschreibung",
      optional: true,
      placeholder: "Was soll die Seite erreichen?",
    },
  ],
  preview: {
    eyebrow: "Ihre Landingpage",
    headline: "Ihre Landingpage",
    subheadline: "Maßgeschneidert für Ihren Behandlungsschwerpunkt.",
    heroImage: LANDING_IMG.default,
    secondaryImage: LANDING_IMG.praxiswebsite,
    defaultCta: "Beratung anfragen",
    trustBullets: ["Individuelle Beratung", "Persönliche Betreuung", "Klare Information"],
    ctaByRadio: {
      goal: {
        appointments: "Beratungstermin vereinbaren",
        online: "Online-Anfrage starten",
        visibility: "Mehr erfahren",
      },
    },
  },
};
