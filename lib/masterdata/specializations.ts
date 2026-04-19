export interface SpecializationOption {
  id: string;
  label: string;
}

export const SPECIALIZATION_MASTER: SpecializationOption[] = [
  { id: "general-dentistry", label: "Allgemeine Zahnheilkunde" },
  { id: "orthodontics", label: "Kieferorthopädie" },
  { id: "oral-surgery", label: "Oralchirurgie" },
  {
    id: "maxillofacial-surgery",
    label: "Mund-, Kiefer- und Gesichtschirurgie",
  },
  { id: "pediatric-dentistry", label: "Kinderzahnheilkunde" },
  { id: "periodontology", label: "Parodontologie" },
  { id: "endodontics", label: "Endodontie" },
  { id: "prosthodontics", label: "Prothetik" },
  { id: "restorative", label: "Restaurative Zahnheilkunde" },
  { id: "implantology", label: "Implantologie" },
  { id: "oral-medicine", label: "Oralmedizin" },
  { id: "orofacial-pain", label: "Orofazialer Schmerz / Kiefergelenk" },
  {
    id: "dental-radiology",
    label: "Dental- und maxillofaziale Radiologie",
  },
  { id: "special-care", label: "Behandlung besonderer Patientengruppen" },
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
