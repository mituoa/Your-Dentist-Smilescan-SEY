import { agbDocument, nutzungsbedingungenDocument } from "@/lib/legal/documents/commercial";
import {
  cookiesDocument,
  datenschutzDocument,
  patientenDatenschutzDocument,
} from "@/lib/legal/documents/privacy";
import {
  impressumDocument,
  kiGrundsaetzeDocument,
  meldenDocument,
} from "@/lib/legal/documents/other";
import type { LegalDocument, LegalHubEntry } from "@/lib/legal/types";

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  agbDocument,
  nutzungsbedingungenDocument,
  datenschutzDocument,
  cookiesDocument,
  impressumDocument,
  kiGrundsaetzeDocument,
  patientenDatenschutzDocument,
  meldenDocument,
];

export const LEGAL_SLUGS = LEGAL_DOCUMENTS.map((d) => d.slug);

const documentBySlug = new Map(LEGAL_DOCUMENTS.map((d) => [d.slug, d]));

export function getLegalDocument(slug: string): LegalDocument | undefined {
  return documentBySlug.get(slug);
}

export function isLegalSlug(slug: string): boolean {
  return documentBySlug.has(slug);
}

export const LEGAL_HUB_ENTRIES: LegalHubEntry[] = LEGAL_DOCUMENTS.map((doc) => ({
  slug: doc.slug,
  href: `/legal/${doc.slug}`,
  label: doc.hubLabel,
  description: doc.hubDescription,
}));

/** Footer-Spalte „Rechtliches“ */
export const LEGAL_FOOTER_LINKS = [
  { label: "Impressum", href: "/legal/impressum" },
  { label: "Datenschutz", href: "/legal/datenschutz" },
  { label: "Cookies", href: "/legal/cookies" },
  { label: "Nutzungsbedingungen", href: "/legal/nutzungsbedingungen" },
  { label: "KI-Grundsätze", href: "/legal/ki-grundsaetze" },
] as const;

export const LEGAL_VERSION_LABEL = "1.0";

export function mapContractVersionToLabel(contractVersion: string | null | undefined): string {
  const v = (contractVersion || "").trim();
  if (!v) return "—";
  if (v === "v1" || v === "1.0") return LEGAL_VERSION_LABEL;
  return v;
}
