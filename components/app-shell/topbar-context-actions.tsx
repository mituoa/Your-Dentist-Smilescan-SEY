"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { createCaseFromQuery } from "@/lib/create-case-return";
import { RelayCreateMenu } from "@/components/my-tasks/relay-create-menu";

type ActionVariant = "both" | "newCase" | "newTask" | "none";

function resolveVariant(pathname: string, role: "doctor" | "team"): ActionVariant {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return role === "doctor" ? "both" : "none";
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

function actionClasses(variant: "toolbar" | "dashboard", kind: "primary" | "secondary") {
  if (variant === "dashboard") {
    return kind === "primary"
      ? "yd-dash-header-premium__cta yd-dash-header-premium__cta--primary inline-flex items-center gap-2"
      : "yd-dash-header-premium__cta yd-dash-header-premium__cta--secondary inline-flex items-center gap-2";
  }
  return kind === "primary"
    ? "yd-workspace-toolbar__cta yd-workspace-toolbar__cta--primary inline-flex items-center gap-2"
    : "yd-workspace-toolbar__cta yd-workspace-toolbar__cta--secondary inline-flex items-center gap-2";
}

function NeuerFallLink({
  pathname,
  variant = "toolbar",
}: {
  pathname: string;
  variant?: "toolbar" | "dashboard";
}) {
  const from = createCaseFromQuery(pathname);
  return (
    <a
      title="Neuer Fall"
      className={actionClasses(variant, "primary")}
      href={`/create-case?from=${from}`}
    >
      <Plus className="h-4 w-4 shrink-0" strokeWidth={2} />
      <span>Neuer Fall</span>
    </a>
  );
}

type TopbarContextActionsProps = {
  role: "doctor" | "team";
  variant?: "toolbar" | "dashboard";
};

/** Globale Schnellaktionen — Workspace-Toolbar oder integrierte Dashboard-Headline. */
export function TopbarContextActions({ role, variant = "toolbar" }: TopbarContextActionsProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const actionVariant = resolveVariant(pathname, role);

  if (actionVariant === "none") return null;

  return (
    <div
      className={
        variant === "dashboard"
          ? "yd-dash-header-premium__cta-group flex shrink-0 items-center gap-2"
          : "flex shrink-0 items-center gap-2"
      }
    >
      {(actionVariant === "both" || actionVariant === "newTask") && (
        <RelayCreateMenu
          placement={variant === "dashboard" ? "header" : "toolbar"}
          isDoctor={role === "doctor"}
          onMessageCreated={() => router.push("/relay?bereich=teamwork")}
        />
      )}
      {(actionVariant === "both" || actionVariant === "newCase") && (
        <NeuerFallLink pathname={pathname} variant={variant} />
      )}
    </div>
  );
}
