"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createTask } from "@/app/(protected)/inbox/[id]/actions";
import { Button } from "@/components/ui/button";
import type { AssignableMember } from "@/lib/queries/team-members";

interface TaskFormProps {
  submissionId: string;
  assignableMembers: AssignableMember[];
}

export function TaskForm({ submissionId, assignableMembers }: TaskFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const hasAssignableMembers = assignableMembers.length > 0;
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [assignAllTeam, setAssignAllTeam] = useState(false);
  const [assignToMe, setAssignToMe] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const doctors = assignableMembers.filter((member) => member.role === "doctor");
  const teamMembers = assignableMembers.filter((member) => member.role !== "doctor");
  const search = searchTerm.trim().toLowerCase();

  const filteredDoctors = useMemo(
    () =>
      doctors.filter((member) => member.email.toLowerCase().includes(search)),
    [doctors, search]
  );
  const filteredTeamMembers = useMemo(
    () =>
      teamMembers.filter((member) => member.email.toLowerCase().includes(search)),
    [teamMembers, search]
  );

  const toggleRecipient = (memberId: string) => {
    setAssignAllTeam(false);
    setSelectedRecipientIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleAllTeam = (checked: boolean) => {
    setAssignAllTeam(checked);
    if (checked) {
      setSelectedRecipientIds([]);
      setAssignToMe(false);
    }
  };

  const toggleMe = (checked: boolean) => {
    setAssignToMe(checked);
    if (checked) {
      setAssignAllTeam(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabels = assignableMembers
    .filter((member) => selectedRecipientIds.includes(member.user_id))
    .map((member) => member.email);

  const triggerLabel = assignAllTeam
    ? "An alle Mitarbeiter"
    : assignToMe && selectedLabels.length === 0
      ? "Me"
      : assignToMe && selectedLabels.length > 0
        ? `Me, ${selectedLabels.length} User ausgewählt`
    : selectedLabels.length === 0
      ? "User auswählen"
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : `${selectedLabels.length} User ausgewählt`;

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createTask(formData);
      if (result.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        setSelectedRecipientIds([]);
        setAssignAllTeam(false);
        setAssignToMe(false);
      }
    });
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3" aria-busy={isPending}>
      <input type="hidden" name="submission_id" value={submissionId} />

      <div className={`space-y-2 ${isDropdownOpen ? "pb-72" : ""}`}>
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            disabled={isPending}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex h-11 w-full items-center justify-between rounded border border-border bg-surface-card px-3 text-left text-sm text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50 sm:h-9"
          >
            <span className="truncate">{triggerLabel}</span>
            <span className="ml-2 text-text-tertiary">{isDropdownOpen ? "▴" : "▾"}</span>
          </button>
          {isDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full rounded border border-border bg-surface-card p-2 shadow-2xl">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="User suchen..."
                disabled={isPending}
                className="mb-2 h-9 w-full rounded border border-border bg-surface-page px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm font-medium text-text-primary hover:bg-surface-page/80">
                  <input
                    type="checkbox"
                    checked={assignToMe}
                    disabled={assignAllTeam || isPending}
                    onChange={(event) => toggleMe(event.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span>=Me=</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm font-medium text-text-primary hover:bg-surface-page/80">
                  <input
                    type="checkbox"
                    checked={assignAllTeam}
                    disabled={isPending}
                    onChange={(event) => toggleAllTeam(event.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span>An alle Mitarbeiter</span>
                </label>
                {filteredDoctors.length > 0 && (
                  <>
                    <p className="pt-1 text-xs text-text-tertiary">Ärzte</p>
                    {filteredDoctors.map((member) => {
                      const checked = selectedRecipientIds.includes(member.user_id);
                      return (
                        <label
                          key={member.user_id}
                          className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-text-primary hover:bg-surface-page/80"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={assignAllTeam || isPending}
                            onChange={() => toggleRecipient(member.user_id)}
                            className="h-4 w-4 rounded border-border"
                          />
                          <span className="truncate">{member.email}</span>
                        </label>
                      );
                    })}
                  </>
                )}
                {filteredTeamMembers.length > 0 && (
                  <>
                    <p className="pt-1 text-xs text-text-tertiary">Mitarbeiter</p>
                    {filteredTeamMembers.map((member) => {
                      const checked = selectedRecipientIds.includes(member.user_id);
                      return (
                        <label
                          key={member.user_id}
                          className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-text-primary hover:bg-surface-page/80"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={assignAllTeam || isPending}
                            onChange={() => toggleRecipient(member.user_id)}
                            className="h-4 w-4 rounded border-border"
                          />
                          <span className="truncate">{member.email}</span>
                        </label>
                      );
                    })}
                  </>
                )}
                {filteredDoctors.length === 0 && filteredTeamMembers.length === 0 && !assignAllTeam && (
                  <p className="px-1 py-2 text-xs text-text-tertiary">Keine User gefunden.</p>
                )}
              </div>
            </div>
          )}
        </div>
        {assignToMe && <input type="hidden" name="assign_to_me" value="true" />}
        {assignAllTeam && <input type="hidden" name="assign_all_team" value="true" />}
        {selectedRecipientIds.map((recipientId) => (
          <input
            key={recipientId}
            type="hidden"
            name="specific_recipient_ids[]"
            value={recipientId}
          />
        ))}

      </div>

      <input
        type="text"
        name="title"
        placeholder="Titel"
        maxLength={120}
        disabled={isPending}
        className="h-10 w-full rounded border border-border bg-surface-card px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <textarea
        name="content"
        placeholder="Aufgabe kurz und klar beschreiben…"
        required
        rows={2}
        disabled={isPending}
        className="w-full resize-none rounded border border-border bg-surface-card px-3 py-2 text-sm leading-6 text-text-primary placeholder:text-text-tertiary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <Button
        type="submit"
        disabled={
          isPending ||
          (!assignAllTeam && selectedRecipientIds.length === 0 && hasAssignableMembers)
        }
        size="sm"
        className="min-h-11 w-full sm:min-h-9 sm:w-auto"
      >
        {isPending ? "Wird gespeichert…" : "Aufgabe hinzufügen"}
      </Button>
      <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          name="is_important"
          value="true"
          disabled={isPending}
          className="h-4 w-4 rounded border-border disabled:cursor-not-allowed disabled:opacity-50"
        />
        Als wichtig markieren
      </label>

      {error && (
        <p
          className="text-sm leading-5 text-danger"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {error}
        </p>
      )}
    </form>
  );
}
