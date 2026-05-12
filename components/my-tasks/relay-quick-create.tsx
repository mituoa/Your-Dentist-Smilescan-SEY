"use client";

/**
 * Quick-Create — **Punkt 4–5** s. `relay/page.tsx`; **Punkt 8 (Error):** ruhige Fehlerfläche (`role="alert"`),
 * Texte aus `createMyTask`. **Punkt 9 (Mobile):** `text-base`-Input, min. 44px-Steuerflächen, `touch-manipulation`.
 * **Punkt 11 (MVP):** Ein Eingabefeld + Zuweisung/Priorität — **kein** Mehrzeilen-Editor, keine Vorlagen,
 * keine Automatisierung; s. `relay/page.tsx` (Punkt 11).
 * **Punkt 12:** Vorlagen/Makros/Smart-Defaults = **Future oder Non-MVP** — nicht still in Quick-Create ergänzen;
 * s. `relay/page.tsx` (Punkt 12).
 * **Punkt 13:** Quick-Create bewusst **einfach halten** — P0 liegt auf Zuverlässigkeit der Kernpfade, nicht auf
 * mehr Eingabe-Features; s. `relay/page.tsx` (Punkt 13).
 */

import { ChevronDown, User } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { createMyTask } from "@/app/(protected)/my-tasks/actions";
import type { AssignableMember } from "@/lib/queries/team-members";
import { buildMemberAvatarMap, emailInitials } from "@/lib/tasks/relay-helpers";
import { cn } from "@/lib/utils";

interface RelayQuickCreateProps {
  assignableMembers: AssignableMember[];
  currentUserId: string;
  currentUserEmail: string | null;
  /** Optional; Standard siehe Implementierung. */
  inputPlaceholder?: string;
}

export function RelayQuickCreate({
  assignableMembers,
  currentUserId,
  currentUserEmail,
  inputPlaceholder,
}: RelayQuickCreateProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [line, setLine] = useState("");
  const [focused, setFocused] = useState(false);
  const [important, setImportant] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [assignAll, setAssignAll] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const avatarMap = buildMemberAvatarMap(assignableMembers);
  const selfInitials = currentUserEmail ? emailInitials(currentUserEmail) : "Ich";

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const toggleMember = (id: string) => {
    setAssignAll(false);
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = () => {
    const content = line.trim();
    if (!content) return;
    setError(null);
    const fd = new FormData();
    fd.set("content", content);
    fd.set("title", content.length > 120 ? content.slice(0, 120) : content);
    if (important) fd.set("is_important", "true");
    if (assignAll) {
      fd.set("assign_all_team", "true");
    } else if (selectedIds.length > 0) {
      for (const id of selectedIds) {
        fd.append("specific_recipient_ids[]", id);
      }
    } else {
      fd.set("assign_to_me", "true");
    }

    startTransition(async () => {
      const result = await createMyTask(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      setLine("");
      setImportant(false);
      setSelectedIds([]);
      setAssignAll(false);
      setDropdownOpen(false);
    });
  };

  const resolvedPlaceholder =
    inputPlaceholder != null && inputPlaceholder.trim().length > 0
      ? inputPlaceholder.trim()
      : "Aufgabe in einem kurzen Satz …";

  const showOptions = focused || dropdownOpen;

  return (
    <div
      ref={wrapRef}
      id="relay-quick-create"
      aria-busy={isPending}
      className={cn(
        "mb-8 rounded-xl border border-[rgba(15,23,42,0.06)] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow]",
        focused
          ? "border-[rgba(15,23,42,0.14)] shadow-[0_0_0_2px_rgba(15,23,42,0.06)]"
          : "hover:border-[rgba(15,23,42,0.1)]"
      )}
    >
      <input
        type="text"
        value={line}
        onChange={(e) => setLine(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isPending) submit();
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setTimeout(() => setFocused(false), 180);
        }}
        disabled={isPending}
        placeholder={resolvedPlaceholder}
        className="w-full border-0 bg-transparent p-0 text-base text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-0"
      />

      {showOptions ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-[rgba(15,23,42,0.06)] pt-4 sm:flex-row sm:items-stretch">
          <div className="relative min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex min-h-[44px] w-full items-center gap-2 rounded-lg border border-[rgba(15,23,42,0.08)] px-3 text-left transition-colors hover:border-[rgba(15,23,42,0.12)] hover:bg-[#F8FAFC] touch-manipulation"
            >
              {assignAll ? (
                <>
                  <User className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                  <span className="truncate text-[13px] text-[#1E293B]">Alle im Team</span>
                </>
              ) : selectedIds.length === 0 ? (
                <>
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ background: "#64748B" }}
                    title="Ihnen zugewiesen"
                  >
                    {selfInitials.slice(0, 2)}
                  </div>
                  <span className="truncate text-[13px] text-[#64748B]">Selbst zuweisen (Standard)</span>
                </>
              ) : (
                <>
                  <div className="flex shrink-0 -space-x-1.5">
                    {selectedIds.slice(0, 4).map((id) => {
                      const a = avatarMap[id];
                      return (
                        <div
                          key={id}
                          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-semibold text-white"
                          style={{ background: a?.color ?? "#64748B" }}
                        >
                          {a?.initials ?? "?"}
                        </div>
                      );
                    })}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-left text-[13px] text-[#1E293B]">
                    {selectedIds.length} Person{selectedIds.length === 1 ? "" : "en"}
                  </span>
                </>
              )}
              <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-[#94A3B8]" />
            </button>

            {dropdownOpen ? (
              <div
                className="absolute left-0 right-0 z-50 mt-2 max-h-56 overflow-auto rounded-lg border border-[rgba(15,23,42,0.08)] bg-white p-2 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.1)]"
                onMouseDown={(e) => e.preventDefault()}
              >
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[13px] hover:bg-[#F8FAFC]">
                  <input
                    type="radio"
                    name="relay-assign-mode"
                    checked={!assignAll && selectedIds.length === 0}
                    onChange={() => {
                      setAssignAll(false);
                      setSelectedIds([]);
                    }}
                    className="h-4 w-4"
                  />
                  <span>Selbst zuweisen</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[13px] hover:bg-[#F8FAFC]">
                  <input
                    type="radio"
                    name="relay-assign-mode"
                    checked={assignAll}
                    onChange={() => {
                      setAssignAll(true);
                      setSelectedIds([]);
                    }}
                    className="h-4 w-4"
                  />
                  <span>An alle Mitarbeitenden</span>
                </label>
                <div className="my-1 border-t border-[rgba(15,23,42,0.06)]" />
                {assignableMembers
                  .filter((m) => m.user_id !== currentUserId)
                  .map((m) => {
                    const checked = selectedIds.includes(m.user_id);
                    const a = avatarMap[m.user_id];
                    return (
                      <button
                        key={m.user_id}
                        type="button"
                        onClick={() => {
                          setAssignAll(false);
                          toggleMember(m.user_id);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] hover:bg-[#F8FAFC]"
                      >
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                          style={{ background: a?.color ?? "#64748B" }}
                        >
                          {a?.initials ?? "?"}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{m.email}</span>
                        {checked ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#64748B]" /> : null}
                      </button>
                    );
                  })}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setImportant((v) => !v)}
            className={cn(
              "flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg border border-[rgba(15,23,42,0.08)] px-3 transition-colors touch-manipulation sm:self-start",
              important ? "bg-[rgba(220,38,38,0.06)]" : "hover:border-[rgba(15,23,42,0.1)] hover:bg-[#F8FAFC]"
            )}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: important ? "#DC2626" : "#CBD5E1" }}
            />
            <span className={cn("text-[13px]", important ? "font-medium text-[#DC2626]" : "text-[#64748B]")}>
              Als wichtig einstufen
            </span>
          </button>
        </div>
      ) : null}

      {error ? (
        <div
          className="mt-3 rounded-lg border border-[rgba(220,38,38,0.12)] bg-[rgba(254,242,242,0.45)] px-3 py-2.5"
          role="alert"
        >
          <p className="text-sm leading-snug text-[#7F1D1D]">{error}</p>
        </div>
      ) : null}

      {line.trim() && !showOptions ? (
        <p className="mt-2 text-[11px] text-[#94A3B8]">
          Eingabetaste speichert. Zum Ändern von Zuweisung und Priorität das Feld erneut fokussieren.
        </p>
      ) : null}
    </div>
  );
}
