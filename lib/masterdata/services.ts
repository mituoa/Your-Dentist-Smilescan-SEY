export interface ServiceOption {
  id: string;
  label: string;
}

export interface ServiceGroup {
  id: string;
  label: string;
  services: ServiceOption[];
}

export const SERVICE_MASTER: ServiceGroup[] = [
  {
    id: "prophylaxis",
    label: "Prophylaxe & Professionelle Zahnreinigung",
    services: [
      { id: "pzr", label: "Professionelle Zahnreinigung (PZR)" },
      { id: "prophylaxis-session", label: "Individualisierte Prophylaxe" },
      { id: "fluoridation", label: "Fluoridierung" },
      { id: "fissure-sealing-adult", label: "Fissurenversiegelung" },
      { id: "oral-hygiene-instruction", label: "Mundhygiene-Instruktion" },
      { id: "periodontal-maintenance", label: "Parodontale Nachsorge (UPT)" },
      { id: "halitosis-therapy", label: "Mundgeruch-Therapie" },
    ],
  },
  {
    id: "a",
    label: "Vorsorge & Diagnostik",
    services: [
      { id: "checkup", label: "Kontrolluntersuchung" },
      { id: "second-opinion", label: "Zweitmeinung" },
      { id: "digital-diagnostics", label: "Digitale Diagnostik" },
      { id: "intraoral-scan", label: "Intraoralscan / Digitaler Abdruck" },
      { id: "xray", label: "Röntgendiagnostik" },
      { id: "cbct", label: "DVT / CBCT" },
      { id: "caries-check", label: "Kariesdiagnostik" },
      { id: "laser-caries-detection", label: "Laser-Kariesdiagnostik" },
      { id: "perio-screening", label: "Parodontaler Screening-Check" },
      { id: "mucosa-check", label: "Mundschleimhaut-Check" },
      { id: "bite-analysis", label: "Okklusions- / Bissanalyse" },
      { id: "emergency", label: "Notfall- / Akutbeurteilung" },
    ],
  },
  {
    id: "b",
    label: "Zahnerhalt / Restaurative Behandlungen",
    services: [
      { id: "fillings", label: "Füllungstherapie" },
      { id: "composite-buildup", label: "Kompositaufbau" },
      { id: "inlays", label: "Inlays / Onlays" },
      { id: "ceramic-inlays", label: "Keramikinlays" },
      { id: "crowns", label: "Kronen" },
      { id: "zirconia-crowns", label: "Zirkonkronen" },
      { id: "bridges", label: "Brücken" },
      { id: "prosthesis-planning", label: "Zahnersatzplanung" },
      { id: "dental-restoration", label: "Zahnsanierung" },
      { id: "reconstruction", label: "Rekonstruktion geschädigter Zähne" },
      { id: "full-mouth", label: "Vollmundrehabilitation" },
      { id: "adhesive-dentistry", label: "Adhäsive Restaurationen" },
    ],
  },
  {
    id: "c",
    label: "Wurzelbehandlung / Endodontie",
    services: [
      { id: "root-canal", label: "Wurzelkanalbehandlung" },
      { id: "single-visit-endo", label: "Einzeit-Wurzelbehandlung" },
      { id: "revision", label: "Revisionsbehandlung" },
      { id: "trauma-teeth", label: "Behandlung traumatisierter Zähne" },
      { id: "immature-teeth", label: "Behandlung unreifer Zähne" },
      { id: "endo-surgery", label: "Endodontische Chirurgie" },
      { id: "microscopic-endo", label: "Mikroskopische Endodontie" },
    ],
  },
  {
    id: "d",
    label: "Zahnfleisch / Parodontologie",
    services: [
      { id: "perio-treatment", label: "Parodontalbehandlung" },
      { id: "parodontitis-therapy", label: "Parodontitistherapie" },
      { id: "gum-treatment", label: "Zahnfleischbehandlung" },
      { id: "gum-corrections", label: "Zahnfleischkorrekturen" },
      { id: "regeneration", label: "Regeneration von Hart- und Weichgewebe" },
      { id: "recession", label: "Rezessionsbehandlung / Weichgewebsaufbau" },
      { id: "gum-grafting", label: "Schleimhauttransplantat" },
      { id: "periimplantitis", label: "Periimplantitis-Behandlung" },
      { id: "laser-perio", label: "Laser-Parodontaltherapie" },
      { id: "perio-aftercare", label: "Parodontale Nachsorge" },
    ],
  },
  {
    id: "e",
    label: "Implantologie",
    services: [
      { id: "implant-consultation", label: "Implantatberatung" },
      { id: "implant-planning", label: "Implantatplanung" },
      { id: "single-implant", label: "Einzelimplantat" },
      { id: "implant-crown", label: "Implantatkrone" },
      { id: "guided-implant-surgery", label: "Navigierte Implantation" },
      { id: "implant-placement", label: "Implantatsetzung" },
      { id: "immediate-implant", label: "Sofortimplantation" },
      { id: "implant-prosthesis", label: "Implantatgetragener Zahnersatz" },
      { id: "all-on-4", label: "All-on-4 / Vollversorgung auf Implantaten" },
      { id: "bone-augmentation", label: "Knochenaufbau" },
      { id: "sinuslift", label: "Sinuslift" },
      { id: "perimplant-aftercare", label: "Periimplantäre Nachsorge" },
    ],
  },
  {
    id: "f",
    label: "Kieferorthopädie",
    services: [
      { id: "fixed-braces", label: "Feste Zahnspange" },
      { id: "removable-braces", label: "Herausnehmbare Zahnspange" },
      { id: "aligners", label: "Aligner" },
      { id: "early-treatment", label: "Frühbehandlung" },
      { id: "bite-correction", label: "Bisskorrektur" },
      { id: "retention", label: "Retention / Retainer" },
      { id: "adult-ortho", label: "Erwachsenen-KFO" },
      { id: "surgical-ortho", label: "Freilegung verlagerter Zähne" },
    ],
  },
  {
    id: "g",
    label: "Oralchirurgie",
    services: [
      { id: "wisdom-extraction", label: "Weisheitszahnentfernung" },
      { id: "surgical-extraction", label: "Operative Zahnentfernung" },
      { id: "impacted-removal", label: "Entfernung verlagerter Zähne" },
      { id: "exposure", label: "Freilegung retinierter Zähne" },
      { id: "apicoectomy", label: "Wurzelspitzenresektion" },
      { id: "cyst-removal", label: "Zystenentfernung" },
      { id: "biopsy", label: "Biopsie" },
      { id: "frenectomy", label: "Frenektomie" },
      { id: "preprosthetic", label: "Präprothetische Chirurgie" },
      { id: "implant-preparation", label: "Chirurgische Implantatvorbereitung" },
    ],
  },
  {
    id: "h",
    label: "Kinderzahnheilkunde",
    services: [
      { id: "pediatric-prophylaxis", label: "Kinderprophylaxe" },
      { id: "fissure-sealing", label: "Fissurenversiegelung" },
      { id: "milk-teeth", label: "Milchzahnbehandlung" },
      { id: "pediatric-crowns", label: "Kinderkronen" },
      { id: "pulp-therapy", label: "Pulpatherapie bei Kindern" },
      { id: "space-maintainer", label: "Platzhaltertherapie" },
      { id: "pediatric-trauma", label: "Kindertrauma" },
      { id: "pediatric-sedation", label: "Sedierung / Narkose für Kinder" },
    ],
  },
  {
    id: "i",
    label: "Oralmedizin / Schleimhaut / Schmerz",
    services: [
      { id: "mucosa-diseases", label: "Mundschleimhauterkrankungen" },
      { id: "burning-mouth", label: "Brennender Mund" },
      { id: "salivary-glands", label: "Speicheldrüsenerkrankungen" },
      { id: "tmd", label: "TMD / Kiefergelenkbeschwerden" },
      { id: "splint-therapy", label: "Aufbissschiene / CMD-Therapie" },
      { id: "night-guard", label: "Knirscherschiene" },
      { id: "facial-pain", label: "Gesichtsschmerz" },
      { id: "orofacial-pain-diag", label: "Orofaziale Schmerzdiagnostik" },
      { id: "snoring-splint", label: "Schnarchschiene" },
    ],
  },
  {
    id: "j",
    label: "Sedierung / Anästhesie",
    services: [
      { id: "laughing-gas", label: "Lachgas / Sedierung" },
      { id: "iv-sedation", label: "Intravenöse Sedierung" },
      { id: "general-anesthesia", label: "Behandlung in Narkose" },
      { id: "anxiety-patients", label: "Angstpatienten-Behandlung" },
    ],
  },
  {
    id: "k",
    label: "Besondere Patientengruppen",
    services: [
      { id: "anxiety-special", label: "Behandlung von Angstpatienten" },
      { id: "seniors", label: "Behandlung von Senioren" },
      { id: "disability", label: "Behandlung von Menschen mit Behinderung" },
      {
        id: "complex-medical",
        label: "Behandlung medizinisch komplexer Patienten",
      },
      { id: "home-visits", label: "Hausbesuch / Heimversorgung" },
    ],
  },
  {
    id: "l",
    label: "Ästhetische Zahnmedizin",
    services: [
      { id: "bleaching", label: "Bleaching" },
      { id: "in-office-bleaching", label: "In-Office-Bleaching" },
      { id: "home-bleaching", label: "Home-Bleaching" },
      { id: "internal-bleaching", label: "Internes Bleichen" },
      { id: "veneers", label: "Veneers" },
      { id: "non-prep-veneers", label: "Non-Prep-Veneers" },
      { id: "bonding", label: "Composite Bonding" },
      { id: "composite-aesthetics", label: "Kompositästhetik" },
      { id: "aesthetic-correction", label: "Ästhetische Frontzahnkorrektur" },
      { id: "gum-contouring", label: "Gingiva-Contouring" },
      { id: "smile-design", label: "Smile Design" },
      { id: "digital-smile-preview", label: "Digitale Smile-Vorschau" },
    ],
  },
  {
    id: "m",
    label: "Laser & Digitale Verfahren",
    services: [
      { id: "soft-tissue-laser", label: "Weichgewebe-Laser" },
      { id: "hard-tissue-laser", label: "Hartgewebe-Laser" },
      { id: "laser-therapy", label: "Lasertherapie" },
      { id: "cad-cam-restoration", label: "CAD/CAM-Restauration" },
      { id: "same-day-crown", label: "Krone am selben Tag" },
    ],
  },
];

export function findServiceById(
  id: string
): { service: ServiceOption; group: ServiceGroup } | null {
  for (const group of SERVICE_MASTER) {
    const service = group.services.find((s) => s.id === id);
    if (service) return { service, group };
  }
  return null;
}

export function getServiceLabel(id: string): string {
  const match = findServiceById(id);
  return match?.service.label || id;
}
