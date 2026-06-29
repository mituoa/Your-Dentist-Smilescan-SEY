import { Suspense } from "react";

import { YdHomeOsPage } from "@/components/marketing/yd-home-os-page";
import { getCurrentUser } from "@/lib/auth-helpers";
import { resolveHomeDashboardHref } from "@/lib/public-entry/resolve-home-dashboard-href";

interface HomePageProps {
  searchParams: Promise<{ plan?: string; invite?: string; email?: string; welcome?: string }>;
}

type HomeContentProps = {
  initialPlan?: string | null;
  inviteToken: string;
  prefilledEmail: string;
  dashboardHref?: string | null;
};

function HomePageShell(props: HomeContentProps) {
  return <YdHomeOsPage {...props} />;
}

async function HomePageWithSession(props: Omit<HomeContentProps, "dashboardHref">) {
  const user = await getCurrentUser();
  const dashboardHref = user ? await resolveHomeDashboardHref(user) : null;
  return <YdHomeOsPage {...props} dashboardHref={dashboardHref} />;
}

/** Öffentliche Landing — Session nur für „Dashboard“-Link; Shell streamt sofort. */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const contentProps: Omit<HomeContentProps, "dashboardHref"> = {
    initialPlan: params.plan,
    inviteToken: params.invite?.trim() ?? "",
    prefilledEmail: params.email?.trim() ?? "",
  };

  return (
    <Suspense fallback={<HomePageShell {...contentProps} />}>
      <HomePageWithSession {...contentProps} />
    </Suspense>
  );
}
