"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

import { createTaskFromQuery } from "@/lib/create-task-return";
import { cn } from "@/lib/utils";

type NewTaskModalTriggerProps = {
  className?: string;
  label?: string;
  showIcon?: boolean;
  preset?: "task" | "reminder";
  icon?: LucideIcon;
  /** @deprecated Nur noch für API-Kompatibilität — Formular ist Vollbild unter `/my-tasks/new`. */
  compactMode?: boolean;
  submissionId?: string;
};

const DEFAULT_TRIGGER_CLASS =
  "inline-flex h-10 items-center gap-2 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-3 text-[13px] font-medium text-[#0F172A] transition-colors hover:border-[rgba(15,23,42,0.12)] hover:bg-[#F8FAFC] md:px-4 md:text-[14px]";

export function NewTaskModalTrigger({
  className,
  label = "Neue Aufgabe",
  showIcon = true,
  preset = "task",
  icon: Icon = Plus,
  submissionId,
}: NewTaskModalTriggerProps) {
  const pathname = usePathname();
  const from = createTaskFromQuery(pathname || "/my-tasks");
  const params = new URLSearchParams({ from });
  if (submissionId) params.set("submission_id", submissionId);
  if (preset === "reminder") params.set("title", "Erinnerung");

  const href = `/my-tasks/new?${params.toString()}`;
  const isReminder = preset === "reminder";

  return (
    <Link href={href} title={label} className={className ?? DEFAULT_TRIGGER_CLASS}>
      {showIcon ? (
        <Icon
          className={cn("h-4 w-4 shrink-0 text-[#2F80ED]")}
          strokeWidth={isReminder ? 1.75 : 2}
          aria-hidden
        />
      ) : null}
      <span>{label}</span>
    </Link>
  );
}

/** @deprecated Modal entfernt — nutzt `/my-tasks/new` (Kompatibilität für alte Importe). */
export function NewTaskModal(_props: {
  open?: boolean;
  onClose?: () => void;
  initialRecurrenceType?: string;
  compactMode?: boolean;
  dialogTitle?: string;
  dialogHint?: string;
  initialDraft?: { title: string; notes?: string; dueDate?: string | null } | null;
}) {
  return null;
}
