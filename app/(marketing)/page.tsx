import { redirect } from "next/navigation";

import { YdHomeOsPage } from "@/components/marketing/yd-home-os-page";

interface HomePageProps {
  searchParams: Promise<{ plan?: string; invite?: string; email?: string; welcome?: string }>;
}

/** Öffentlicher Einstieg: Standard ist Anmeldung; Startseite nur mit ?welcome=1 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const invite = params.invite?.trim() ?? "";
  const email = params.email?.trim() ?? "";
  const plan = params.plan?.trim() ?? "";

  if (params.welcome === "1") {
    return (
      <YdHomeOsPage
        initialPlan={plan || null}
        inviteToken={invite}
        prefilledEmail={email}
      />
    );
  }

  if (invite) {
    const qs = new URLSearchParams();
    qs.set("invite", invite);
    if (email) qs.set("email", email);
    redirect(`/login?${qs.toString()}`);
  }

  if (plan) {
    const qs = new URLSearchParams();
    qs.set("plan", plan);
    qs.set("step", "1");
    if (email) qs.set("email", email);
    redirect(`/register?${qs.toString()}`);
  }

  redirect("/login");
}
