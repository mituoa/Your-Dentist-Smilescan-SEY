export type RegisterPlanId = "monthly" | "halfyearly" | "yearly";

export type RegisterPlanDefinition = {
  id: RegisterPlanId;
  price: number;
  total: number;
  label: string;
  save: string | null;
  billing: string;
  description: string;
};

export const REGISTER_PLANS: Record<RegisterPlanId, RegisterPlanDefinition> = {
  monthly: {
    id: "monthly",
    price: 20,
    total: 20,
    label: "Monatlich",
    save: null,
    billing: "Monatlich abgerechnet",
    description: "Flexibler Rhythmus — für den Einstieg in den geschützten Praxisbereich.",
  },
  halfyearly: {
    id: "halfyearly",
    price: 18,
    total: 108,
    label: "Halbjährlich",
    save: "10%",
    billing: "Alle 6 Monate abgerechnet",
    description: "Planbare Infrastruktur im Halbjahresrhythmus — weniger Wechsel im Alltag.",
  },
  yearly: {
    id: "yearly",
    price: 16,
    total: 192,
    label: "Jährlich",
    save: "20%",
    billing: "Jährlich abgerechnet",
    description: "Durchgängiger Praxisbetrieb — ruhige, planbare Team-Infrastruktur.",
  },
};

export function coerceRegisterPlan(value: string | null | undefined): RegisterPlanId {
  if (value === "monthly" || value === "halfyearly" || value === "yearly") return value;
  if (value === "half-yearly" || value === "half_yearly") return "halfyearly";
  return "yearly";
}
