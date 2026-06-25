import type { LandingPageConfig } from "./types";
import { LANDING_IMG } from "./shared-images";

export const alignerLandingConfig: LandingPageConfig = {
  id: "aligner",
  productName: "Aligner",
  modalTitle: "Aligner",
  solutionId: "aligner",
  fields: [
    {
      id: "system",
      type: "radio",
      label: "Welches System verwenden Sie?",
      options: [
        { id: "invisalign", label: "Invisalign", description: "Marktführer für transparente Aligner" },
        { id: "spark", label: "Spark", description: "Hochästhetische Aligner-Therapie" },
        { id: "suresmile", label: "SureSmile", description: "Digitale Zahnkorrektur mit Präzision" },
        { id: "clearcorrect", label: "ClearCorrect", description: "Transparente Schienen-Therapie" },
        { id: "angel", label: "Angel Aligner", description: "Moderne Aligner-Technologie" },
        { id: "custom", label: "Eigenes System", description: "Ihr individuelles Aligner-Angebot" },
      ],
      defaultValue: "invisalign",
    },
    {
      id: "audience",
      type: "radio",
      label: "Welche Patienten behandeln Sie überwiegend?",
      options: [
        { id: "adults", label: "Erwachsene", description: "Berufstätige und Erwachsene" },
        { id: "teens", label: "Jugendliche", description: "Teens und junge Erwachsene" },
        { id: "both", label: "Beide", description: "Alle Altersgruppen" },
      ],
      defaultValue: "adults",
    },
    {
      id: "services",
      type: "checkbox",
      label: "Welche Leistungen sollen hervorgehoben werden?",
      options: [
        { id: "digital_planning", label: "Digitale Planung", description: "3D-Planung und Simulation" },
        { id: "invisible", label: "Unsichtbare Zahnkorrektur", description: "Diskret im Alltag" },
        { id: "retention", label: "Retention", description: "Langfristiger Erhalt" },
        { id: "financing", label: "Finanzierung", description: "Flexible Zahlungsmodelle" },
        { id: "short_treatment", label: "Kurze Behandlungszeiten", description: "Effiziente Therapiewege" },
      ],
      defaultSelected: [],
    },
    {
      id: "goal",
      type: "radio",
      label: "Kampagnenziel",
      options: [
        { id: "consultation", label: "Beratung", description: "Direkt Termine vereinbaren" },
        { id: "more_cases", label: "Mehr Fälle", description: "Neue Aligner-Patienten gewinnen" },
        { id: "second_opinion", label: "Zweitmeinungen", description: "Bestehende Indikationen ansprechen" },
        { id: "visibility", label: "Sichtbarkeit erhöhen", description: "Praxis als Experten positionieren" },
      ],
      defaultValue: "consultation",
    },
    {
      id: "notes",
      type: "text",
      label: "Besonderheiten der Praxis",
      optional: true,
      placeholder: "z. B. Invisalign Platinum Provider …",
    },
  ],
  preview: {
    eyebrow: "Unsichtbare Zahnkorrektur",
    headline: "Aligner in Ihrer Praxis",
    subheadline: "Ästhetische Korrektur — professionell erklärt und persönlich begleitet.",
    heroImage: LANDING_IMG.aligner,
    secondaryImage: LANDING_IMG.aesthetik,
    defaultCta: "Aligner-Beratung vereinbaren",
    trustBullets: ["Diskrete Behandlung", "Digitale Planung", "Persönliche Betreuung"],
    headlineByRadio: {
      system: {
        invisalign: "Invisalign® — unsichtbare Zahnkorrektur",
        spark: "Spark Aligner — ästhetische Korrektur",
        clearcorrect: "ClearCorrect in Ihrer Praxis",
        suresmile: "SureSmile — digitale Zahnkorrektur",
        angel: "Angel Aligner — moderne Korrektur",
        custom: "Aligner-Therapie in Ihrer Praxis",
      },
      audience: {
        teens: "Aligner für Jugendliche",
        both: "Aligner für alle Altersgruppen",
      },
      goal: {
        more_cases: "Starten Sie Ihre Aligner-Behandlung",
        second_opinion: "Zweitmeinung zur Aligner-Therapie",
      },
    },
    subheadlineByRadio: {
      system: {
        invisalign: "Der Marktführer für transparente Zahnkorrektur — bei uns in Ihrer Nähe.",
        spark: "Spark Aligner vereinen Ästhetik und Präzision für Ihr neues Lächeln.",
        clearcorrect: "Transparente Aligner — individuell geplant und professionell betreut.",
        suresmile: "Digitale Planung und präzise Korrektur mit SureSmile.",
        angel: "Moderne Aligner-Technologie für anspruchsvolle Patienten.",
      },
      audience: {
        teens: "Jugendgerechte Aufklärung — für Eltern und Teenager verständlich erklärt.",
        adults: "Diskrete Korrektur für Beruf und Alltag — ohne Kompromisse.",
      },
    },
    eyebrowByRadio: {
      system: {
        invisalign: "Invisalign®",
        spark: "Spark Aligner",
        suresmile: "SureSmile",
        clearcorrect: "ClearCorrect",
        angel: "Angel Aligner",
      },
    },
    heroByRadio: {
      system: {
        invisalign: LANDING_IMG.aligner,
        spark: LANDING_IMG.aligner,
        suresmile: LANDING_IMG.aesthetik,
        clearcorrect: LANDING_IMG.aligner,
        angel: LANDING_IMG.aligner,
      },
      audience: {
        teens: LANDING_IMG.kinder,
        both: LANDING_IMG.kinder,
      },
    },
    trustByRadio: {
      system: {
        invisalign: ["Invisalign® Provider", "Digitale 3D-Planung", "Persönliche Betreuung"],
        spark: ["Spark Aligner", "Hochästhetisch", "Individuelle Planung"],
        suresmile: ["Digitale Planung", "Präzise Korrektur", "Erfahrenes Team"],
        clearcorrect: ["Transparente Schienen", "Sanfte Korrektur", "Regelmäßige Kontrolle"],
        angel: ["Moderne Technologie", "Ästhetische Lösung", "Professionelle Beratung"],
      },
      goal: {
        consultation: ["Kostenlose Erstberatung", "Unverbindlich", "Schnelle Termine"],
        more_cases: ["Erfahrene Behandler", "Digitale Planung", "Transparente Kosten"],
      },
    },
    testimonialByRadio: {
      system: {
        invisalign: {
          quote: "Die Behandlung war diskret — das Ergebnis hat meine Erwartungen übertroffen.",
          author: "Patientin, Invisalign",
        },
        spark: {
          quote: "Spark Aligner waren im Alltag kaum sichtbar — ich fühle mich endlich wohl.",
          author: "Patient, Spark",
        },
      },
    },
    ctaByRadio: {
      goal: {
        consultation: "Beratungstermin vereinbaren",
        more_cases: "Aligner-Beratung starten",
        second_opinion: "Zweitmeinung anfragen",
        visibility: "Mehr erfahren",
      },
    },
  },
};
