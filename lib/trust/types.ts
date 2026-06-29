export type TrustTocItem = {
  id: string;
  title: string;
  level: 2 | 3;
};

export type TrustDocument = {
  slug: string;
  fileName: string;
  title: string;
  description: string;
  markdown: string;
  html: string;
  toc: TrustTocItem[];
  draftNotice: string | null;
};

export type TrustNavItem = {
  slug: string | null;
  href: string;
  label: string;
  description?: string;
};

export type TrustHomeCard = {
  slug: string;
  href: string;
  title: string;
  description: string;
  accent: "privacy" | "security" | "ai" | "terms" | "patient" | "imprint";
};
