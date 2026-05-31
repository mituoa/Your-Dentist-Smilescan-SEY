/** Rolle der anmeldenden Person — nur zahnärztliche Funktionen (kein öffentliches SaaS). */
export const REGISTER_CONTACT_ROLES = [
  { value: "dentist_owner", label: "Praxisinhaber/in" },
  { value: "dentist_associate", label: "Zahnärztin / Zahnarzt im Praxisteam" },
] as const;

export type RegisterContactRole = (typeof REGISTER_CONTACT_ROLES)[number]["value"];

export function isRegisterContactRole(v: string): v is RegisterContactRole {
  return REGISTER_CONTACT_ROLES.some((r) => r.value === v);
}

export function registerContactRoleLabel(value: string): string {
  return REGISTER_CONTACT_ROLES.find((r) => r.value === value)?.label ?? value;
}
