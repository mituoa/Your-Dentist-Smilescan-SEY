"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Plus, X, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  createMyTask,
  fetchAssignableMembersForTaskCreate,
} from "@/app/(protected)/my-tasks/actions";
import type { AssignableMember } from "@/lib/queries/team-members";
import { TaskRoutineFields } from "@/components/my-tasks/task-routine-fields";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AssignMode = "self" | "all" | "specific";

type NewTaskModalTriggerProps = {
  className?: string;
  label?: string;
  showIcon?: boolean;
  preset?: "task" | "reminder";
  icon?: LucideIcon;
};

export function NewTaskModalTrigger({
  className,
  label = "Neue Aufgabe",
  showIcon = true,
  preset = "task",
  icon: Icon = Plus,
}: NewTaskModalTriggerProps) {
  const [open, setOpen] = useState(false);
  const isReminder = preset === "reminder";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={label}
        className={
          className ??
          "inline-flex h-10 items-center gap-2 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-3 text-[13px] font-medium text-[#0F172A] transition-colors hover:border-[rgba(15,23,42,0.12)] hover:bg-[#F8FAFC] md:px-4 md:text-[14px]"
        }
      >
        {showIcon ? (
          <Icon
            className={cn(
              "h-4 w-4 shrink-0",
              isReminder ? "text-[#2F80ED]" : "text-[#2F80ED]"
            )}
            strokeWidth={isReminder ? 1.75 : 2}
          />
        ) : null}
        <span>{label}</span>
      </button>
      <NewTaskModal
        open={open}
        onClose={() => setOpen(false)}
        initialRecurrenceType={isReminder ? "weekly" : "once"}
        dialogTitle={isReminder ? "Erinnerung" : undefined}
        dialogHint={
          isReminder
            ? "Rückruf oder Kontrolle — Rhythmus und Termin nach Bedarf."
            : undefined
        }
      />
    </>
  );
}

function labelCls() {
  return "mb-1.5 block text-[12px] font-medium text-[#64748B]";
}

function fieldCls() {
  return "w-full rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2.5 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] shadow-none transition-colors focus:border-[rgba(15,23,42,0.14)] focus:outline-none focus:ring-2 focus:ring-[rgba(15,23,42,0.06)] disabled:cursor-not-allowed disabled:opacity-50";
}

type NewTaskModalProps = {
  open: boolean;
  onClose: () => void;
  initialRecurrenceType?: string;
  dialogTitle?: string;
  dialogHint?: string;
};

export function NewTaskModal({
  open,
  onClose,
  initialRecurrenceType = "once",
  dialogTitle = "Neue Aufgabe",
  dialogHint = "Kurz erfassen — Details können Sie später im Aufgabendetail ergänzen.",
}: NewTaskModalProps) {
  const router = useRouter();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<AssignableMember[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [assignMode, setAssignMode] = useState<AssignMode>("self");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState(initialRecurrenceType);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setRecurrenceType(initialRecurrenceType);
    setError(null);
    setAssignMode("self");
    setSelectedIds([]);
    setMemberPickerOpen(false);
    let cancelled = false;
    (async () => {
      const res = await fetchAssignableMembersForTaskCreate();
      if (cancelled) return;
      if (!res.ok) {
        setMembers([]);
        setMembersError(res.error);
        return;
      }
      setMembersError(null);
      setMembers(res.members);
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isPending, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const toggleMember = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement)?.value?.trim();
    if (!title) {
      setError("Bitte geben Sie einen Titel ein.");
      return;
    }
    if (assignMode === "specific" && selectedIds.length === 0) {
      setError("Bitte wählen Sie mindestens eine Person oder eine andere Zuweisung.");
      return;
    }
    setError(null);
    const fd = new FormData(form);
    fd.set("task_form", "modal");
    fd.delete("assign_all_team");
    fd.delete("assign_to_me");
    fd.delete("specific_recipient_ids[]");
    if (assignMode === "all") {
      fd.set("assign_all_team", "true");
    } else if (assignMode === "self") {
      fd.set("assign_to_me", "true");
    } else {
      for (const id of selectedIds) {
        fd.append("specific_recipient_ids[]", id);
      }
    }

    startTransition(async () => {
      const result = await createMyTask(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      form.reset();
      setAssignMode("self");
      setSelectedIds([]);
      onClose();
      router.refresh();
    });
  };

  if (!mounted || !open) return null;

  const overlay = (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[rgba(15,23,42,0.18)] p-0 sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[min(92dvh,920px)] w-full max-w-lg flex-col rounded-t-2xl border border-[rgba(15,23,42,0.06)] bg-[#FAFBFC] shadow-[0_8px_40px_-16px_rgba(15,23,42,0.18)] sm:rounded-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[rgba(15,23,42,0.06)] px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="text-[17px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              {dialogTitle}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-[#64748B]">{dialogHint}</p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => !isPending && onClose()}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[rgba(15,23,42,0.05)] hover:text-[#0F172A] disabled:opacity-50"
            aria-label="Schließen"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <fieldset
            disabled={isPending}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:space-y-5 sm:px-6 sm:py-6"
          >
            <div>
              <label htmlFor="nt-title" className={labelCls()}>
                Titel <span className="text-[#94A3B8]">(Pflichtfeld)</span>
              </label>
              <input
                ref={firstFieldRef}
                id="nt-title"
                name="title"
                required
                maxLength={200}
                autoComplete="off"
                className={fieldCls()}
                placeholder="z. B. Röntgenbilder nachfordern"
              />
            </div>

            <div>
              <label htmlFor="nt-desc" className={labelCls()}>
                Beschreibung <span className="font-normal text-[#94A3B8]">(optional)</span>
              </label>
              <textarea
                id="nt-desc"
                name="description"
                rows={3}
                className={cn(fieldCls(), "resize-y min-h-[88px]")}
                placeholder="Kontext, nächster Schritt oder Hinweise für das Team …"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nt-due" className={labelCls()}>
                  Fällig am <span className="font-normal text-[#94A3B8]">(optional)</span>
                </label>
                <input id="nt-due" name="due_date" type="date" className={fieldCls()} />
              </div>
              <div>
                <span className={labelCls()}>Priorität</span>
                <div className="flex flex-wrap gap-3 pt-0.5">
                  {(
                    [
                      { v: "low", l: "Niedrig" },
                      { v: "medium", l: "Mittel" },
                      { v: "high", l: "Hoch" },
                    ] as const
                  ).map(({ v, l }) => (
                    <label
                      key={v}
                      className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-[#475569]"
                    >
                      <input
                        type="radio"
                        name="priority_level"
                        value={v}
                        defaultChecked={v === "medium"}
                        className="h-4 w-4 border-[rgba(15,23,42,0.15)] text-[#2F80ED] focus:ring-[rgba(15,23,42,0.12)]"
                      />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <span className={labelCls()}>Zugewiesen an</span>
              <div className="space-y-2 rounded-lg border border-[rgba(15,23,42,0.06)] bg-white p-3">
                <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-[#334155]">
                  <input
                    type="radio"
                    name="assign_mode_ui"
                    value="self"
                    checked={assignMode === "self"}
                    onChange={() => {
                      setAssignMode("self");
                      setSelectedIds([]);
                    }}
                    className="h-4 w-4"
                  />
                  Sich selbst zuweisen
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-[#334155]">
                  <input
                    type="radio"
                    name="assign_mode_ui"
                    value="all"
                    checked={assignMode === "all"}
                    onChange={() => {
                      setAssignMode("all");
                      setSelectedIds([]);
                    }}
                    className="h-4 w-4"
                  />
                  An alle Mitarbeitenden
                </label>
                <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-[#334155]">
                  <input
                    type="radio"
                    name="assign_mode_ui"
                    value="specific"
                    checked={assignMode === "specific"}
                    onChange={() => setAssignMode("specific")}
                    className="h-4 w-4"
                  />
                  Bestimmte Personen
                </label>
                {assignMode === "specific" ? (
                  <div className="mt-2 border-t border-[rgba(15,23,42,0.05)] pt-3">
                    <button
                      type="button"
                      onClick={() => setMemberPickerOpen((o) => !o)}
                      className="flex w-full items-center justify-between rounded-lg border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC] px-3 py-2 text-left text-[13px] text-[#475569]"
                    >
                      <span className="truncate">
                        {selectedIds.length === 0
                          ? "Personen wählen …"
                          : `${selectedIds.length} ausgewählt`}
                      </span>
                      <span className="text-[#94A3B8]">{memberPickerOpen ? "▴" : "▾"}</span>
                    </button>
                    {memberPickerOpen ? (
                      <ul
                        className="mt-2 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-[rgba(15,23,42,0.06)] bg-white p-2"
                        role="listbox"
                        aria-label="Teammitglieder"
                      >
                        {members.length === 0 ? (
                          <li className="px-2 py-2 text-[12px] text-[#94A3B8]">
                            {membersError ?? "Keine Mitarbeitenden geladen."}
                          </li>
                        ) : (
                          members.map((m) => {
                            const checked = selectedIds.includes(m.user_id);
                            return (
                              <li key={m.user_id}>
                                <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] hover:bg-[#F8FAFC]">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleMember(m.user_id)}
                                    className="h-4 w-4 rounded border-[rgba(15,23,42,0.15)]"
                                  />
                                  <span className="min-w-0 truncate">{m.email}</span>
                                </label>
                              </li>
                            );
                          })
                        )}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <TaskRoutineFields
              disabled={isPending}
              recurrenceValue={recurrenceType}
              onRecurrenceChange={setRecurrenceType}
              showCustomInterval
            />

            <div>
              <label htmlFor="nt-tags" className={labelCls()}>
                Tags <span className="font-normal text-[#94A3B8]">(optional, durch Komma getrennt)</span>
              </label>
              <input
                id="nt-tags"
                name="tags"
                type="text"
                className={fieldCls()}
                placeholder="z. B. Labor, Rückfrage"
                autoComplete="off"
              />
            </div>

            {error ? (
              <p className="text-sm leading-snug text-danger" role="alert">
                {error}
              </p>
            ) : null}
          </fieldset>

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[rgba(15,23,42,0.06)] bg-white/80 px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              className="h-10 w-full sm:w-auto"
              onClick={() => !isPending && onClose()}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isPending} className="h-10 w-full min-w-[8rem] sm:w-auto">
              {isPending ? "Wird erstellt…" : "Erstellen"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
