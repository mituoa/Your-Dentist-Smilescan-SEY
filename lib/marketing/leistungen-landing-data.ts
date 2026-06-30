/**
 * Leistungs-Landingpage — patientenverständliche Hauptbereiche.
 * Struktur orientiert an etablierten Praxis-Websites (z. B. Carrée Dental)
 * und ergänzt um branchenübliche Schwerpunkte (SEO/Recherche 2025/26).
 */

export type LeistungItem = {
  label: string;
  /** Häufig gesuchtes Leistungs-Keyword — visuell hervorgehoben */
  featured?: boolean;
};

export type LeistungenPillar = {
  id: string;
  title: string;
  intro: string;
  image: string;
  imageAlt: string;
  services: LeistungItem[];
};

export const LEISTUNGEN_LANDING_META = {
  practiceName: "Carree Dental",
  city: "Köln Brück",
  phoneDisplay: "0221 9842700",
  phoneHref: "tel:+492219842700",
  contactUrl: "https://carree-dental.de/kontakt/",
  appointmentUrl: "https://carree-dental.de/online-termin/",
  address: "Brücker Mauspfad 611, 51109 Köln (Brück)",
  heroTitle: "Unser Leistungsspektrum",
  heroLead:
    "Von Prophylaxe und Zahnerhalt über Ästhetik bis Implantologie — strukturiert, verständlich und auf Ihre Situation ausgerichtet.",
} as const;

/** Vier Säulen wie auf typischen Zahnarzt-Leistungsseiten — plus ergänzte Standardthemen. */
export const LEISTUNGEN_PILLARS: LeistungenPillar[] = [
  {
    id: "praxis",
    title: "Das zeichnet uns aus",
    intro:
      "Technik, Team und besondere Betreuung — für Patientinnen und Patienten, die mehr als Standard erwarten.",
    image: "/landingpages/aligner/practice-room.jpg",
    imageAlt: "Moderner Behandlungsraum bei Carree Dental",
    services: [
      { label: "Unsichtbare Zahnspange (Aligner & Invisalign®)", featured: true },
      { label: "Behandlung von Angstpatienten", featured: true },
      { label: "Kinderzahnheilkunde", featured: true },
      { label: "Digitale Röntgen- & DVT-Diagnostik" },
      { label: "Behandlung in Narkose & Sedierung (Lachgas)" },
      { label: "Dentale CAD/CAM-Technik" },
      { label: "Eigenes Dentallabor" },
      { label: "Biologische Zahnmedizin" },
      { label: "Zweitmeinung & strukturierte Beratung" },
      { label: "Hausbesuch nach Absprache" },
    ],
  },
  {
    id: "gesund",
    title: "Gesunde Zähne",
    intro:
      "Vorsorge, Erhalt und gezielte Therapie — damit Ihre Zähne lange gesund und belastbar bleiben.",
    image: "/landingpages/aligner/dr-andersson.jpg",
    imageAlt: "Zahnärztliche Beratung bei Carree Dental",
    services: [
      { label: "Prophylaxe & professionelle Zahnreinigung", featured: true },
      { label: "Kieferorthopädie", featured: true },
      { label: "CMD-Behandlung & Aufbissschiene", featured: true },
      { label: "Schnarchschiene & Schlafmedizin" },
      { label: "Sportmundschutz (individuell)" },
      { label: "Parodontologie & Zahnfleischbehandlung" },
      { label: "Endodontie (Wurzelbehandlung)" },
      { label: "Zahnhalsbehandlung & sensible Zähne" },
      { label: "Wurzelspitzenresektion" },
      { label: "Weisheitszahn- & Oralchirurgie" },
      { label: "Notfall- & Akutbehandlung" },
      { label: "Parodontale Nachsorge (UPT)" },
    ],
  },
  {
    id: "schoen",
    title: "Schöne Zähne",
    intro:
      "Ästhetik mit medizinischem Anspruch — natürlich wirkend, planbar und auf Ihr Gesicht abgestimmt.",
    image: "/landingpages/aligner/hero-lifestyle.png",
    imageAlt: "Selbstbewusstes Lächeln nach ästhetischer Zahnbehandlung",
    services: [
      { label: "Ästhetische Zahnmedizin", featured: true },
      { label: "Invisalign® & transparente Aligner", featured: true },
      { label: "Bleaching (In-Office & Home)", featured: true },
      { label: "Veneers (Vollkeramik)" },
      { label: "Inlays & Onlays" },
      { label: "Komposit-Bonding & Frontzahnkorrektur" },
      { label: "Ästhetische Zahnfleischkorrektur" },
      { label: "Smile Design & digitale Vorschau" },
      { label: "Non-Prep-Veneers nach Eignung" },
    ],
  },
  {
    id: "neu",
    title: "Neue Zähne",
    intro:
      "Fester Zahnersatz und Implantate — von der Einzelversorgung bis zur vollständigen Rehabilitation.",
    image: "/landingpages/aligner/team-banner.png",
    imageAlt: "Team und moderne Ausstattung bei Carree Dental",
    services: [
      { label: "Implantologie", featured: true },
      { label: "All-on-4 — feste Zähne in kurzer Zeit", featured: true },
      { label: "CEREC / Krone am selben Tag", featured: true },
      { label: "Keramikimplantate" },
      { label: "Zygoma-Implantate" },
      { label: "Chairside-Kronen & Brücken" },
      { label: "Totale Sanierung & Vollversorgung" },
      { label: "Abdruckfreie Prothetik (Digitalscan)" },
      { label: "Knochenaufbau & Sinuslift" },
      { label: "Implantatgetragener Zahnersatz" },
      { label: "Navigierte Implantation" },
    ],
  },
];

/** Ergänzende Leistungen, die auf Übersichtsseiten häufig separat gesucht werden. */
export const LEISTUNGEN_HIGHLIGHTS = [
  {
    title: "Kinder & Familie",
    text: "Kinderprophylaxe, Fissurenversiegelung, milchzahnfreundliche Behandlung und einfühlsame Betreuung.",
  },
  {
    title: "Angst & Sedierung",
    text: "Ruhige Abläufe, Zeit für Fragen, Lachgas-Sedierung und Narkose nach individueller Eignung.",
  },
  {
    title: "Digitale Diagnostik",
    text: "Intraoralscan, DVT/CBCT und 3D-Planung für präzise Therapieentscheidungen.",
  },
  {
    title: "Parodontologie",
    text: "Behandlung von Parodontitis, Rezessionen und periimplantären Entzündungen.",
  },
  {
    title: "CMD & Funktion",
    text: "Kiefergelenkbeschwerden, Aufbissschienen und funktionelle Bissanalyse.",
  },
  {
    title: "Notfall",
    text: "Akute Zahnschmerzen, Trauma und dringende Einschätzung — bitte telefonisch anmelden.",
  },
] as const;

export const LEISTUNGEN_FAQ = [
  {
    q: "Wie finde ich die passende Behandlung für mich?",
    a: "Im Erstgespräch klären wir Beschwerden, Ziele und Behandlungsoptionen. Sie erhalten eine verständliche Einschätzung — ohne verfrühte Versprechen vor der Untersuchung.",
  },
  {
    q: "Bieten Sie auch Behandlung für Angstpatienten an?",
    a: "Ja. Wir nehmen uns Zeit, erklären jeden Schritt und bieten nach Eignung Sedierung oder Behandlung in Narkose an.",
  },
  {
    q: "Was ist der Unterschied zwischen Prophylaxe und professioneller Zahnreinigung?",
    a: "Die PZR entfernt Beläge und Verfärbungen an schwer erreichbaren Stellen. Prophylaxe umfasst zusätzlich individuelle Beratung zur häuslichen Pflege und Vorsorge.",
  },
  {
    q: "Wie läuft eine Implantat-Beratung ab?",
    a: "Nach Diagnostik (oft inkl. 3D-Bildgebung) besprechen wir Varianten, Ablauf, Risiken und den zeitlichen Rahmen. Ein verbindlicher Plan entsteht erst nach Ihrer Einwilligung.",
  },
  {
    q: "Kann ich online einen Termin buchen?",
    a: "Ja — über unsere Online-Terminbuchung oder telefonisch. Für Notfälle rufen Sie bitte direkt an.",
  },
] as const;
