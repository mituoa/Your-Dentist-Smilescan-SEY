import type { PracticeSolutionId } from "@/lib/practice-solutions/catalog";
import {
  LANDING_IMG,
  landingCatalogPreview,
} from "@/lib/practice-solutions/landing-configs/shared-images";

export type LandingCategory = {
  id: PracticeSolutionId | string;
  categoryLabel: string;
  title: string;
  image: string;
  imagePosition?: string;
  inquiryId: PracticeSolutionId;
  /** Fertige Beispiel-Landingpage zu dieser Leistung (Vorlage), falls vorhanden. */
  previewHref?: string;
};

export const LANDING_HERO = {
  eyebrow: "Kampagnen",
  title: "Landingpages",
  subtitle: "Individuell für Ihre Praxis.",
} as const;

export const LANDING_CATEGORIES: readonly LandingCategory[] = [
  {
    id: "smilescan",
    categoryLabel: "SmileScan",
    title: "Digitale Ersteinschätzung",
    image: landingCatalogPreview("smilescan", LANDING_IMG.smilescan),
    imagePosition: "50% 40%",
    inquiryId: "smilescan",
    previewHref: "/landingpages/smilescan",
  },
  {
    id: "aligner",
    categoryLabel: "Aligner",
    title: "Unsichtbare Zahnkorrektur",
    image: landingCatalogPreview("aligner", LANDING_IMG.aligner),
    imagePosition: "50% 22%",
    inquiryId: "aligner",
    previewHref: "/landingpages/aligner",
  },
  {
    id: "implantologie",
    categoryLabel: "Implantologie",
    title: "Fester Zahnersatz",
    image: landingCatalogPreview("implantologie", LANDING_IMG.implantologie),
    imagePosition: "55% 30%",
    inquiryId: "implantologie",
    previewHref: "/landingpages/implantologie",
  },
  {
    id: "bleaching",
    categoryLabel: "Bleaching",
    title: "Professionelles Bleaching",
    image: landingCatalogPreview("bleaching", LANDING_IMG.bleaching),
    imagePosition: "50% 28%",
    inquiryId: "aesthetik",
    previewHref: "/landingpages/bleaching",
  },
  {
    id: "aesthetik",
    categoryLabel: "Ästhetik",
    title: "Ästhetische Zahnmedizin",
    image: landingCatalogPreview("aesthetik", LANDING_IMG.aesthetik),
    imagePosition: "50% 25%",
    inquiryId: "aesthetik",
    previewHref: "/landingpages/aesthetik",
  },
  {
    id: "endodontie",
    categoryLabel: "Endodontie",
    title: "Wurzelkanalbehandlung",
    image: landingCatalogPreview("endodontie", LANDING_IMG.endodontie),
    imagePosition: "55% 32%",
    inquiryId: "endodontie",
  },
  {
    id: "parodontologie",
    categoryLabel: "Parodontologie",
    title: "Parodontale Gesundheit",
    image: landingCatalogPreview("parodontologie", LANDING_IMG.parodontologie),
    imagePosition: "50% 38%",
    inquiryId: "individuell",
  },
  {
    id: "kinderzahnheilkunde",
    categoryLabel: "Kinder",
    title: "Kinderzahnheilkunde",
    image: landingCatalogPreview("kinderzahnheilkunde", LANDING_IMG.kinder),
    imagePosition: "50% 28%",
    inquiryId: "kinderzahnheilkunde",
  },
  {
    id: "prophylaxe",
    categoryLabel: "Prophylaxe",
    title: "Professionelle Zahnreinigung",
    image: landingCatalogPreview("prophylaxe", LANDING_IMG.prophylaxe),
    imagePosition: "50% 35%",
    inquiryId: "prophylaxe",
    previewHref: "/landingpages/prophylaxe",
  },
  {
    id: "oral-health-pass",
    categoryLabel: "Oral Health Pass",
    title: "Präventionsprogramme",
    image: landingCatalogPreview("oral-health-pass", LANDING_IMG.oralHealth),
    imagePosition: "50% 32%",
    inquiryId: "oral-health-pass",
  },
  {
    id: "praxiswebsite",
    categoryLabel: "Praxiswebsite",
    title: "Ihre Praxis online",
    image: landingCatalogPreview("praxiswebsite", LANDING_IMG.praxiswebsite),
    imagePosition: "50% 45%",
    inquiryId: "individuell",
  },
  {
    id: "karriere",
    categoryLabel: "Recruiting",
    title: "Personal gewinnen",
    image: landingCatalogPreview("karriere", LANDING_IMG.karriere),
    imagePosition: "42% 28%",
    inquiryId: "individuell",
  },
  {
    id: "standort",
    categoryLabel: "Standort",
    title: "Lokale Sichtbarkeit",
    image: landingCatalogPreview("standort", LANDING_IMG.standort),
    imagePosition: "50% 55%",
    inquiryId: "individuell",
  },
  {
    id: "patientenratgeber",
    categoryLabel: "Ratgeber",
    title: "Patientenaufklärung",
    image: landingCatalogPreview("patientenratgeber", LANDING_IMG.ratgeber),
    imagePosition: "50% 30%",
    inquiryId: "individuell",
  },
  {
    id: "vorher-nachher",
    categoryLabel: "Ergebnisse",
    title: "Vorher & Nachher",
    image: landingCatalogPreview("vorher-nachher", LANDING_IMG.vorherNachher),
    imagePosition: "50% 32%",
    inquiryId: "aesthetik",
  },
  {
    id: "individuelle-kampagne",
    categoryLabel: "Individuell",
    title: "Eigener Schwerpunkt",
    image: landingCatalogPreview("individuelle-kampagne", LANDING_IMG.individuell),
    imagePosition: "45% 38%",
    inquiryId: "individuell",
  },
] as const;

export const LANDING_CLOSING = {
  title: "Anderes Thema?",
} as const;
