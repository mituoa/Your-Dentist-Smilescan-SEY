import { YdHomeOsPage } from "@/components/marketing/yd-home-os-page";

interface HomePageProps {
  searchParams: Promise<{ plan?: string; invite?: string; email?: string; welcome?: string }>;
}

/** Öffentliche Landing — Header-Link führt immer zu Anmelden. */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  return (
    <YdHomeOsPage
      initialPlan={params.plan}
      inviteToken={params.invite?.trim() ?? ""}
      prefilledEmail={params.email?.trim() ?? ""}
    />
  );
}
