import type { JournalMedicalCategoryId } from "@/lib/journal/journal-medical-categories";

export const CARE_CENTER_MODULE = {
  name: "Care Center",
  tagline: "Patientenwissen Ihrer Praxis.",
} as const;

export type CareCenterCategoryFilter = JournalMedicalCategoryId | "faq";

export type CareCenterStatusFilter = "drafts" | "published" | "ki" | "review";
