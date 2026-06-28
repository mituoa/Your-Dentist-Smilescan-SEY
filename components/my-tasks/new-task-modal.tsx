"use client";

import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

import { useAssistDispatchOptional } from "@/components/command-assist/assist-shell";
import { cn } from "@/lib/utils";

type NewTaskModalTriggerProps = {
  className?: string;
  label?: string;
  showIcon?: boolean;
  preset?: "task" | "reminder";
  icon?: LucideIcon;
  /** @deprecated Nur noch für API-Kompatibilität */
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
}: NewTaskModalTriggerProps) {
  const assist = useAssistDispatchOptional();
  const isReminder = preset === "reminder";

  return (
    <button
      type="button"
      title={label}
      className={className ?? DEFAULT_TRIGGER_CLASS}
      onClick={() =>
        assist?.openTaskModal(
          isReminder
            ? {
                title: "Erinnerung",
                notes: "",
                dueDate: null,
                assigneeHint: null,
                savedAt: new Date().toISOString(),
              }
            : null
        )
      }
    >
      {showIcon ? (
        <Icon
          className={cn("h-4 w-4 shrink-0 text-[#1A4F9C]")}
          strokeWidth={isReminder ? 1.75 : 2}
          aria-hidden
        />
      ) : null}
      <span>{label}</span>
    </button>
  );
}

/** @deprecated Nutze `openTaskModal` aus AssistShell. */
export function NewTaskModal(props: {
  open: boolean;
  onClose: () => void;
  initialRecurrenceType?: string;
  compactMode?: boolean;
  dialogTitle?: string;
  dialogHint?: string;
  initialDraft?: { title: string; notes?: string; dueDate?: string | null } | null;
}) {
  const assist = useAssistDispatchOptional();

  if (props.open && assist) {
    assist.openTaskModal(
      props.initialDraft
        ? {
            title: props.initialDraft.title,
            notes: props.initialDraft.notes ?? "",
            dueDate: props.initialDraft.dueDate ?? null,
            assigneeHint: null,
            savedAt: new Date().toISOString(),
          }
        : null
    );
    props.onClose();
  }

  return null;
}
