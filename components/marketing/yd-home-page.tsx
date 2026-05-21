"use client";

import { YdHomeDesktop } from "@/components/marketing/yd-home-desktop";
import { YdHomeMobile } from "@/components/marketing/yd-home-mobile";

type YdHomePageProps = {
  initialPlan?: string | null;
  inviteToken?: string;
  prefilledEmail?: string;
};

/** Premium clinical entry — desktop narrative + mobile conversion (separate architectures). */
export function YdHomePage({ initialPlan, inviteToken, prefilledEmail }: YdHomePageProps) {
  return (
    <>
      <YdHomeMobile
        initialPlan={initialPlan}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
      />
      <YdHomeDesktop
        initialPlan={initialPlan}
        inviteToken={inviteToken}
        prefilledEmail={prefilledEmail}
      />
    </>
  );
}
