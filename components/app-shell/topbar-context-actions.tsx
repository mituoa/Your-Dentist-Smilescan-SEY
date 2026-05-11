"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";

import { createCaseFromQuery } from "@/lib/create-case-return";

type ActionVariant = "both" | "newCase" | "newTask" | "none";

function resolveVariant(pathname: string): ActionVariant {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return "both";
  }
  if (pathname.startsWith("/inbox")) {
    return "newCase";
  }
  if (
    pathname === "/relay" ||
    pathname.startsWith("/relay/") ||
    pathname === "/my-tasks" ||
    pathname.startsWith("/my-tasks/")
  ) {
    return "newTask";
  }
  if (
    pathname.startsWith("/profile") ||
    pathname.startsWith("/journal") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin")
  ) {
    return "none";
  }
  return "none";
}

function NeueAufgabeLink() {
  return (
    <Link
      href="/relay#relay-quick-create"
      title="Neue Aufgabe"
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-[rgba(15,23,42,0.1)] px-3 text-[13px] font-medium text-[#0F172A] transition-colors hover:border-[rgba(43,111,232,0.18)] hover:bg-[#F4F7FB] md:px-4 md:text-[14px]"
      style={{ borderRadius: "12px" }}
    >
      <Plus className="h-4 w-4 shrink-0 text-[#2F80ED]" />
      <span className="hidden sm:inline">Neue Aufgabe</span>
    </Link>
  );
}

function NeuerFallLink({ pathname }: { pathname: string }) {
  const from = createCaseFromQuery(pathname);
  return (
    <Link
      href={`/create-case?from=${from}`}
      title="Neuer Fall"
      className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-[13px] font-medium text-white transition-all hover:opacity-95 sm:px-4 md:px-5 md:text-[14px]"
      style={{
        borderRadius: "12px",
        background: "#2F80ED",
        boxShadow: "0 4px 12px rgba(47,128,237,0.28), 0 2px 4px rgba(47,128,237,0.18)",
      }}
    >
      <Plus className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">Neuer Fall</span>
    </Link>
  );
}

/**
 * Kontextuelle Topbar-Aktionen — gleiche Button-Materialität, nur Sichtbarkeit je Route.
 */
export function TopbarContextActions() {
  const pathname = usePathname() || "";
  const variant = resolveVariant(pathname);

  return (
    <div className="flex h-10 shrink-0 items-center gap-2 md:gap-3">
      {(variant === "both" || variant === "newTask") && <NeueAufgabeLink />}
      {(variant === "both" || variant === "newCase") && <NeuerFallLink pathname={pathname} />}
    </div>
  );
}
