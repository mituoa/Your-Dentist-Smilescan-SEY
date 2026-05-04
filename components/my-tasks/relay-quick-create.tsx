"use client";

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
}

export function RelayQuickCreate({
  assignableMembers,
  currentUserId,
  currentUserEmail,
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

  const showOptions = focused || dropdownOpen;

  return (
    <div
      ref={wrapRef}
      id="relay-quick-create"
      className={cn(
        "mb-8 rounded-xl border bg-white px-5 py-4 transition-shadow",
        focused ? "border-[#2F80ED] shadow-[0_0_0_3px_rgba(47,128,237,0.08)]" : "border-[#E2E8F0]"
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
        placeholder="Was steht als Nächstes an?"
        className="w-full border-0 bg-transparent p-0 text-[15px] text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-0"
      />

      {showOptions ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-[#F1F5F9] pt-4 sm:flex-row sm:items-stretch">
          <div className="relative min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex h-10 w-full items-center gap-2 rounded-lg border border-[#F1F5F9] px-3 text-left transition-colors hover:bg-[#F8FAFC]"
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
                    style={{ background: "#2F80ED" }}
                    title="Dir zugewiesen"
                  >
                    {selfInitials.slice(0, 2)}
                  </div>
                  <span className="truncate text-[13px] text-[#64748B]">Dir zuweisen (Standard)</span>
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
                className="absolute left-0 right-0 z-50 mt-2 max-h-56 overflow-auto rounded-lg border border-[#E2E8F0] bg-white p-2 shadow-lg"
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
                  <span>Mir zuweisen</span>
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
                <div className="my-1 border-t border-[#F1F5F9]" />
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
                        {checked ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2F80ED]" /> : null}
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
              "flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[#F1F5F9] px-3 transition-colors sm:self-start",
              important ? "bg-[rgba(220,38,38,0.06)]" : "hover:bg-[#F8FAFC]"
            )}
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: important ? "#DC2626" : "#CBD5E1" }}
            />
            <span className={cn("text-[13px]", important ? "font-medium text-[#DC2626]" : "text-[#64748B]")}>
              Als wichtig markieren
            </span>
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

      {line.trim() && !showOptions ? (
        <p className="mt-2 text-[11px] text-[#94A3B8]">
          Enter zum Speichern · in das Feld tippen für Zuweisung und Priorität
        </p>
      ) : null}
    </div>
  );
}
