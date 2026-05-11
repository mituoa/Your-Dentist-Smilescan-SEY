"use client";

import { LogOut } from "lucide-react";
import { clearReturnToPricingFlag } from "@/lib/login-pricing-return";
import { signOutWithFullPageRedirect } from "@/lib/auth/sign-out-client";
import { useTransition } from "react";
import { SectionHeader } from "./section-header";

export function DangerZone() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    if (!confirm("Wirklich abmelden?")) return;
    startTransition(async () => {
      clearReturnToPricingFlag();
      await signOutWithFullPageRedirect();
    });
  };

  return (
    <section className="space-y-6 pb-24">
      <SectionHeader number="VII" title="Abmelden" />
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="inline-flex items-center gap-2 text-sm text-danger hover:underline"
      >
        <LogOut className="w-4 h-4" strokeWidth={1.75} />
        Bei Your Dentist abmelden
      </button>
    </section>
  );
}
