export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  slug: string;
  title: string;
  hubLabel: string;
  hubDescription: string;
  sections: LegalSection[];
};

export type LegalHubEntry = {
  slug: string;
  href: string;
  label: string;
  description: string;
};
