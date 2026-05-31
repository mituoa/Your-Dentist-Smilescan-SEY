import { redirect } from "next/navigation";

interface PricingPageProps {
  searchParams: Promise<{
    plan?: string;
    invite?: string;
    email?: string;
  }>;
}

/** Preise leben auf der Landing — /pricing → /#pricing (Query bleibt erhalten). */
export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.plan) qs.set("plan", params.plan);
  if (params.invite) qs.set("invite", params.invite);
  if (params.email) qs.set("email", params.email);
  const base = qs.toString() ? `/?${qs.toString()}` : "/";
  redirect(`${base}#preise`);
}
