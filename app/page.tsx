import { YdBentoHomePage } from "@/components/marketing/yd-bento-home-page";
import { getCurrentUser } from "@/lib/auth-helpers";
import { resolveHomeDashboardHref } from "@/lib/public-entry/resolve-home-dashboard-href";

/** Öffentliche Landing — immer sichtbar; Session nur für „Zum Dashboard“. */
interface HomePageProps {
  searchParams: Promise<{ plan?: string; invite?: string; email?: string; welcome?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const dashboardHref = user ? await resolveHomeDashboardHref(user) : null;

  return (
    <YdBentoHomePage
      dashboardHref={dashboardHref}
      initialPlan={params.plan}
      inviteToken={params.invite?.trim() ?? ""}
      prefilledEmail={params.email?.trim() ?? ""}
    />
  );
}
