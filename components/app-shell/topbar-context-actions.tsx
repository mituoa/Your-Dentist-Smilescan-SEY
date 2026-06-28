"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { NewCaseModal } from "@/components/cases/new-case-modal";
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

function NeuerFallButton({
  variant = "toolbar",
  workspaceId,
}: {
  variant?: "toolbar" | "dashboard";
  workspaceId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title="Neuer Fall"
        className={actionClasses(variant, "primary")}
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4 shrink-0" strokeWidth={2} />
        <span>Neuer Fall</span>
      </button>
      <NewCaseModal open={open} onClose={() => setOpen(false)} workspaceId={workspaceId} />
    </>
  );
}

type TopbarContextActionsProps = {
  role: "doctor" | "team";
  variant?: "toolbar" | "dashboard";
  workspaceId: string;
};

/** Globale Schnellaktionen — Workspace-Toolbar oder integrierte Dashboard-Headline. */
export function TopbarContextActions({
  role,
  variant = "toolbar",
  workspaceId,
}: TopbarContextActionsProps) {
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
          onMessageCreated={() => router.push("/relay?bereich=team")}
        />
      )}
      {(actionVariant === "both" || actionVariant === "newCase") && (
        <NeuerFallButton variant={variant} workspaceId={workspaceId} />
      )}
    </div>
  );
}
