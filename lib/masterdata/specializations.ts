export interface SpecializationOption {
  id: string;
  label: string;
}

export const SPECIALIZATION_MASTER: SpecializationOption[] = [
  { id: "general-dentistry", label: "Allgemeine Zahnheilkunde" },
  { id: "preventive-dentistry", label: "Präventive Zahnmedizin" },
  { id: "geriatric-dentistry", label: "Geriatrische Zahnmedizin" },
  { id: "orthodontics", label: "Kieferorthopädie" },
  { id: "lingual-orthodontics", label: "Lingualtechnik" },
  { id: "interceptive-ortho", label: "Interzeptive Kieferorthopädie" },
  { id: "oral-surgery", label: "Oralchirurgie" },
  {
    id: "maxillofacial-surgery",
    label: "Mund-, Kiefer- und Gesichtschirurgie",
  },
  { id: "wisdom-teeth-surgery", label: "Weisheitszahn-Chirurgie" },
  { id: "pediatric-dentistry", label: "Kinderzahnheilkunde" },
  { id: "periodontology", label: "Parodontologie" },
  { id: "periodontology-surgery", label: "Parodontalchirurgie" },
  { id: "endodontics", label: "Endodontie" },
  { id: "prosthodontics", label: "Prothetik" },
  { id: "cad-cam-prosthetics", label: "CAD/CAM-Prothetik" },
  { id: "removable-prosthetics", label: "Herausnehmbarer Zahnersatz" },
  { id: "restorative", label: "Restaurative Zahnheilkunde" },
  { id: "minimally-invasive", label: "Minimalinvasive Zahnheilkunde" },
  { id: "implantology", label: "Implantologie" },
  { id: "guided-implantology", label: "Navigierte Implantologie" },
  { id: "immediate-implants", label: "Sofortimplantation" },
  { id: "aesthetic-dentistry", label: "Ästhetische Zahnmedizin" },
  { id: "digital-smile-design", label: "Digital Smile Design" },
  { id: "oral-medicine", label: "Oralmedizin" },
  { id: "functional-diagnostics", label: "Funktionsdiagnostik" },
  { id: "orofacial-pain", label: "Orofazialer Schmerz / Kiefergelenk" },
  { id: "pain-therapy", label: "Schmerztherapie" },
  { id: "splint-therapy", label: "Schienentherapie / CMD" },
  { id: "bruxism-therapy", label: "Bruxismus-Therapie" },
  {
    id: "dental-radiology",
    label: "Dental- und maxillofaziale Radiologie",
  },
  { id: "digital-dentistry", label: "Digitale Zahnmedizin" },
  { id: "laser-dentistry", label: "Laserzahnheilkunde" },
  { id: "special-care", label: "Behandlung besonderer Patientengruppen" },
  { id: "anxiety-patients", label: "Angstpatienten" },
  { id: "sleep-medicine-dental", label: "Schlafmedizin (Schnarchschienen)" },
  { id: "sports-dentistry", label: "Sportzahnmedizin" },
  { id: "public-health", label: "Öffentliches Gesundheitswesen" },
  { id: "oral-pathology", label: "Orale Pathologie" },
  { id: "oral-microbiology", label: "Orale Mikrobiologie" },
  {
    id: "anesthesia",
    label: "Anästhesie / Sedierung in der Zahnmedizin",
  },
];

export function getSpecializationLabel(id: string): string {
  const match = SPECIALIZATION_MASTER.find((s) => s.id === id);
  return match?.label || id;
}
