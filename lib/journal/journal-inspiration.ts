import type { JournalMedicalCategoryId } from "@/lib/journal/journal-medical-categories";
import { generateGuidedDraftMarkdown } from "@/lib/journal/guided-drafts";
import type { JournalEditorialCard } from "@/lib/journal/journal-v2-model";

export type JournalInspirationArticle = {
  slug: string;
  categoryId: JournalMedicalCategoryId;
  categoryLabel: string;
  title: string;
  excerpt: string;
  draftTitle: string;
  featured?: boolean;
};

export const JOURNAL_INSPIRATION_ARTICLES: JournalInspirationArticle[] = [
  {
    slug: "verhalten-nach-implantation",
    categoryId: "implantologie",
    categoryLabel: "Implantologie",
    title: "Verhalten nach Implantation",
    excerpt:
      "Wie lange darf ich keinen Kaffee trinken, wann Sport wieder möglich ist und wann Sie uns kontaktieren sollten.",
    draftTitle: "Was sollte ich nach dem Eingriff beachten?",
    featured: true,
  },
  {
    slug: "schmerzen-nach-op",
    categoryId: "chirurgie",
    categoryLabel: "Chirurgie",
    title: "Schmerzen nach OP",
    excerpt:
      "Was normal ist, welche Schmerzmittel helfen und wann ein stärkeres Nachsorgegespräch sinnvoll wird.",
    draftTitle: "Was sollte ich nach dem Eingriff beachten?",
  },
  {
    slug: "sport-nach-implantat",
    categoryId: "nachsorge",
    categoryLabel: "Nachsorge",
    title: "Sport nach Implantat",
    excerpt:
      "Wann Sie wieder trainieren dürfen, worauf Sie achten sollten und wie Sie Komplikationen vermeiden.",
    draftTitle: "Was sollte ich nach dem Eingriff beachten?",
  },
  {
    slug: "invisalign-reinigen",
    categoryId: "aligner",
    categoryLabel: "Aligner",
    title: "Invisalign reinigen",
    excerpt:
      "Schienenpflege im Alltag, typische Fehler und wie Patienten ihre Aligner hygienisch halten.",
    draftTitle: "Wie läuft eine professionelle Zahnreinigung ab?",
  },
  {
    slug: "bleaching-hinweise",
    categoryId: "bleaching",
    categoryLabel: "Bleaching",
    title: "Bleaching Hinweise",
    excerpt:
      "Vorbereitung, Erwartungen, Empfindlichkeit und was Patienten in den ersten Tagen vermeiden sollten.",
    draftTitle: "Wie läuft eine professionelle Zahnreinigung ab?",
  },
];

export function inspirationToEditorialCard(
  item: JournalInspirationArticle,
  authorLabel: string
): JournalEditorialCard & { isInspiration: true; inspirationSlug: string } {
  return {
    id: `inspiration-${item.slug}`,
    categoryId: item.categoryId,
    categoryLabel: item.categoryLabel,
    title: item.title,
    excerpt: item.excerpt,
    statusLabel: "Vorlage",
    updatedLabel: "Bereit zum Start",
    authorLabel,
    coverUrl: null,
    editHref: "/journal/new",
    previewHref: null,
    isDraft: true,
    isInspiration: true,
    inspirationSlug: item.slug,
  };
}

export function inspirationDraftMarkdown(item: JournalInspirationArticle): string {
  return generateGuidedDraftMarkdown(item.draftTitle) || item.excerpt;
}

export function getFeaturedInspiration(): JournalInspirationArticle {
  return JOURNAL_INSPIRATION_ARTICLES.find((a) => a.featured) ?? JOURNAL_INSPIRATION_ARTICLES[0]!;
}
