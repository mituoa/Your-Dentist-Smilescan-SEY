import type { PracticeSolutionId } from "@/lib/practice-solutions/catalog";
import { LANDING_IMG } from "@/lib/practice-solutions/landing-configs/shared-images";

export type LandingCategoryTier = "featured" | "standard";

export type LandingCategory = {
  id: PracticeSolutionId | string;
  categoryLabel: string;
  title: string;
  tagline: string;
  image: string;
  imagePosition?: string;
  inquiryId: PracticeSolutionId;
  tier: LandingCategoryTier;
  badge?: string;
};

export type LandingBenefit = {
  title: string;
};

export const LANDING_HERO = {
  title: "Digitale Patientengewinnung für moderne Zahnarztpraxen",
  subtitle: "Individuell konzipierte Landingpages — von unserem Kreativteam für Ihre Praxis.",
  benefits: [
    { title: "Individuell erstellt" },
    { title: "Medizinisch geprüft" },
    { title: "Mehr qualifizierte Anfragen" },
    { title: "Persönliche Begleitung" },
  ] satisfies readonly LandingBenefit[],
} as const;

export const LANDING_CATEGORIES: readonly LandingCategory[] = [
  {
    id: "smilescan",
    categoryLabel: "SmileScan",
    title: "Digitale Ersteinschätzung",
    tagline:
      "Professionelle Landingpage für digitale Ersteinschätzung mit individueller Anpassung an Ihre Praxis.",
    image: LANDING_IMG.smilescan,
    imagePosition: "55% 35%",
    inquiryId: "smilescan",
    tier: "featured",
    badge: "Bestseller",
  },
  {
    id: "aligner",
    categoryLabel: "Aligner",
    title: "Unsichtbare Zahnkorrektur",
    tagline:
      "Professionelle Landingpage für transparente Alignertherapie mit individueller Anpassung an Ihre Praxis.",
    image: LANDING_IMG.aligner,
    imagePosition: "50% 25%",
    inquiryId: "aligner",
    tier: "standard",
  },
  {
    id: "implantologie",
    categoryLabel: "Implantologie",
    title: "Fester Zahnersatz",
    tagline:
      "Professionelle Landingpage für Implantologie mit Vertrauensaufbau und individueller Praxisanpassung.",
    image: LANDING_IMG.implantologie,
    imagePosition: "60% 30%",
    inquiryId: "implantologie",
    tier: "standard",
  },
  {
    id: "aesthetik",
    categoryLabel: "Ästhetik",
    title: "Ästhetische Zahnmedizin",
    tagline:
      "Professionelle Landingpage für ästhetische Behandlungen — medizinisch seriös und individuell gestaltet.",
    image: LANDING_IMG.bleaching,
    imagePosition: "45% 20%",
    inquiryId: "aesthetik",
    tier: "standard",
  },
  {
    id: "parodontologie",
    categoryLabel: "Parodontologie",
    title: "Parodontale Gesundheit",
    tagline:
      "Professionelle Landingpage für parodontale Betreuung mit verständlicher Aufklärung für Ihre Patienten.",
    image: LANDING_IMG.parodontologie,
    imagePosition: "50% 40%",
    inquiryId: "individuell",
    tier: "standard",
  },
  {
    id: "kinderzahnheilkunde",
    categoryLabel: "Kinder",
    title: "Kinderzahnheilkunde",
    tagline:
      "Professionelle Landingpage für Familien mit warmer Ansprache und medizinischer Seriosität.",
    image: LANDING_IMG.kinder,
    imagePosition: "50% 30%",
    inquiryId: "kinderzahnheilkunde",
    tier: "standard",
  },
  {
    id: "prophylaxe",
    categoryLabel: "Prophylaxe",
    title: "Professionelle Zahnreinigung",
    tagline:
      "Professionelle Landingpage für PZR und Recall — digital begleitet und auf Ihre Praxis zugeschnitten.",
    image: LANDING_IMG.prophylaxe,
    imagePosition: "55% 25%",
    inquiryId: "prophylaxe",
    tier: "standard",
  },
  {
    id: "oral-health-pass",
    categoryLabel: "Oral Health Pass",
    title: "Präventionsprogramme",
    tagline:
      "Professionelle Landingpage für institutionelle Präventionsprogramme und B2B-Partnerschaften.",
    image: LANDING_IMG.oralHealth,
    imagePosition: "50% 35%",
    inquiryId: "oral-health-pass",
    tier: "standard",
  },
  {
    id: "praxiswebsite",
    categoryLabel: "Praxiswebsite",
    title: "Ihre Praxis online",
    tagline:
      "Professionelle Praxiswebsite — ruhig, vertrauenswürdig und individuell auf Ihre Identität abgestimmt.",
    image: LANDING_IMG.praxiswebsite,
    imagePosition: "50% 50%",
    inquiryId: "individuell",
    tier: "standard",
  },
  {
    id: "karriere",
    categoryLabel: "Karriere",
    title: "Teamgewinnung",
    tagline:
      "Professionelle Karriereseite mit klarer Praxisidentität und individueller Ansprache an Fachkräfte.",
    image: LANDING_IMG.karriere,
    imagePosition: "40% 30%",
    inquiryId: "individuell",
    tier: "standard",
  },
  {
    id: "standort",
    categoryLabel: "Standort",
    title: "Lokale Sichtbarkeit",
    tagline:
      "Professionelle Standortseite für Anfahrt, Erreichbarkeit und regionale Präsenz Ihrer Praxis.",
    image: LANDING_IMG.standort,
    imagePosition: "50% 60%",
    inquiryId: "individuell",
    tier: "standard",
  },
  {
    id: "patientenratgeber",
    categoryLabel: "Ratgeber",
    title: "Patientenaufklärung",
    tagline:
      "Professionelle Ratgeberseite mit hochwertigen medizinischen Inhalten für Ihre Patienten.",
    image: LANDING_IMG.ratgeber,
    imagePosition: "50% 25%",
    inquiryId: "individuell",
    tier: "standard",
  },
  {
    id: "vorher-nachher",
    categoryLabel: "Vorher / Nachher",
    title: "Ergebnisse zeigen",
    tagline:
      "Professionelle Ergebnisseite — medizinisch seriös, rechtssicher und individuell kommuniziert.",
    image: LANDING_IMG.vorherNachher,
    imagePosition: "50% 35%",
    inquiryId: "aesthetik",
    tier: "standard",
  },
  {
    id: "individuelle-kampagne",
    categoryLabel: "Individuell",
    title: "Maßgeschneiderte Kampagne",
    tagline:
      "Professionelle Kampagne für Ihren Schwerpunkt — individuell konzipiert für Ihre Zielgruppe.",
    image: LANDING_IMG.individuell,
    imagePosition: "45% 40%",
    inquiryId: "individuell",
    tier: "standard",
  },
] as const;

export const LANDING_CLOSING = {
  title: "Nicht das Passende gefunden?",
  lead: "Wir entwickeln individuelle Landingpages, Kampagnen und digitale Patientenkommunikation speziell für Ihre Praxis.",
} as const;
