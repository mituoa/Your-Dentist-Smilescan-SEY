import { Suspense } from "react";

import { PricingPageClient } from "@/components/auth/pricing-page-client";
import { YdAuthEnvironment } from "@/components/auth/yd-auth-environment";
import { YdAuthLoadingState } from "@/components/auth/yd-auth-ui";
import {
  clipInviteTokenQuery,
  isInviteTokenFormat,
} from "@/lib/team-invitations/invite-token-format";

interface PricingPageProps {
  searchParams: Promise<{
    plan?: string;
    invite?: string;
    email?: string;
  }>;
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const params = await searchParams;
  const inviteRaw = clipInviteTokenQuery(params.invite);
  const inviteToken = isInviteTokenFormat(inviteRaw) ? inviteRaw : "";
  const prefilledEmail = params.email?.trim() || "";

  const loginHref = inviteToken
    ? `/login?invite=${encodeURIComponent(inviteToken)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`
    : "/login";

  return (
    <YdAuthEnvironment scroll bare showBrand={false}>
      <Suspense
        fallback={
          <div className="flex min-h-[min(480px,75dvh)] flex-col items-center justify-center py-16">
            <YdAuthLoadingState label="Seite wird geladen …" />
          </div>
        }
      >
        <PricingPageClient
          initialPlan={params.plan}
          inviteToken={inviteToken}
          prefilledEmail={prefilledEmail}
          loginHref={loginHref}
        />
      </Suspense>
    </YdAuthEnvironment>
  );
}
