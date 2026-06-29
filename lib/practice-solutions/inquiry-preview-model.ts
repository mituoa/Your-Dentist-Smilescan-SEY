import type { PracticeSolutionId } from "@/lib/practice-solutions/catalog";

import type { PracticeSolutionInquiryContext } from "@/components/profile/practice-solution-inquiry-types";

export type CampaignGoalId =
  | "new_patients"
  | "implant_cases"
  | "aligner_cases"
  | "visibility"
  | "website_relaunch"
  | "custom";

export const CAMPAIGN_GOAL_OPTIONS = [
  { id: "new_patients" as const, label: "Mehr Neupatienten" },
  { id: "implant_cases" as const, label: "Mehr Implantatfälle" },
  { id: "aligner_cases" as const, label: "Mehr Alignerfälle" },
  { id: "visibility" as const, label: "Mehr Sichtbarkeit" },
  { id: "website_relaunch" as const, label: "Website Relaunch" },
  { id: "custom" as const, label: "Individuelles Projekt" },
] as const;

export type InquiryCategoryKey =
  | "smilescan"
  | "aligner"
  | "implantologie"
  | "aesthetik"
  | "prophylaxe"
  | "kinderzahnheilkunde"
  | "parodontologie"
  | "karriere"
  | "praxiswebsite"
  | "oral-health-pass"
  | "individuell";

const IMG = {
  smilescan:
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1800&q=82",
  aligner:
    "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1800&q=82",
  implantologie:
    "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1800&q=82",
  aesthetik:
    "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1800&q=82",
  prophylaxe:
    "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1800&q=82",
  kinder:
    "https://images.unsplash.com/photo-1631217868264-e5b1a5fe1c89?auto=format&fit=crop&w=1800&q=82",
  parodontologie:
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1800&q=82",
  karriere:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=82",
  praxiswebsite:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1800&q=82",
  oralHealth:
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=82",
  default:
    "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1800&q=82",
} as const;

type CategoryBlueprint = {
  headline: string;
  subheadline: string;
  eyebrow: string;
  cta: string;
  heroImage: string;
  secondaryImage: string;
  valueProps: readonly string[];
};

const CATEGORY_BLUEPRINT: Record<InquiryCategoryKey, CategoryBlueprint> = {
  smilescan: {
    eyebrow: "Digitale Ersteinschätzung",
    headline: "Ihre SmileScan Landingpage",
    subheadline: "Strukturierter Patienteneinstieg — ruhig geführt, medizinisch seriös.",
    cta: "Ersteinschätzung starten",
    heroImage: IMG.smilescan,
    secondaryImage: IMG.prophylaxe,
    valueProps: ["Geführter Einstieg", "Qualifizierte Anfragen", "Praxis-Workflow"],
  },
  aligner: {
    eyebrow: "Unsichtbare Zahnkorrektur",
    headline: "Aligner in Ihrer Praxis",
    subheadline: "Ästhetische Korrektur professionell erklärt — von der Neugier bis zur Beratung.",
    cta: "Aligner-Beratung anfragen",
    heroImage: IMG.aligner,
    secondaryImage: IMG.aesthetik,
    valueProps: ["Vertrauen aufbauen", "Klarer Beratungsweg", "Mobile Ansprache"],
  },
  implantologie: {
    eyebrow: "Implantologie",
    headline: "Implantate mit Vertrauen",
    subheadline: "Aufklärung, Erwartungen und qualifizierte Beratungstermine.",
    cta: "Beratungstermin vereinbaren",
    heroImage: IMG.implantologie,
    secondaryImage: IMG.smilescan,
    valueProps: ["Medizinische Seriosität", "Klare Patientenreise", "Vertrauensaufbau"],
  },
  aesthetik: {
    eyebrow: "Ästhetische Zahnmedizin",
    headline: "Ihr Smile Design",
    subheadline: "Bleaching, Veneers und Ästhetik — hochwertig, ohne Beauty-Optik.",
    cta: "Ästhetik-Beratung buchen",
    heroImage: IMG.aesthetik,
    secondaryImage: IMG.aligner,
    valueProps: ["Smile Design", "Erwartungsmanagement", "Diskrete Beratung"],
  },
  prophylaxe: {
    eyebrow: "Prophylaxe & PZR",
    headline: "Professionelle Zahnreinigung",
    subheadline: "Recall, Prävention und Patientenbindung — klar und vertrauensvoll.",
    cta: "PZR-Termin anfragen",
    heroImage: IMG.prophylaxe,
    secondaryImage: IMG.smilescan,
    valueProps: ["Recall digital", "PZR-Information", "Bestandskunden"],
  },
  kinderzahnheilkunde: {
    eyebrow: "Kinderzahnheilkunde",
    headline: "Zahnarzt für Familien",
    subheadline: "Warme Elternansprache — medizinisch professionell und einladend.",
    cta: "Kindertermin anfragen",
    heroImage: IMG.kinder,
    secondaryImage: IMG.prophylaxe,
    valueProps: ["Familienorientiert", "Erstbesuch erklärt", "Vertrauensvoll"],
  },
  parodontologie: {
    eyebrow: "Parodontologie",
    headline: "Parodontale Gesundheit",
    subheadline: "Parodontale Behandlung verständlich und seriös kommuniziert.",
    cta: "Beratung anfragen",
    heroImage: IMG.parodontologie,
    secondaryImage: IMG.implantologie,
    valueProps: ["Aufklärung", "Vertrauen", "Langfristige Betreuung"],
  },
  karriere: {
    eyebrow: "Team & Karriere",
    headline: "Arbeiten in Ihrer Praxis",
    subheadline: "Teamgewinnung mit klarer Praxisidentität und ruhigem Bewerbungsweg.",
    cta: "Jetzt bewerben",
    heroImage: IMG.karriere,
    secondaryImage: IMG.karriere,
    valueProps: ["Praxiskultur", "Klare Erwartungen", "Professioneller Auftritt"],
  },
  praxiswebsite: {
    eyebrow: "Praxiswebsite",
    headline: "Ihre Praxis online",
    subheadline: "Digitale Visitenkarte — ruhig, vertrauenswürdig, patientenorientiert.",
    cta: "Termin online buchen",
    heroImage: IMG.praxiswebsite,
    secondaryImage: IMG.aesthetik,
    valueProps: ["Vertrauen", "Terminbuchung", "Klare Struktur"],
  },
  "oral-health-pass": {
    eyebrow: "Oral Health Pass",
    headline: "Prävention für Institutionen",
    subheadline: "Programme für Betriebe, Schulen und Einrichtungen.",
    cta: "Programm anfragen",
    heroImage: IMG.oralHealth,
    secondaryImage: IMG.prophylaxe,
    valueProps: ["B2B-Prävention", "Skalierbar", "Professionell"],
  },
  individuell: {
    eyebrow: "Individuelle Kampagne",
    headline: "Ihre Landingpage",
    subheadline: "Maßgeschneidert für Ihren Schwerpunkt und Ihre Zielgruppe.",
    cta: "Beratung anfragen",
    heroImage: IMG.default,
    secondaryImage: IMG.praxiswebsite,
    valueProps: ["Individuelles Design", "Ihre Inhalte", "Medical Premium"],
  },
};

const GOAL_HEADLINE: Partial<Record<CampaignGoalId, string>> = {
  new_patients: "Mehr qualifizierte Neupatienten",
  implant_cases: "Mehr Implantat-Beratungen",
  aligner_cases: "Mehr Aligner-Anfragen",
  visibility: "Stärkere regionale Sichtbarkeit",
  website_relaunch: "Ihre Praxis neu im Web",
};

const TITLE_CATEGORY_MAP: Record<string, InquiryCategoryKey> = {
  parodontologie: "parodontologie",
  karriere: "karriere",
  "karriere landingpage": "karriere",
  praxiswebsite: "praxiswebsite",
  standort: "praxiswebsite",
  "oral health pass": "oral-health-pass",
};

export function resolveInquiryCategoryKey(
  solutionId: PracticeSolutionId,
  displayTitle: string
): InquiryCategoryKey {
  const normalized = displayTitle.trim().toLowerCase();
  const fromTitle = TITLE_CATEGORY_MAP[normalized];
  if (fromTitle) return fromTitle;

  if (solutionId === "individuell") {
    if (normalized.includes("parodont")) return "parodontologie";
    if (normalized.includes("karriere")) return "karriere";
    if (normalized.includes("praxis") || normalized.includes("website") || normalized.includes("standort")) {
      return "praxiswebsite";
    }
    return "individuell";
  }

  if (solutionId in CATEGORY_BLUEPRINT) {
    return solutionId as InquiryCategoryKey;
  }

  return "individuell";
}

export function labelForCampaignGoal(goal: CampaignGoalId | ""): string {
  return CAMPAIGN_GOAL_OPTIONS.find((o) => o.id === goal)?.label ?? "";
}

export type LandingPageDraft = {
  categoryKey: InquiryCategoryKey;
  practiceName: string;
  headline: string;
  subheadline: string;
  eyebrow: string;
  ctaLabel: string;
  heroImage: string;
  secondaryImage: string;
  highlights: string[];
  services: string[];
  doctorName: string;
  doctorRole: string;
  locationLine: string | null;
  hoursLine: string | null;
  phoneLine: string | null;
  slug: string;
};

function parseContentLines(content: string): string[] {
  return content
    .split(/\n|•|·|;/)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, 6);
}

function locationFromAddress(address: string | null | undefined): string | null {
  if (!address?.trim()) return null;
  const lines = address.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  return lines[lines.length - 1] ?? lines[0] ?? null;
}

export function buildLandingPageDraft(params: {
  solutionId: PracticeSolutionId;
  displayTitle: string;
  profile: PracticeSolutionInquiryContext;
  campaignGoal?: CampaignGoalId | "";
  topicHighlights?: string[];
}): LandingPageDraft {
  const categoryKey = resolveInquiryCategoryKey(params.solutionId, params.displayTitle);
  const blueprint = CATEGORY_BLUEPRINT[categoryKey] ?? CATEGORY_BLUEPRINT.individuell;
  const practiceName = params.profile.practiceName.trim() || "Ihre Praxis";

  const customLines = params.topicHighlights ?? [];
  const profileServices = params.profile.services?.length
    ? params.profile.services
    : params.profile.specializations ?? [];

  const services =
    customLines.length > 0
      ? customLines
      : profileServices.length > 0
        ? profileServices
        : [...blueprint.valueProps];

  const highlights =
    customLines.length > 0
      ? customLines.slice(0, 3)
      : params.profile.credentials?.length
        ? params.profile.credentials.slice(0, 3)
        : blueprint.valueProps.slice(0, 3);

  if (params.campaignGoal && labelForCampaignGoal(params.campaignGoal)) {
    const goalLabel = labelForCampaignGoal(params.campaignGoal);
    if (!highlights.includes(goalLabel)) {
      highlights.unshift(goalLabel);
    }
  }

  const displayTitle = params.displayTitle.trim();
  const goalHeadline = params.campaignGoal ? GOAL_HEADLINE[params.campaignGoal] : undefined;

  const headline = displayTitle || goalHeadline || blueprint.headline;

  const subheadline =
    params.profile.practiceSubtitle?.trim() ||
    params.profile.personalApproach?.trim()?.slice(0, 160) ||
    blueprint.subheadline;

  const doctorName =
    params.profile.doctorDisplayName?.trim() ||
    params.profile.contactName.trim() ||
    "Ihr Behandlungsteam";

  const doctorRole = [params.profile.doctorTitle, practiceName].filter(Boolean).join(" · ");

  return {
    categoryKey,
    practiceName,
    headline,
    subheadline,
    eyebrow: blueprint.eyebrow,
    ctaLabel: blueprint.cta,
    heroImage: blueprint.heroImage,
    secondaryImage: blueprint.secondaryImage,
    highlights,
    services,
    doctorName,
    doctorRole,
    locationLine: locationFromAddress(params.profile.practiceAddress),
    hoursLine: params.profile.practiceHours?.trim() || null,
    phoneLine: params.profile.contactPhone?.trim() || null,
    slug: practiceName.toLowerCase().replace(/\s+/g, "-").slice(0, 32) || "ihre-praxis",
  };
}
