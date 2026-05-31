"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";

import { createCaseFromQuery } from "@/lib/create-case-return";
import { NewTaskModalTrigger } from "@/components/my-tasks/new-task-modal";

type ActionVariant = "both" | "newCase" | "newTask" | "none";

function resolveVariant(pathname: string, role: "doctor" | "team"): ActionVariant {
  if (role === "doctor") {
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
  return "none";
}

function NeuerFallLink({ pathname }: { pathname: string }) {
  const from = createCaseFromQuery(pathname);
  return (
    <Link
      href={`/create-case?from=${from}`}
      title="Neuer Fall"
      className="yd-workspace-toolbar__cta yd-workspace-toolbar__cta--primary inline-flex items-center gap-2"
    >
      <Plus className="h-4 w-4 shrink-0" strokeWidth={2} />
      <span>Neuer Fall</span>
    </Link>
  );
}

type TopbarContextActionsProps = {
  role: "doctor" | "team";
};

/** Globale Schnellaktionen — Workspace-Toolbar, nicht Dashboard-Inhalt. */
export function TopbarContextActions({ role }: TopbarContextActionsProps) {
  const pathname = usePathname() || "";
  const variant = resolveVariant(pathname, role);

  if (variant === "none") return null;

  return (
    <div className="flex shrink-0 items-center gap-2">
      {(variant === "both" || variant === "newTask") && (
        <NewTaskModalTrigger
          className="yd-workspace-toolbar__cta yd-workspace-toolbar__cta--secondary inline-flex items-center gap-2"
          label="Neue Aufgabe"
          showIcon
        />
      )}
      {(variant === "both" || variant === "newCase") && <NeuerFallLink pathname={pathname} />}
    </div>
  );
}
