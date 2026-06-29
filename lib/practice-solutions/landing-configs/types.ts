import type { PracticeSolutionId } from "@/lib/practice-solutions/catalog";
import type { PracticeSolutionInquiryContext } from "@/lib/practice-solutions/inquiry-context";

export type LandingConfigId =
  | "aligner"
  | "implantologie"
  | "oral-health-pass"
  | "bleaching"
  | "kinderzahnheilkunde"
  | "smilescan"
  | "prophylaxe"
  | "parodontologie"
  | "endodontie"
  | "aesthetik"
  | "individuell"
  | "praxiswebsite"
  | "karriere";

export type LandingFieldOption = {
  id: string;
  label: string;
  description?: string;
};

/** Progressive configurator sequence (notes is a separate modal section). */
export type ConfiguratorStepId = "product" | "services" | "audience" | "goal";

export type LandingFieldDef =
  | {
      id: string;
      type: "radio";
      label: string;
      description?: string;
      options: readonly LandingFieldOption[];
      defaultValue: string;
    }
  | {
      id: string;
      type: "checkbox";
      label: string;
      description?: string;
      options: readonly LandingFieldOption[];
      defaultSelected?: readonly string[];
      optional?: boolean;
      supplementText?: {
        id: string;
        label: string;
        placeholder?: string;
      };
    }
  | {
      id: string;
      type: "text";
      label: string;
      description?: string;
      hint?: string;
      optional?: boolean;
      placeholder?: string;
    };

export type LandingPreviewBlueprint = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  heroImage: string;
  secondaryImage: string;
  defaultCta: string;
  trustBullets: readonly string[];
};

export type LandingPageConfig = {
  id: LandingConfigId;
  productName: string;
  modalTitle: string;
  solutionId: PracticeSolutionId;
  fields: readonly LandingFieldDef[];
  preview: LandingPreviewBlueprint & {
    headlineByRadio?: Record<string, Record<string, string>>;
    subheadlineByRadio?: Record<string, Record<string, string>>;
    eyebrowByRadio?: Record<string, Record<string, string>>;
    heroByRadio?: Record<string, Record<string, string>>;
    heroByCheckbox?: Record<string, Record<string, string>>;
    ctaByRadio?: Record<string, Record<string, string>>;
    trustByRadio?: Record<string, Record<string, readonly string[]>>;
    testimonialByRadio?: Record<string, Record<string, { quote: string; author: string }>>;
  };
};

export type LandingFieldValues = {
  radio: Record<string, string>;
  checkbox: Record<string, string[]>;
  text: Record<string, string>;
};

export type LandingPreviewDraft = {
  practiceName: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  heroImage: string;
  secondaryImage: string;
  highlights: string[];
  services: string[];
  trustBadges: string[];
  testimonialQuote: string | null;
  testimonialAuthor: string | null;
  doctorName: string;
  doctorRole: string;
  locationLine: string | null;
  hoursLine: string | null;
  phoneLine: string | null;
  slug: string;
};

export type BuildPreviewParams = {
  config: LandingPageConfig;
  values: LandingFieldValues;
  profile: PracticeSolutionInquiryContext;
};
