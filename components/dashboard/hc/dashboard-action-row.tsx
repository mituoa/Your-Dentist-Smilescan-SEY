"use client";

import Link from "next/link";
import {
  BellRing,
  ClipboardCheck,
  MessageSquarePlus,
  Plus,
  UserPlus,
} from "lucide-react";

import { NewTaskModalTrigger } from "@/components/my-tasks/new-task-modal";
import { createCaseFromQuery } from "@/lib/create-case-return";
import { cn } from "@/lib/utils";

const PILL_BASE =
  "inline-flex h-10 min-h-[44px] shrink-0 touch-manipulation items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-[box-shadow,background,border-color] duration-200";

const PILL_QUIET =
  "border-[rgba(180,198,218,0.38)] bg-white/90 text-[#1a3348] hover:border-[rgba(47,128,237,0.28)] hover:bg-[#f8fbfe] hover:shadow-[0_2px_10px_rgba(47,128,237,0.08)]";

const PILL_PRIMARY =
  "border-[rgba(47,128,237,0.22)] bg-[#2F80ED] text-white shadow-[0_4px_14px_rgba(47,128,237,0.22)] hover:brightness-[1.03] active:scale-[0.99]";

type DashboardActionRowProps = {
  className?: string;
};

export function DashboardActionRow({ className }: DashboardActionRowProps) {
  const createCaseHref = `/create-case?from=${createCaseFromQuery("/dashboard")}`;

  return (
    <nav
      className={cn("yd-dash-action-row", className)}
      aria-label="Schnellaktionen"
    >
      <Link href={createCaseHref} className={cn(PILL_BASE, PILL_PRIMARY)}>
        <Plus className="h-4 w-4 shrink-0" strokeWidth={2} />
        Neuer Fall
      </Link>

      <NewTaskModalTrigger
        className={cn(PILL_BASE, PILL_QUIET)}
        label="Praxisaufgabe erstellen"
        showIcon
      />

      <Link href="/relay?panel=messages" className={cn(PILL_BASE, PILL_QUIET)}>
        <MessageSquarePlus className="h-4 w-4 shrink-0 text-[#2F80ED]" strokeWidth={1.75} />
        Relay Nachricht
      </Link>

      <NewTaskModalTrigger
        className={cn(PILL_BASE, PILL_QUIET)}
        label="Erinnerung"
        showIcon
        preset="reminder"
        icon={BellRing}
      />

      <Link href="/inbox" className={cn(PILL_BASE, PILL_QUIET, "max-lg:hidden")}>
        <ClipboardCheck className="h-4 w-4 shrink-0 text-[#2F80ED]" strokeWidth={1.75} />
        Antwort vorbereiten
      </Link>

      <Link
        href="/inbox"
        className={cn(PILL_BASE, PILL_QUIET, "lg:hidden")}
        title="Patientenfälle im Tracker"
      >
        <UserPlus className="h-4 w-4 shrink-0 text-[#2F80ED]" strokeWidth={1.75} />
        Tracker
      </Link>
    </nav>
  );
}
