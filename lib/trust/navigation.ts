import type { TrustHomeCard, TrustHomeSection, TrustNavItem } from "@/lib/trust/types";

export type TrustSlug =
  | "legal"
  | "privacy"
  | "terms"
  | "cookies"
  | "ai-principles"
  | "security"
  | "patient-privacy"
  | "imprint"
  | "dpa";

type TrustDocMeta = {
  slug: TrustSlug;
  fileName: string;
  description: string;
  navLabel: string;
  showInNav: boolean;
};

export const TRUST_DOC_META: TrustDocMeta[] = [
  {
    slug: "legal",
    fileName: "00-overview.md",
    description: "Überblick über alle rechtlichen Dokumente und Verantwortlichkeiten.",
    navLabel: "Rechtliche Übersicht",
    showInNav: false,
  },
  {
    slug: "privacy",
    fileName: "01-datenschutz.md",
    description: "Wie Your Dentist personenbezogene Daten und Gesundheitsdaten verarbeitet.",
    navLabel: "Datenschutz",
    showInNav: true,
  },
  {
    slug: "terms",
    fileName: "02-nutzungsbedingungen.md",
    description: "Regeln für Praxen, Nutzer und Plattformzugang.",
    navLabel: "Nutzungsbedingungen",
    showInNav: true,
  },
  {
    slug: "cookies",
    fileName: "03-cookie-richtlinie.md",
    description: "Einsatz und Verwaltung von Cookies auf der Plattform.",
    navLabel: "Cookies",
    showInNav: true,
  },
  {
    slug: "ai-principles",
    fileName: "04-ki-grundsaetze.md",
    description: "Wie Command AI unterstützt, ohne medizinische Entscheidungen zu treffen.",
    navLabel: "KI-Grundsätze",
    showInNav: true,
  },
  {
    slug: "security",
    fileName: "07-security.md",
    description: "Technische und organisatorische Maßnahmen zum Schutz der Plattform.",
    navLabel: "Sicherheit",
    showInNav: true,
  },
  {
    slug: "patient-privacy",
    fileName: "05-patienten-datenschutz.md",
    description: "Informationen für Patienten, QR-Code-Nutzung, Uploads und Portalzugriff.",
    navLabel: "Patienten-Datenschutz",
    showInNav: true,
  },
  {
    slug: "imprint",
    fileName: "06-impressum.md",
    description: "Rechtliche Anbieterinformationen.",
    navLabel: "Impressum",
    showInNav: true,
  },
  {
    slug: "dpa",
    fileName: "08-auftragsverarbeitungsvertrag.md",
    description: "Vertragsmuster zur Auftragsverarbeitung nach Art. 28 DSGVO für Praxen.",
    navLabel: "Auftragsverarbeitung",
    showInNav: true,
  },
];

export const TRUST_SLUGS = TRUST_DOC_META.map((c) => c.slug);

const metaBySlug = new Map(TRUST_DOC_META.map((c) => [c.slug, c]));

export function isTrustSlug(slug: string): slug is TrustSlug {
  return metaBySlug.has(slug as TrustSlug);
}

export function getTrustDocMeta(slug: TrustSlug) {
  const meta = metaBySlug.get(slug);
  if (!meta) throw new Error(`Trust document meta not found: ${slug}`);
  return meta;
}

export const TRUST_NAV_ITEMS: TrustNavItem[] = [
  { slug: null, href: "/trust", label: "Übersicht" },
  ...TRUST_DOC_META.filter((c) => c.showInNav).map((c) => ({
    slug: c.slug,
    href: `/trust/${c.slug}`,
    label: c.navLabel,
  })),
];

export const TRUST_HOME_CARDS: TrustHomeCard[] = [
  {
    slug: "privacy",
    href: "/trust/privacy",
    title: "Datenschutz",
    description: "Wie Your Dentist personenbezogene Daten und Gesundheitsdaten verarbeitet.",
    accent: "privacy",
  },
  {
    slug: "security",
    href: "/trust/security",
    title: "Sicherheit",
    description: "Technische und organisatorische Maßnahmen zum Schutz der Plattform.",
    accent: "security",
  },
  {
    slug: "ai-principles",
    href: "/trust/ai-principles",
    title: "KI-Grundsätze",
    description: "Wie Command AI unterstützt, ohne medizinische Entscheidungen zu treffen.",
    accent: "ai",
  },
  {
    slug: "terms",
    href: "/trust/terms",
    title: "Nutzungsbedingungen",
    description: "Regeln für Praxen, Nutzer und Plattformzugang.",
    accent: "terms",
  },
  {
    slug: "patient-privacy",
    href: "/trust/patient-privacy",
    title: "Patienten-Datenschutz",
    description: "Informationen für Patienten, QR-Code-Nutzung, Uploads und Portalzugriff.",
    accent: "patient",
  },
  {
    slug: "imprint",
    href: "/trust/imprint",
    title: "Impressum",
    description: "Rechtliche Anbieterinformationen.",
    accent: "imprint",
  },
  {
    slug: "cookies",
    href: "/trust/cookies",
    title: "Cookies",
    description: "Einsatz und Verwaltung von Cookies auf der Plattform.",
    accent: "cookies",
  },
  {
    slug: "dpa",
    href: "/trust/dpa",
    title: "Auftragsverarbeitung",
    description: "Vertragsmuster zur Auftragsverarbeitung nach Art. 28 DSGVO für Praxen.",
    accent: "dpa",
  },
];

export const TRUST_HOME_SECTIONS: TrustHomeSection[] = [
  {
    id: "platform",
    kicker: "Plattform",
    slugs: ["privacy", "security", "ai-principles"],
  },
  {
    id: "patients",
    kicker: "Patienten",
    slugs: ["patient-privacy"],
  },
  {
    id: "legal",
    kicker: "Rechtliches",
    slugs: ["terms", "cookies", "imprint", "dpa"],
  },
];

export const TRUST_FOOTER_LINK = {
  label: "Trust Center",
  href: "/trust",
} as const;

export const TRUST_DOCUMENT_LINKS = TRUST_DOC_META.map((c) => ({
  label: c.navLabel,
  href: `/trust/${c.slug}`,
}));

/** Legacy /legal slug → /trust slug */
export const LEGAL_TO_TRUST_REDIRECTS: Record<string, string> = {
  agb: "/trust/terms",
  nutzungsbedingungen: "/trust/terms",
  datenschutz: "/trust/privacy",
  cookies: "/trust/cookies",
  impressum: "/trust/imprint",
  "ki-grundsaetze": "/trust/ai-principles",
  "patienten-datenschutz": "/trust/patient-privacy",
  avv: "/trust/dpa",
  auftragsverarbeitung: "/trust/dpa",
  melden: "/trust/legal",
};

export {
  TRUST_VERSION_LABEL,
  mapContractVersionToLabel,
} from "@/lib/trust/meta";
