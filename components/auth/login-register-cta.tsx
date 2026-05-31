import Link from "next/link";

import { AUTH_ACCESS_COPY, buildPricingEntryHref } from "@/lib/marketing/auth-access-copy";

type LoginRegisterCtaProps = {
  inviteToken?: string;
  prefilledEmail?: string;
};

/** Ein Hinweis unter dem Login — Link zur Zugangsseite, kein zweites Pricing-UI. */
export function LoginRegisterCta({
  inviteToken = "",
  prefilledEmail = "",
}: LoginRegisterCtaProps) {
  const pricingHref = buildPricingEntryHref(inviteToken, prefilledEmail);

  return (
    <p className="yd-auth-register yd-auth-register--subtle yd-auth-awaken-field" style={{ ["--yd-auth-field-i" as string]: "5" }}>
      {AUTH_ACCESS_COPY.loginRegisterLead}{" "}
      <Link prefetch href={pricingHref} className="yd-auth-access-link">
        {AUTH_ACCESS_COPY.loginRegisterLink}
      </Link>
    </p>
  );
}
