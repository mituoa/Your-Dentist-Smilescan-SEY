"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect } from "react";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { AUTH_ACCESS_COPY } from "@/lib/marketing/auth-access-copy";
import { scrollToPublicSectionFromHash } from "@/lib/marketing/public-site-scroll";

type RegisterOnboardingShellProps = {
  children: ReactNode;
  loginHref: string;
};

export function RegisterOnboardingShell({ children, loginHref }: RegisterOnboardingShellProps) {
  useEffect(() => {
    if (!window.location.hash) return;
    requestAnimationFrame(() => scrollToPublicSectionFromHash());
  }, []);

  return (
    <div className="yd-register-page">
      <header className="yd-register-page-header yd-auth-awaken-field">
        <YourDentistBrandLockup size="md" centered />
        <h1 className="yd-register-page-title">{AUTH_ACCESS_COPY.registerPageTitle}</h1>
        <p className="yd-register-page-lead">{AUTH_ACCESS_COPY.registerPageLead}</p>
        <p className="yd-register-page-login-hint">
          Bereits freigeschaltet?{" "}
          <Link prefetch href={loginHref} className="yd-auth-link">
            Zum Login
          </Link>
        </p>
      </header>
      {children}
    </div>
  );
}
