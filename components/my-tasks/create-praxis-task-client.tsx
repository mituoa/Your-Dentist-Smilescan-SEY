"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import {
  createMyTask,
  fetchAssignableMembersForTaskCreate,
} from "@/app/(protected)/my-tasks/actions";
import { MedicalFormShell } from "@/components/forms/medical-form-shell";
import {
  MedicalFormFieldStack,
  MedicalFormFooterActions,
  MedicalFormLabel,
  MedicalFormSection,
  MedicalFormSegmented,
  MedicalFormTextarea,
} from "@/components/forms/medical-form-ui";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { TaskRecurrenceType } from "@/lib/tasks/recurrence";
import { cn } from "@/lib/utils";

type AssignMode = "self" | "team" | "specific";
type TaskContextKind = "case" | "org" | "material" | "other";
type ReminderMode = "none" | "self" | "team";

const WIZARD_STEPS = [
  { id: 1, title: "Aufgabe", lead: "Was soll erledigt werden?" },
  { id: 2, title: "Kontext", lead: "Einordnung in Praxis oder Fall" },
  { id: 3, title: "Verantwortlichkeit", lead: "Wer übernimmt die Aufgabe?" },
  { id: 4, title: "Planung", lead: "Fälligkeit und Priorität" },
  { id: 5, title: "Rhythmus", lead: "Wiederholung und Erinnerung (optional)" },
] as const;

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

type CreatePraxisTaskClientProps = {
  cancelHref: string;
  submissionId?: string | null;
  initialTitle?: string;
  initialDescription?: string;
  initialDueDate?: string;
};

export function CreatePraxisTaskClient({
  cancelHref,
  submissionId = null,
  initialTitle = "",
  initialDescription = "",
  initialDueDate = "",
}: CreatePraxisTaskClientProps) {
  const router = useRouter();
  const formId = useId();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<AssignableMember[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [taskContext, setTaskContext] = useState<TaskContextKind>(
    submissionId ? "case" : "org"
  );
  const [assignMode, setAssignMode] = useState<AssignMode>("self");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [recurrence, setRecurrence] = useState<TaskRecurrenceType>("once");
  const [reminderMode, setReminderMode] = useState<ReminderMode>("none");

  const errorRef = useRef<HTMLDivElement>(null);
  const busy = isPending;
  const activeStep = WIZARD_STEPS[step - 1]!;
  const titleTrim = title.trim();
  const canAdvanceStep1 = titleTrim.length > 0;
  const contextLocked = Boolean(submissionId);

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
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!error) return;
    errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [error]);

  const close = () => {
    if (busy) return;
    router.push(cancelHref);
  };

  const validateStep = (targetStep: number): string | null => {
    if (targetStep >= 2 && !titleTrim) {
      return "Bitte geben Sie einen Titel für die Aufgabe an.";
    }
    if (targetStep >= 4 && assignMode === "specific" && !selectedMemberId) {
      return "Bitte wählen Sie eine Person aus.";
    }
    if (
      targetStep >= 5 &&
      reminderMode !== "none" &&
      !dueDate.trim()
    ) {
      return "Für eine Erinnerung ist ein Fälligkeitsdatum in der Planung erforderlich.";
    }
    return null;
  };

  const goNext = () => {
    if (busy) return;
    const msg = validateStep(step + 1);
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    setStep((s) => Math.min(5, s + 1));
  };

  const goBack = () => {
    if (busy || step <= 1) return;
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = () => {
    if (busy) return;
    const stepErr = validateStep(5);
    if (stepErr) {
      setError(stepErr);
      return;
    }
    if (!titleTrim) {
      setError("Bitte geben Sie einen Titel für die Aufgabe an.");
      setStep(1);
      return;
    }
    if (assignMode === "specific" && !selectedMemberId) {
      setError("Bitte wählen Sie eine Person aus.");
      setStep(3);
      return;
    }
    if (reminderMode !== "none" && !dueDate.trim()) {
      setError("Für eine Erinnerung ist ein Fälligkeitsdatum erforderlich.");
      setStep(4);
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
      fd.append("specific_recipient_ids[]", selectedMemberId);
    }

    startTransition(async () => {
      const result = await createMyTask(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (submissionId) {
        router.push(`/inbox/${submissionId}`);
      } else {
        router.push("/my-tasks");
      }
      router.refresh();
    });
  };

  const wizardFooter =
    step < 5 ? (
      <div className="yd-medical-wizard-footer">
        <button
          type="button"
          className="yd-auth-btn-secondary yd-medical-form-footer__cancel"
          disabled={busy || step <= 1}
          onClick={goBack}
        >
          Zurück
        </button>
        <button
          type="button"
          className="yd-auth-btn-primary yd-medical-form-footer__primary"
          disabled={busy || (step === 1 && !canAdvanceStep1)}
          onClick={goNext}
        >
          Weiter
        </button>
      </div>
    ) : (
      <MedicalFormFooterActions
        onCancel={close}
        cancelDisabled={busy}
        primaryLabel="Aufgabe erstellen"
        primaryPendingLabel="Wird erstellt…"
        onPrimary={handleSubmit}
        primaryDisabled={!canAdvanceStep1}
        isPending={busy}
      />
    );

  return (
    <MedicalFormShell
      title="Praxisaufgabe erstellen"
      subtitle="Strukturierte Aufgabe für Team, Patientenfall oder Praxisorganisation."
      onClose={close}
      closeDisabled={busy}
      ariaLabel="Praxisaufgabe erstellen"
      footer={wizardFooter}
    >
      <div className="yd-medical-form">
        <div className="yd-medical-wizard-progress" aria-hidden>
          <div
            className="yd-medical-wizard-progress__bar"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />
        </div>
        <p className="yd-medical-wizard-step-label">
          Schritt {step} von 5 · {activeStep.title}
        </p>

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
          {step === 1 ? (
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
                    placeholder="z. B. Röntgenbilder nachfordern"
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
                    placeholder="Kontext oder nächster Schritt für das Team …"
                  />
                </div>
              </MedicalFormFieldStack>
            </MedicalFormSection>
          ) : null}

          {step === 2 ? (
            <MedicalFormSection title="Kontext" hint={activeStep.lead}>
              <MedicalFormSegmented
                name="task_context"
                aria-label="Aufgabenkontext"
                options={CONTEXT_OPTIONS}
                value={taskContext}
                onChange={(v) => v && setTaskContext(v)}
                disabled={contextLocked || busy}
              />
              {contextLocked ? (
                <p className="yd-medical-form-context-note">
                  Diese Aufgabe wird dem geöffneten Patientenfall zugeordnet.
                </p>
              ) : null}
            </MedicalFormSection>
          ) : null}

          {step === 3 ? (
            <MedicalFormSection title="Verantwortlichkeit">
              <MedicalFormSegmented
                name="assign_mode"
                aria-label="Zuweisung"
                options={[
                  { id: "self" as const, label: "Mir zuweisen" },
                  { id: "team" as const, label: "Team" },
                  { id: "specific" as const, label: "Bestimmte Person" },
                ]}
                value={assignMode}
                onChange={(v) => v && setAssignMode(v)}
                disabled={busy}
              />
              {assignMode === "specific" ? (
                <div className="mt-4">
                  <MedicalFormLabel htmlFor={`${formId}-member`}>Person</MedicalFormLabel>
                  <select
                    id={`${formId}-member`}
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className={cn("yd-auth-input", "yd-medical-form-select")}
                  >
                    <option value="">Bitte wählen …</option>
                    {members.map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.email}
                      </option>
                    ))}
                  </select>
                  {membersError ? (
                    <p className="yd-medical-form-context-note">{membersError}</p>
                  ) : null}
                </div>
              ) : null}
            </MedicalFormSection>
          ) : null}

          {step === 4 ? (
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
          ) : null}

          {step === 5 ? (
            <MedicalFormSection
              title="Rhythmus & Erinnerung"
              hint="Optional — für wiederkehrende Routinen oder Erinnerungen."
              className="yd-medical-form-routine"
            >
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
                    <p className="yd-medical-form-context-note">
                      Bitte in Schritt Planung ein Fälligkeitsdatum setzen, damit die Erinnerung
                      ausgelöst werden kann.
                    </p>
                  ) : reminderMode !== "none" && dueDate.trim() ? (
                    <p className="yd-medical-form-context-note">
                      Erinnerung einen Tag vor dem Fälligkeitstermin.
                    </p>
                  ) : null}
                </div>
              </MedicalFormFieldStack>
            </MedicalFormSection>
          ) : null}
        </fieldset>
      </div>
    </MedicalFormShell>
  );
}
