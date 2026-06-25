import type { PracticeSolutionId } from "@/lib/practice-solutions/catalog";

export type LandingCategory = {
  id: PracticeSolutionId | string;
  title: string;
  description: string;
  status: string;
  image: string;
  inquiryId: PracticeSolutionId;
  /** Bento-Span für asymmetrisches Grid */
  span?: "wide" | "tall";
};

export type PopularCampaign = {
  id: string;
  title: string;
  description: string;
  image: string;
  inquiryId: PracticeSolutionId;
};

export type ProcessStep = {
  step: string;
  title: string;
  description: string;
};

export type GalleryMockup = {
  id: string;
  label: string;
  image: string;
  device: "desktop" | "tablet" | "mobile";
};

export const LANDING_HERO = {
  eyebrow: "Kampagnen & Landingpages",
  title: "Digitale Patientengewinnung für moderne Zahnarztpraxen",
  lead: "Professionelle Landingpages, Kampagnen und digitale Behandlungskommunikation für mehr Sichtbarkeit, bessere Patientenaufklärung und nachhaltiges Praxiswachstum.",
  pillars: [
    { label: "Mehr Neupatienten", detail: "Gezielte Ansprache" },
    { label: "Bessere Aufklärung", detail: "Vertrauen vor dem Termin" },
    { label: "Weniger Telefonate", detail: "Qualifizierte Anfragen" },
  ],
} as const;

export const LANDING_CATEGORIES: readonly LandingCategory[] = [
  {
    id: "smilescan",
    title: "SmileScan",
    description: "Digitale Ersteinschätzung und strukturierter Patienteneinstieg.",
    status: "Beliebt",
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1400&q=80",
    inquiryId: "smilescan",
    span: "wide",
  },
  {
    id: "aligner",
    title: "Aligner",
    description: "Unsichtbare Zahnkorrektur professionell positioniert.",
    status: "Verfügbar",
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80",
    inquiryId: "aligner",
  },
  {
    id: "implantologie",
    title: "Implantologie",
    description: "Vertrauen aufbauen und Implantat-Beratungen qualifizieren.",
    status: "Verfügbar",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80",
    inquiryId: "implantologie",
  },
  {
    id: "aesthetik",
    title: "Ästhetische Zahnmedizin",
    description: "Bleaching, Veneers und Smile Design hochwertig erklärt.",
    status: "Verfügbar",
    image: "https://images.unsplash.com/photo-1629909613654-28e737c036b6?auto=format&fit=crop&w=1200&q=80",
    inquiryId: "aesthetik",
  },
  {
    id: "parodontologie",
    title: "Parodontologie",
    description: "Parodontale Gesundheit verständlich und seriös kommuniziert.",
    status: "Verfügbar",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80",
    inquiryId: "individuell",
  },
  {
    id: "kinderzahnheilkunde",
    title: "Kinderzahnheilkunde",
    description: "Warme Familienansprache ohne verspielte Template-Optik.",
    status: "Verfügbar",
    image: "https://images.unsplash.com/photo-1631217868264-e5b1a5fe1c89?auto=format&fit=crop&w=1200&q=80",
    inquiryId: "kinderzahnheilkunde",
  },
  {
    id: "prophylaxe",
    title: "Prophylaxe",
    description: "Recall, PZR und Prävention digital begleiten.",
    status: "Verfügbar",
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1200&q=80",
    inquiryId: "prophylaxe",
  },
  {
    id: "oral-health-pass",
    title: "Oral Health Pass",
    description: "Präventionsprogramme für Betriebe und Institutionen.",
    status: "Verfügbar",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
    inquiryId: "oral-health-pass",
  },
  {
    id: "praxiswebsite",
    title: "Praxiswebsite",
    description: "Ihre Praxis als digitale Visitenkarte — ruhig und vertrauenswürdig.",
    status: "Verfügbar",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    inquiryId: "individuell",
  },
  {
    id: "karriere",
    title: "Karriere Landingpage",
    description: "Teamgewinnung mit klarer Praxisidentität und Bewerbungsflow.",
    status: "Verfügbar",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    inquiryId: "individuell",
  },
  {
    id: "standort",
    title: "Standort Landingpage",
    description: "Lokale Sichtbarkeit und Anfahrt für neue Patientinnen.",
    status: "Verfügbar",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    inquiryId: "individuell",
  },
  {
    id: "patientenratgeber",
    title: "Patientenratgeber",
    description: "Aufklärung und Vertrauen durch hochwertige Inhalte.",
    status: "Verfügbar",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    inquiryId: "individuell",
  },
  {
    id: "vorher-nachher",
    title: "Vorher/Nachher Kampagne",
    description: "Ergebnisse zeigen — medizinisch seriös und rechtssicher.",
    status: "Verfügbar",
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80",
    inquiryId: "aesthetik",
  },
  {
    id: "individuelle-kampagne",
    title: "Individuelle Kampagne",
    description: "Maßgeschneidert für Ihren Schwerpunkt und Ihre Zielgruppe.",
    status: "Auf Anfrage",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80",
    inquiryId: "individuell",
  },
] as const;

export const POPULAR_CAMPAIGNS: readonly PopularCampaign[] = [
  {
    id: "aligner-campaign",
    title: "Unsichtbare Zahnkorrektur",
    description: "Qualifizierte Aligner-Anfragen mit klarer Erwartungshaltung.",
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1400&q=80",
    inquiryId: "aligner",
  },
  {
    id: "implant-same-day",
    title: "Feste Zähne an einem Tag",
    description: "Implantat-Patientinnen informieren und Beratungstermine anstoßen.",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1400&q=80",
    inquiryId: "implantologie",
  },
  {
    id: "pzr",
    title: "Professionelle Zahnreinigung",
    description: "Recall und PZR mit ruhiger, vertrauenswürdiger Ansprache.",
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1400&q=80",
    inquiryId: "prophylaxe",
  },
  {
    id: "implants",
    title: "Zahnimplantate",
    description: "Premium-Landing für Implantologie mit Aufklärung und Vertrauen.",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1400&q=80",
    inquiryId: "implantologie",
  },
  {
    id: "kids",
    title: "Kinderzahnmedizin",
    description: "Familienorientierte Kommunikation für Eltern und Kinder.",
    image: "https://images.unsplash.com/photo-1631217868264-e5b1a5fe1c89?auto=format&fit=crop&w=1400&q=80",
    inquiryId: "kinderzahnheilkunde",
  },
  {
    id: "aesthetic",
    title: "Ästhetische Zahnmedizin",
    description: "Bleaching und Smile Design ohne Beauty-Salon-Anmutung.",
    image: "https://images.unsplash.com/photo-1629909613654-28e737c036b6?auto=format&fit=crop&w=1400&q=80",
    inquiryId: "aesthetik",
  },
] as const;

export const LANDING_PROCESS_STEPS: readonly ProcessStep[] = [
  {
    step: "01",
    title: "Anfrage senden",
    description: "Sie wählen eine Landingpage oder Kampagne und senden Ihre Anfrage — wir melden uns persönlich.",
  },
  {
    step: "02",
    title: "Konzept erhalten",
    description: "Gemeinsam entwickeln wir Struktur, Inhalte und Patientenjourney passend zu Ihrer Praxis.",
  },
  {
    step: "03",
    title: "Landingpage veröffentlichen",
    description: "Nach Freigabe geht Ihre Seite live — integriert in Ihre digitale Praxiskommunikation.",
  },
] as const;

export const LANDING_GALLERY: readonly GalleryMockup[] = [
  {
    id: "g1",
    label: "SmileScan",
    device: "desktop",
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "g2",
    label: "Implantologie",
    device: "tablet",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "g3",
    label: "Aligner",
    device: "mobile",
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "g4",
    label: "Ästhetik",
    device: "desktop",
    image: "https://images.unsplash.com/photo-1629909613654-28e737c036b6?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "g5",
    label: "Prophylaxe",
    device: "tablet",
    image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "g6",
    label: "Kinderzahnheilkunde",
    device: "mobile",
    image: "https://images.unsplash.com/photo-1631217868264-e5b1a5fe1c89?auto=format&fit=crop&w=800&q=80",
  },
] as const;

export const LANDING_CUSTOM_FEATURES = [
  "Individuelles Design",
  "Eigene Inhalte",
  "SEO-Optimierung",
  "Terminbuchung",
  "SmileScan Integration",
  "Oral Health Pass Integration",
] as const;

export const LANDING_CLOSING = {
  title: "Bereit für mehr Sichtbarkeit?",
  lead: "Professionelle Landingpages und Kampagnen für moderne Zahnarztpraxen.",
} as const;
