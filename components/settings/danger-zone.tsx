"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SectionHeader } from "./section-header";

export function DangerZone() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    if (!confirm("Wirklich abmelden?")) return;
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
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
        Aus SmileScan abmelden
      </button>
    </section>
  );
}
