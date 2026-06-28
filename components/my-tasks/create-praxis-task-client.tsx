"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition, useCallback } from "react";

import {
  createMyTask,
  fetchAssignableMembersForTaskCreate,
} from "@/app/(protected)/my-tasks/actions";
import { sendRelayMessageToRecipient } from "@/app/(protected)/my-tasks/messages-actions";
import { MedicalFormShell } from "@/components/forms/medical-form-shell";
import {
  MedicalFormFieldStack,
  MedicalFormFooterActions,
  MedicalFormLabel,
  MedicalFormSection,
  MedicalFormSegmented,
  MedicalFormTextarea,
} from "@/components/forms/medical-form-ui";
import {
  consumeCommandTaskDraft,
  subscribeCommandTaskDraft,
  type PendingCommandTaskDraft,
} from "@/lib/command-ai/task-draft-bridge";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { TaskRecurrenceType } from "@/lib/tasks/recurrence";
import { cn } from "@/lib/utils";

type CreateMode = "task" | "assign" | "message";
type AssignMode = "self" | "team" | "specific";
type TaskContextKind = "case" | "org" | "material" | "other";
type ReminderMode = "none" | "self" | "team";
type MsgRecipientMode = "person" | "people" | "team";

const MODE_OPTIONS = [
  { id: "task" as const, label: "Praxisaufgabe" },
  { id: "assign" as const, label: "Zuweisen" },
  { id: "message" as const, label: "Nachricht" },
];

const CONTEXT_OPTIONS = [
  { id: "case" as const, label: "Patientenfall" },
  { id: "org" as const, label: "Praxisorganisation" },
  { id: "material" as const, label: "Material / Befund" },
  { id: "other" as const, label: "Sonstiges" },
];

const PRIORITY_OPTIONS = [
  { id: "low" as const, label: "Niedrig" },
  { id: "medium" as const, label: "Mittel" },
  { id: "high" as const, label: "Hoch" },
];

const RECURRENCE_OPTIONS: { id: TaskRecurrenceType; label: string }[] = [
  { id: "once", label: "Einmalig" },
  { id: "daily", label: "Täglich" },
  { id: "weekly", label: "Wöchentlich" },
  { id: "monthly", label: "Monatlich" },
];

const REMINDER_OPTIONS = [
  { id: "none" as const, label: "Keine" },
  { id: "self" as const, label: "Mich erinnern" },
  { id: "team" as const, label: "Team erinnern" },
];

const MSG_RECIPIENT_OPTIONS = [
  { id: "person" as const, label: "Einzelperson" },
  { id: "people" as const, label: "Mehrere" },
  { id: "team" as const, label: "Gesamtes Team" },
];

const SHELL_COPY: Record<
  CreateMode,
  { title: string; primary: string; pending: string }
> = {
  task: {
    title: "Praxisaufgabe erstellen",
    primary: "Aufgabe erstellen",
    pending: "Wird erstellt…",
  },
  assign: {
    title: "Aufgabe zuweisen",
    primary: "Zuweisen",
    pending: "Wird zugewiesen…",
  },
  message: {
    title: "Interne Nachricht",
    primary: "Nachricht senden",
    pending: "Wird gesendet…",
  },
};

type CreatePraxisTaskClientProps = {
  cancelHref: string;
  initialMode?: CreateMode;
  submissionId?: string | null;
  initialTitle?: string;
  initialDescription?: string;
  initialDueDate?: string;
  onClose?: () => void;
  overlay?: "auth" | "workspace";
};

export function CreatePraxisTaskClient({
  cancelHref,
  initialMode = "task",
  submissionId = null,
  initialTitle = "",
  initialDescription = "",
  initialDueDate = "",
  onClose,
  overlay = "workspace",
}: CreatePraxisTaskClientProps) {
  const router = useRouter();
  const formId = useId();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<AssignableMember[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<CreateMode>(initialMode);

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [taskContext, setTaskContext] = useState<TaskContextKind>(
    submissionId ? "case" : "org"
  );
  const [assignMode, setAssignMode] = useState<AssignMode>(
    initialMode === "assign" ? "team" : "self"
  );
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [recurrence, setRecurrence] = useState<TaskRecurrenceType>("once");
  const [reminderMode, setReminderMode] = useState<ReminderMode>("none");

  const [msgRecipientMode, setMsgRecipientMode] = useState<MsgRecipientMode>("person");
  const [msgRecipientId, setMsgRecipientId] = useState("");
  const [msgRecipientIds, setMsgRecipientIds] = useState<string[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const [msgSubmissionId, setMsgSubmissionId] = useState(submissionId ?? "");

  const errorRef = useRef<HTMLDivElement>(null);
  const busy = isPending;
  const titleTrim = title.trim();
  const contextLocked = Boolean(submissionId);
  const shell = SHELL_COPY[createMode];
  const isTaskFlow = createMode === "task" || createMode === "assign";

  const applyCommandDraft = useCallback((draft: PendingCommandTaskDraft) => {
    setTitle(draft.title);
    setDescription(draft.notes ?? "");
    if (draft.dueDate) setDueDate(draft.dueDate);
    setError(null);
  }, []);

  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setDueDate(initialDueDate);
  }, [initialTitle, initialDescription, initialDueDate]);

  useEffect(() => {
    const pending = consumeCommandTaskDraft();
    if (pending) applyCommandDraft(pending);
    return subscribeCommandTaskDraft(applyCommandDraft);
  }, [applyCommandDraft]);

  useEffect(() => {
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
      if (res.currentUserId) setCurrentUserId(res.currentUserId);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!error) return;
    errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [error]);

  useEffect(() => {
    if (createMode === "assign" && assignMode === "self") {
      setAssignMode("team");
    }
  }, [createMode, assignMode]);

  const close = () => {
    if (busy) return;
    if (onClose) {
      onClose();
      return;
    }
    router.push(cancelHref);
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleMsgMember = (id: string) => {
    setMsgRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmitTask = () => {
    if (!titleTrim) {
      setError("Bitte geben Sie einen Titel für die Aufgabe an.");
      return;
    }
    if (assignMode === "specific" && selectedMemberIds.length === 0) {
      setError("Bitte wählen Sie mindestens eine Person aus.");
      return;
    }
    if (reminderMode !== "none" && !dueDate.trim()) {
      setError("Für eine Erinnerung ist ein Fälligkeitsdatum erforderlich.");
      return;
    }
    setError(null);

    const fd = new FormData();
    fd.set("task_form", "page");
    fd.set("title", titleTrim);
    fd.set("description", description.trim());
    fd.set("task_context", taskContext);
    if (dueDate.trim()) fd.set("due_date", dueDate.trim());
    fd.set("priority_level", priority);
    if (submissionId) fd.set("submission_id", submissionId);
    fd.set("recurrence_type", recurrence);

    if (reminderMode === "self") {
      fd.set("remind_self", "true");
      fd.set("remind_before", "one_day");
    } else if (reminderMode === "team") {
      fd.set("remind_assignees", "true");
      fd.set("remind_before", "one_day");
    }

    if (assignMode === "team") {
      fd.set("assign_all_team", "true");
    } else if (assignMode === "self") {
      fd.set("assign_to_me", "true");
    } else {
      for (const id of selectedMemberIds) fd.append("specific_recipient_ids[]", id);
    }

    startTransition(async () => {
      const result = await createMyTask(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      onClose?.();
      if (submissionId) {
        router.push(`/inbox/${submissionId}`);
      } else if (cancelHref.startsWith("/relay")) {
        router.push("/relay");
      } else {
        router.push("/my-tasks");
      }
      router.refresh();
    });
  };

  const handleSubmitMessage = () => {
    if (!messageBody.trim()) {
      setError("Bitte schreiben Sie eine Nachricht.");
      return;
    }
    if (msgRecipientMode === "person" && !msgRecipientId) {
      setError("Bitte wählen Sie einen Empfänger.");
      return;
    }
    if (msgRecipientMode === "people" && msgRecipientIds.length === 0) {
      setError("Bitte wählen Sie mindestens eine Person.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const res = await sendRelayMessageToRecipient({
        assignAllTeam: msgRecipientMode === "team",
        recipientUserId: msgRecipientMode === "person" ? msgRecipientId : undefined,
        recipientUserIds: msgRecipientMode === "people" ? msgRecipientIds : undefined,
        body: messageBody.trim(),
        submissionId: msgSubmissionId.trim() || null,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      onClose?.();
      if (res.conversationId) {
        router.push(`/relay?section=handoffs&conversation=${res.conversationId}`);
      } else if (cancelHref.startsWith("/relay")) {
        router.push("/relay?section=handoffs");
      } else {
        router.push(cancelHref);
      }
      router.refresh();
    });
  };

  const assignOptions =
    createMode === "assign"
      ? [
          { id: "team" as const, label: "Gesamtes Team" },
          { id: "specific" as const, label: "Bestimmte Personen" },
        ]
      : [
          { id: "self" as const, label: "Mir zuweisen" },
          { id: "team" as const, label: "Gesamtes Team" },
          { id: "specific" as const, label: "Bestimmte Personen" },
        ];

  return (
    <MedicalFormShell
      title={shell.title}
      onClose={close}
      closeDisabled={busy}
      ariaLabel={shell.title}
      overlayVariant={overlay}
      footer={
        <MedicalFormFooterActions
          onCancel={close}
          cancelDisabled={busy}
          primaryLabel={shell.primary}
          primaryPendingLabel={shell.pending}
          onPrimary={isTaskFlow ? handleSubmitTask : handleSubmitMessage}
          primaryDisabled={isTaskFlow ? !titleTrim : !messageBody.trim()}
          isPending={busy}
        />
      }
    >
      <div className="yd-medical-form">
        <MedicalFormSection title="Aktion">
          <MedicalFormSegmented
            name="create_mode"
            aria-label="Aktion wählen"
            options={MODE_OPTIONS}
            value={createMode}
            onChange={(v) => {
              if (!v || busy) return;
              setCreateMode(v);
              setError(null);
            }}
            disabled={busy}
          />
        </MedicalFormSection>

        <div ref={errorRef} aria-live="polite">
          {error ? (
            <p className="yd-medical-form-alert" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <fieldset
          disabled={busy}
          aria-busy={busy}
          className="m-0 min-w-0 border-0 p-0 disabled:pointer-events-none disabled:opacity-[0.58]"
        >
          {isTaskFlow ? (
            <>
              <MedicalFormSection title="Aufgabe">
                <MedicalFormFieldStack>
                  <div>
                    <MedicalFormLabel htmlFor={`${formId}-title`}>Titel</MedicalFormLabel>
                    <input
                      id={`${formId}-title`}
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={200}
                      autoComplete="off"
                      className="yd-auth-input"
                    />
                  </div>
                  <div>
                    <MedicalFormLabel htmlFor={`${formId}-desc`} optional>
                      Beschreibung
                    </MedicalFormLabel>
                    <MedicalFormTextarea
                      id={`${formId}-desc`}
                      value={description}
                      onChange={setDescription}
                      rows={4}
                    />
                  </div>
                </MedicalFormFieldStack>
              </MedicalFormSection>

              <MedicalFormSection title="Kontext">
                <MedicalFormSegmented
                  name="task_context"
                  aria-label="Aufgabenkontext"
                  options={CONTEXT_OPTIONS}
                  value={taskContext}
                  onChange={(v) => v && setTaskContext(v)}
                  disabled={contextLocked || busy}
                />
              </MedicalFormSection>

              <MedicalFormSection title="Verantwortlichkeit">
                <MedicalFormSegmented
                  name="assign_mode"
                  aria-label="Zuweisung"
                  options={assignOptions}
                  value={assignMode}
                  onChange={(v) => v && setAssignMode(v)}
                  disabled={busy}
                />
                {assignMode === "specific" ? (
                  <div className="mt-4 space-y-2">
                    <MedicalFormLabel>Personen</MedicalFormLabel>
                    {members
                      .filter((m) => m.user_id !== currentUserId)
                      .map((m) => (
                        <label
                          key={m.user_id}
                          className="flex cursor-pointer items-center gap-2 text-[14px] text-[#334155]"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMemberIds.includes(m.user_id)}
                            onChange={() => toggleMember(m.user_id)}
                          />
                          <span className="truncate">{m.email}</span>
                        </label>
                      ))}
                    {membersError ? (
                      <p className="yd-medical-form-context-note">{membersError}</p>
                    ) : null}
                  </div>
                ) : null}
              </MedicalFormSection>

              <MedicalFormSection title="Planung">
                <MedicalFormFieldStack>
                  <div>
                    <MedicalFormLabel htmlFor={`${formId}-due`} optional>
                      Fälligkeitsdatum
                    </MedicalFormLabel>
                    <input
                      id={`${formId}-due`}
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="yd-auth-input"
                    />
                  </div>
                  <div>
                    <MedicalFormLabel>Priorität</MedicalFormLabel>
                    <MedicalFormSegmented
                      name="priority"
                      aria-label="Priorität"
                      options={PRIORITY_OPTIONS}
                      value={priority}
                      onChange={(v) => v && setPriority(v)}
                      disabled={busy}
                    />
                  </div>
                </MedicalFormFieldStack>
              </MedicalFormSection>

              <MedicalFormSection title="Rhythmus & Erinnerung" className="yd-medical-form-routine">
                <MedicalFormFieldStack>
                  <div>
                    <MedicalFormLabel optional>Wiederholung</MedicalFormLabel>
                    <MedicalFormSegmented
                      name="recurrence_type"
                      aria-label="Wiederholung"
                      options={RECURRENCE_OPTIONS}
                      value={recurrence}
                      onChange={(v) => v && setRecurrence(v)}
                      disabled={busy}
                    />
                  </div>
                  <div>
                    <MedicalFormLabel optional>Erinnerung</MedicalFormLabel>
                    <MedicalFormSegmented
                      name="reminder_mode"
                      aria-label="Erinnerung"
                      options={REMINDER_OPTIONS}
                      value={reminderMode}
                      onChange={(v) => v && setReminderMode(v)}
                      disabled={busy}
                    />
                    {reminderMode !== "none" && !dueDate.trim() ? (
                      <p className="yd-medical-form-context-note" role="alert">
                        Bitte ein Fälligkeitsdatum setzen, damit die Erinnerung ausgelöst werden kann.
                      </p>
                    ) : null}
                  </div>
                </MedicalFormFieldStack>
              </MedicalFormSection>
            </>
          ) : (
            <>
              <MedicalFormSection title="Empfänger">
                <MedicalFormSegmented
                  name="msg_recipient_mode"
                  aria-label="Empfänger"
                  options={MSG_RECIPIENT_OPTIONS}
                  value={msgRecipientMode}
                  onChange={(v) => v && setMsgRecipientMode(v)}
                  disabled={busy}
                />
                {msgRecipientMode === "person" ? (
                  <div className="mt-4">
                    <MedicalFormLabel htmlFor={`${formId}-msg-to`}>Person</MedicalFormLabel>
                    <select
                      id={`${formId}-msg-to`}
                      value={msgRecipientId}
                      onChange={(e) => setMsgRecipientId(e.target.value)}
                      className={cn("yd-auth-input", "yd-medical-form-select")}
                    >
                      <option value="">Bitte wählen …</option>
                      {members
                        .filter((m) => m.user_id !== currentUserId)
                        .map((m) => (
                          <option key={m.user_id} value={m.user_id}>
                            {m.email}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : null}
                {msgRecipientMode === "people" ? (
                  <div className="mt-4 space-y-2">
                    <MedicalFormLabel>Personen</MedicalFormLabel>
                    {members
                      .filter((m) => m.user_id !== currentUserId)
                      .map((m) => (
                        <label
                          key={m.user_id}
                          className="flex cursor-pointer items-center gap-2 text-[14px] text-[#334155]"
                        >
                          <input
                            type="checkbox"
                            checked={msgRecipientIds.includes(m.user_id)}
                            onChange={() => toggleMsgMember(m.user_id)}
                          />
                          <span className="truncate">{m.email}</span>
                        </label>
                      ))}
                  </div>
                ) : null}
                {membersError ? (
                  <p className="yd-medical-form-context-note">{membersError}</p>
                ) : null}
              </MedicalFormSection>

              <MedicalFormSection title="Nachricht">
                <MedicalFormLabel htmlFor={`${formId}-msg-body`}>Text</MedicalFormLabel>
                <MedicalFormTextarea
                  id={`${formId}-msg-body`}
                  value={messageBody}
                  onChange={setMessageBody}
                  rows={5}
                />
              </MedicalFormSection>

              <MedicalFormSection title="Bezug">
                <MedicalFormFieldStack>
                  <div>
                    <MedicalFormLabel htmlFor={`${formId}-msg-sub`} optional>
                      Tracker-Fall-ID
                    </MedicalFormLabel>
                    <input
                      id={`${formId}-msg-sub`}
                      type="text"
                      value={msgSubmissionId}
                      onChange={(e) => setMsgSubmissionId(e.target.value)}
                      className="yd-auth-input"
                      disabled={Boolean(submissionId)}
                    />
                  </div>
                </MedicalFormFieldStack>
              </MedicalFormSection>
            </>
          )}
        </fieldset>
      </div>
    </MedicalFormShell>
  );
}
