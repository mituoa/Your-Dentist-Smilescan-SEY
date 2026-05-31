import Link from "next/link";

import { AUTH_ACCESS_COPY, buildRegisterEntryHref } from "@/lib/marketing/auth-access-copy";

type LoginRegisterCtaProps = {
  inviteToken?: string;
  prefilledEmail?: string;
};

/** Ein Hinweis unter dem Login — direkt zur Registrierung (kein Umweg über die Startseite). */
export function LoginRegisterCta({
  inviteToken = "",
  prefilledEmail = "",
}: LoginRegisterCtaProps) {
  const registerHref = buildRegisterEntryHref(inviteToken, prefilledEmail);

  return (
    <div
      className="yd-auth-login-access yd-auth-awaken-field"
      style={{ ["--yd-auth-field-i" as string]: "5" }}
    >
      <p className="yd-auth-register yd-auth-register--subtle">
        {AUTH_ACCESS_COPY.loginRegisterLead}{" "}
        <Link prefetch href={registerHref} className="yd-auth-access-link">
          {AUTH_ACCESS_COPY.loginRegisterLink}
        </Link>
      </p>
      <p className="yd-auth-login-trust">Für autorisierte Praxisteams</p>
    </div>
  );
}
