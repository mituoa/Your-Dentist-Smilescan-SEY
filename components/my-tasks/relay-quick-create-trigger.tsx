"use client";

import { Plus } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef } from "react";

import { openRelayQuickCreate } from "@/lib/relay/relay-quick-create-bus";
import type { RelayV3Section } from "@/lib/relay/build-relay-v3-snapshot";
import { cn } from "@/lib/utils";

type RelayQuickCreateTriggerProps = {
  className?: string;
  label?: string;
};

function resolveSectionFromUrl(searchParams: URLSearchParams): RelayV3Section {
  const raw = searchParams.get("section");
  if (raw === "routines" || raw === "handoffs") return raw;
  if (searchParams.get("panel") === "messages") return "handoffs";
  return "operations";
}

export function RelayQuickCreateTrigger({
  className,
  label = "Praxisaufgabe erstellen",
}: RelayQuickCreateTriggerProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const onRelay =
    pathname === "/relay" ||
    pathname.startsWith("/relay/") ||
    pathname === "/my-tasks" ||
    pathname.startsWith("/my-tasks/");

  if (!onRelay) return null;

  const section = resolveSectionFromUrl(searchParams);

  return (
    <button
      ref={btnRef}
      type="button"
      title={label}
      className={cn(className)}
      onClick={() => {
        if (btnRef.current) {
          openRelayQuickCreate(btnRef.current, { section });
        }
      }}
    >
      <Plus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
      <span>{label}</span>
    </button>
  );
}
