import type { JournalMedicalCategoryId } from "@/lib/journal/journal-medical-categories";

export const KNOWLEDGE_HUB_MODULE = {
  name: "Knowledge Hub",
  tagline: "Das Wissenszentrum Ihrer Praxis.",
  lead: "Patientenaufklärung, KI-Assistent, Landingpages und Patientenportal — alles aus einer Quelle.",
} as const;

export type KnowledgeHubSectionId =
  | "articles"
  | "ai"
  | "templates"
  | "categories"
  | "analytics"
  | "drafts";

export const KNOWLEDGE_HUB_SECTIONS: {
  id: KnowledgeHubSectionId;
  label: string;
  anchor: string;
}[] = [
  { id: "articles", label: "Artikel", anchor: "kh-articles" },
  { id: "ai", label: "KI-Assistent", anchor: "kh-ai" },
  { id: "templates", label: "Vorlagen", anchor: "kh-templates" },
  { id: "categories", label: "Kategorien", anchor: "kh-categories" },
  { id: "analytics", label: "Einblicke", anchor: "kh-analytics" },
  { id: "drafts", label: "Entwürfe", anchor: "kh-drafts" },
];

export type KnowledgeTemplateBundle = {
  id: string;
  title: string;
  description: string;
  categoryId: JournalMedicalCategoryId;
  topics: string[];
};

export const KNOWLEDGE_TEMPLATE_BUNDLES: KnowledgeTemplateBundle[] = [
  {
    id: "implantology",
    title: "Implantologie",
    description: "Professionelles Nachsorge-Paket nach Implantation.",
    categoryId: "implantologie",
    topics: ["Heilung", "Schmerzen", "Medikation", "Rauchen", "Sport", "Ernährung"],
  },
  {
    id: "aligners",
    title: "Aligner",
    description: "Alles rund um Schienen, Tragezeit und Pflege.",
    categoryId: "aligner",
    topics: ["Reinigung", "Tragezeit", "Schmerzen", "Retainer"],
  },
  {
    id: "bleaching",
    title: "Bleaching",
    description: "Aufklärung und Nachsorge nach Aufhellung.",
    categoryId: "bleaching",
    topics: ["Kaffee", "Rauchen", "Empfindlichkeit", "Pflege"],
  },
];

export type KnowledgeSuggestion = {
  id: string;
  question: string;
  categoryLabel: string;
  inspirationSlug?: string;
};
