"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect } from "react";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";

type RegisterOnboardingShellProps = {
  children: ReactNode;
  loginHref: string;
};

export function RegisterOnboardingShell({ children, loginHref }: RegisterOnboardingShellProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#pricing") return;
    const el = document.getElementById("pricing");
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <div className="yd-register-page">
      <header className="yd-register-page-header yd-auth-awaken-field">
        <YourDentistBrandLockup size="md" tagline="Neutral Practice Platform" centered />
        <h1 className="yd-register-page-title">Praxis registrieren</h1>
        <p className="yd-register-page-lead">
          Onboarding für Ihren geschützten Praxisbereich — Plan wählen, Daten erfassen, Freischaltung
          nach Prüfung.
        </p>
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
