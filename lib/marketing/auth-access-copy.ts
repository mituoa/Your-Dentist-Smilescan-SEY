/**
 * Zugangs- und Registrierungs-Copy — ruhig, medizinisch-infrastrukturell.
 * Kein Startup-Onboarding-Sprech.
 */

export const AUTH_ACCESS_COPY = {
  loginRegisterLead: "Noch keinen Zugriff?",
  loginRegisterLink: "Zugang anfordern",
  registerPageTitle: "Zugang für Ihre Praxis anfordern",
  registerPageLead:
    "Abrechnungsrhythmus wählen, Angaben erfassen — nach Prüfung erhalten Sie den geschützten Praxiszugang.",
  pricingPageTitle: "Zugang für Ihre Praxis anfordern",
  pricingPageLead:
    "Wählen Sie den Abrechnungsrhythmus. Nach Prüfung öffnet sich Ihr geschützter Praxisbereich.",
  pricingPlanCtaActive: "Mit diesem Zugang registrieren",
  pricingPlanCtaSelect: "Zugang wählen",
} as const;

export function buildPricingEntryHref(inviteToken = "", prefilledEmail = ""): string {
  const params = new URLSearchParams();
  if (inviteToken) params.set("invite", inviteToken);
  if (prefilledEmail) params.set("email", prefilledEmail);
  const qs = params.toString();
  return qs ? `/pricing?${qs}` : "/pricing";
}

export function buildRegisterEntryHref(
  inviteToken = "",
  prefilledEmail = "",
  plan = "yearly"
): string {
  const params = new URLSearchParams();
  params.set("plan", plan);
  params.set("step", "1");
  if (inviteToken) params.set("invite", inviteToken);
  if (prefilledEmail) params.set("email", prefilledEmail);
  return `/register?${params.toString()}`;
}
