export const PLATFORM_DESIGN_BRIEFING_SLUG = "internal-dental-ui-ux-v1" as const;

export type PlatformDesignBriefingAreaSlug =
  | "software_interfaces"
  | "website_structure"
  | "landingpages"
  | "partner_areas"
  | "patient_areas"
  | "pdf_views"
  | "visual_communication"
  | "image_selection"
  | "components"
  | "layouts"
  | "digital_brand";

export type PlatformDesignBriefing = {
  id: string;
  slug: string;
  title: string;
  version: number;
  status: "draft" | "active" | "archived";
  scope_label: string | null;
  target_audience: string | null;
  preamble_markdown: string | null;
  created_at: string;
  updated_at: string;
};

export type PlatformDesignBriefingSection = {
  id: string;
  briefing_id: string;
  section_number: number;
  slug: string;
  title: string;
  content_markdown: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PlatformDesignBriefingArea = {
  id: string;
  slug: PlatformDesignBriefingAreaSlug;
  title: string;
  description: string;
  sort_order: number;
  implementation_status: "pending" | "in_progress" | "review" | "done";
  implementation_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PlatformDesignBriefingBundle = {
  briefing: PlatformDesignBriefing;
  sections: PlatformDesignBriefingSection[];
  areas: PlatformDesignBriefingArea[];
  areaSectionNumbers: Record<PlatformDesignBriefingAreaSlug, number[]>;
};
