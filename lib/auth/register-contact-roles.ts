/** Rolle der anmeldenden Person in der Praxis (Registrierung). */
export const REGISTER_CONTACT_ROLES = [
  { value: "dentist_owner", label: "Zahnarzt / Zahnärztin (Inhaber/in)" },
  { value: "dentist_associate", label: "Zahnarzt / Zahnärztin (angestellt)" },
  { value: "practice_manager", label: "Praxismanager/in" },
  { value: "team_lead", label: "Teamleitung / Koordination" },
  { value: "other", label: "Sonstige Funktion in der Praxis" },
] as const;

export type RegisterContactRole = (typeof REGISTER_CONTACT_ROLES)[number]["value"];

export function isRegisterContactRole(v: string): v is RegisterContactRole {
  return REGISTER_CONTACT_ROLES.some((r) => r.value === v);
}

export function registerContactRoleLabel(value: string): string {
  return REGISTER_CONTACT_ROLES.find((r) => r.value === value)?.label ?? value;
}
