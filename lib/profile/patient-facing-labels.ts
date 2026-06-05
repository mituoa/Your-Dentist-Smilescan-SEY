import { getSpecializationLabel } from "@/lib/masterdata/specializations";

/** Patientenfreundliche Schwerpunkt-Labels — intern bleibt die Fach-ID unverändert. */
const PATIENT_SPECIALIZATION_LABELS: Record<string, string> = {
  "general-dentistry": "Gesunde Zähne",
  "preventive-dentistry": "Vorsorge & Prophylaxe",
  "oral-medicine": "Mundgesundheit",
  "geriatric-dentistry": "Zahnmedizin im Alter",
  restorative: "Zahnerhalt",
  "minimally-invasive": "Schonende Behandlung",
  endodontics: "Wurzelbehandlung",
  periodontology: "Zahnfleischgesundheit",
  "periodontology-surgery": "Zahnfleisch-Behandlung",
  implantology: "Zahnimplantate",
  "guided-implantology": "Präzise Implantate",
  "immediate-implants": "Schnelle Implantate",
  "aesthetic-dentistry": "Schöne Zähne",
  "digital-smile-design": "Ihr neues Lächeln",
  prosthodontics: "Zahnersatz",
  "cad-cam-prosthetics": "Hochwertiger Zahnersatz",
  "removable-prosthetics": "Prothesen & Teilprothesen",
  orthodontics: "Gerade Zähne",
  "lingual-orthodontics": "Unsichtbare Zahnspange",
  "interceptive-ortho": "Kieferorthopädie für Kinder",
  "oral-surgery": "Zahn-OP",
  "maxillofacial-surgery": "Kieferchirurgie",
  "wisdom-teeth-surgery": "Weisheitszähne",
  "pediatric-dentistry": "Kinderzähne",
  "functional-diagnostics": "Kieferfunktion & Diagnostik",
  "orofacial-pain": "Kiefer- & Gesichtsschmerz",
  "pain-therapy": "Schmerzfreie Behandlung",
  "splint-therapy": "Schienen bei Kieferbeschwerden",
  "bruxism-therapy": "Zähneknirschen",
  "dental-radiology": "Sichere Diagnostik",
  "digital-dentistry": "Digitale Zahnmedizin",
  "laser-dentistry": "Sanfte Laserbehandlung",
  "special-care": "Besondere Bedürfnisse",
  "anxiety-patients": "Angstfreie Behandlung",
  "sleep-medicine-dental": "Besser schlafen",
  "sports-dentistry": "Zahnschutz im Sport",
  anesthesia: "Behandlung in Sedierung",
  "public-health": "Prävention & Beratung",
  "oral-pathology": "Munddiagnostik",
  "oral-microbiology": "Mundinfektionen",
};

export function patientFacingSpecializationLabel(id: string): string {
  if (id.startsWith("custom:")) return id.slice("custom:".length);
  return PATIENT_SPECIALIZATION_LABELS[id] ?? getSpecializationLabel(id);
}
