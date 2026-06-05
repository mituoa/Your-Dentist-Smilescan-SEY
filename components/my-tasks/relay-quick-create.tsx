"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { createMyTask } from "@/app/(protected)/my-tasks/actions";
import { sendRelayMessageToRecipient } from "@/app/(protected)/my-tasks/messages-actions";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { RelayTaskCategory } from "@/lib/relay/relay-task-category";
import {
  defaultDomainForSection,
  domainById,
  relayDomainsForRole,
} from "@/lib/relay/relay-practice-domains";
import {
  closeRelayQuickCreate,
  getRelayQuickCreateState,
  getRelayQuickCreateVersion,
  subscribeRelayQuickCreate,
  type RelayQuickCreateMode,
} from "@/lib/relay/relay-quick-create-bus";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import type { TaskRecurrenceType } from "@/lib/tasks/recurrence";
import { cn } from "@/lib/utils";

type RelayQuickCreateProps = {
  assignableMembers: AssignableMember[];
  currentUserId: string;
  isDoctor: boolean;
  isRelay: boolean;
};

type RecipientMode = "me" | "team" | "people";

const RECURRENCE_OPTIONS: { id: TaskRecurrenceType; label: string }[] = [
  { id: "once", label: "Einmalig" },
  { id: "weekly", label: "Wöchentlich" },
  { id: "monthly", label: "Monatlich" },
];

export function RelayQuickCreate({
  assignableMembers,
  currentUserId,
  isDoctor,
  isRelay,
}: RelayQuickCreateProps) {
  useSyncExternalStore(subscribeRelayQuickCreate, getRelayQuickCreateVersion, getRelayQuickCreateVersion);

  const bus = getRelayQuickCreateState();
  if (!bus.open || !bus.anchor) return null;

  return (
    <RelayQuickCreatePopover
      key={`${bus.section}-${bus.preferredMode}-${bus.anchor.top}`}
      anchor={bus.anchor}
      section={bus.section}
      initialMode={bus.preferredMode}
      assignableMembers={assignableMembers}
      currentUserId={currentUserId}
      isDoctor={isDoctor}
      isRelay={isRelay}
      onClose={closeRelayQuickCreate}
    />
  );
}

function RelayQuickCreatePopover({
  anchor,
  section,
  initialMode,
  assignableMembers,
  currentUserId,
  isDoctor,
  isRelay,
  onClose,
}: {
  anchor: { top: number; left: number; right: number; bottom: number; width: number };
  section: "operations" | "routines" | "handoffs";
  initialMode: RelayQuickCreateMode;
  assignableMembers: AssignableMember[];
  currentUserId: string;
  isDoctor: boolean;
  isRelay: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const formId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<RelayQuickCreateMode>(initialMode);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domainId, setDomainId] = useState<RelayTaskCategory>(defaultDomainForSection(section));
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"normal" | "high">("normal");
  const [recurrence, setRecurrence] = useState<TaskRecurrenceType>(
    section === "routines" ? "weekly" : "once"
  );
  const [patientRef, setPatientRef] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [assignMode, setAssignMode] = useState<RecipientMode>("me");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [messageBody, setMessageBody] = useState("");
  const [msgRecipientMode, setMsgRecipientMode] = useState<"person" | "people" | "team">("person");
  const [msgRecipientId, setMsgRecipientId] = useState("");
  const [msgRecipientIds, setMsgRecipientIds] = useState<string[]>([]);
  const [msgSubmissionId, setMsgSubmissionId] = useState("");
  const [msgPatientRef, setMsgPatientRef] = useState("");
  const [msgDomainId, setMsgDomainId] = useState<RelayTaskCategory>(defaultDomainForSection(section));

  const domains = relayDomainsForRole(isDoctor);
  const isMobile = useIsMobile();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [isMobile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && !isPending) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    if (!isMobile) document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (!isMobile) document.removeEventListener("mousedown", onClick);
    };
  }, [isPending, isMobile, onClose]);

  const panelWidth = 400;
  const left = Math.min(
    Math.max(12, anchor.right - panelWidth),
    typeof window !== "undefined" ? window.innerWidth - panelWidth - 12 : anchor.right - panelWidth
  );
  const top = anchor.bottom + 8;

  const toggleMsgMember = (id: string) => {
    setMsgRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleTaskMember = (id: string) => {
    setAssignMode("people");
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submitTask = () => {
    const titleTrim = title.trim();
    if (!titleTrim) {
      setError("Bitte geben Sie einen Titel an.");
      return;
    }
    setError(null);
    const domain = domainById(domainId);
    const descParts = [`Bereich: ${domain.label}`];
    if (description.trim()) descParts.push(description.trim());
    if (patientRef.trim()) descParts.push(`Patient: ${patientRef.trim()}`);

    const fd = new FormData();
    fd.set("task_form", "page");
    fd.set("title", titleTrim);
    fd.set("content", titleTrim);
    fd.set("description", descParts.join("\n\n"));
    fd.set("task_context", domain.taskContextKey);
    if (dueDate.trim()) fd.set("due_date", dueDate.trim());
    fd.set("priority_level", priority);
    fd.set("recurrence_type", recurrence);
    if (submissionId.trim()) fd.set("submission_id", submissionId.trim());
    if (domain.doctorOnly) fd.set("assign_to_doctor", "true");
    else if (assignMode === "team") fd.set("assign_all_team", "true");
    else if (assignMode === "me") fd.set("assign_to_me", "true");
    else {
      for (const id of selectedIds) fd.append("specific_recipient_ids[]", id);
    }

    startTransition(async () => {
      const result = await createMyTask(fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      onClose();
      router.refresh();
    });
  };

  const submitMessage = () => {
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

    const domain = domainById(msgDomainId);
    const bodyParts: string[] = [];
    if (msgPatientRef.trim()) bodyParts.push(`Patient: ${msgPatientRef.trim()}`);
    bodyParts.push(`Bereich: ${domain.label}`);
    bodyParts.push(messageBody.trim());
    const composedBody = bodyParts.join("\n\n");

    startTransition(async () => {
      const res = await sendRelayMessageToRecipient({
        assignAllTeam: msgRecipientMode === "team",
        recipientUserId: msgRecipientMode === "person" ? msgRecipientId : undefined,
        recipientUserIds: msgRecipientMode === "people" ? msgRecipientIds : undefined,
        body: composedBody,
        submissionId: msgSubmissionId.trim() || null,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      onClose();
      if (isRelay && res.conversationId) {
        router.replace(`/relay?section=handoffs&conversation=${res.conversationId}`, { scroll: false });
      }
      router.refresh();
    });
  };

  if (!mounted) return null;

  const panel = (
    <div
      ref={panelRef}
      id="relay-quick-create"
      role="dialog"
      aria-modal="true"
      aria-label="Schnellerfassung"
      className={cn("yd-relay-qc-popover", isMobile && "yd-relay-qc-popover--sheet")}
      style={isMobile ? undefined : { top, left, width: panelWidth }}
      onMouseDown={isMobile ? (e) => e.stopPropagation() : undefined}
    >
      <div className="yd-relay-qc-popover__head">
        <div className="yd-relay-qc-popover__modes" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "task"}
            className={cn("yd-relay-qc-popover__mode", mode === "task" && "yd-relay-qc-popover__mode--active")}
            onClick={() => setMode("task")}
            disabled={isPending}
          >
            Praxisaufgabe
          </button>
          {isRelay ? (
            <button
              type="button"
              role="tab"
              aria-selected={mode === "message"}
              className={cn(
                "yd-relay-qc-popover__mode",
                mode === "message" && "yd-relay-qc-popover__mode--active"
              )}
              onClick={() => setMode("message")}
              disabled={isPending}
            >
              Nachricht
            </button>
          ) : null}
        </div>
        <button
          type="button"
          className="yd-relay-qc-popover__close"
          onClick={onClose}
          disabled={isPending}
          aria-label="Schließen"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <fieldset
        disabled={isPending}
        aria-busy={isPending}
        className="yd-relay-qc-popover__body m-0 min-w-0 border-0 p-0 disabled:opacity-[0.58]"
      >
        {mode === "task" ? (
          <>
            <label className="yd-relay-qc-field__label" htmlFor={`${formId}-title`}>
              Titel
            </label>
            <input
              id={`${formId}-title`}
              className="yd-relay-qc-field__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Kurz erfassen …"
              autoFocus
              maxLength={200}
            />

            <label className="yd-relay-qc-field__label" htmlFor={`${formId}-desc`}>
              Kontext <span className="yd-relay-qc-field__opt">optional</span>
            </label>
            <textarea
              id={`${formId}-desc`}
              className="yd-relay-qc-field__textarea"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nächster Schritt fürs Team …"
            />

            <label className="yd-relay-qc-field__label" htmlFor={`${formId}-domain`}>
              Bereich
            </label>
            <select
              id={`${formId}-domain`}
              className="yd-relay-qc-field__input"
              value={domainId}
              onChange={(e) => setDomainId(e.target.value as RelayTaskCategory)}
            >
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>

            <div className="yd-relay-qc-popover__grid">
              <div>
                <label className="yd-relay-qc-field__label" htmlFor={`${formId}-assign`}>
                  Verantwortlich
                </label>
                <select
                  id={`${formId}-assign`}
                  className="yd-relay-qc-field__input"
                  value={assignMode}
                  onChange={(e) => setAssignMode(e.target.value as RecipientMode)}
                  disabled={domainById(domainId).doctorOnly}
                >
                  <option value="me">Mir zuweisen</option>
                  <option value="team">Gesamtes Team</option>
                  <option value="people">Bestimmte Personen</option>
                </select>
              </div>
              <div>
                <label className="yd-relay-qc-field__label" htmlFor={`${formId}-due`}>
                  Fällig <span className="yd-relay-qc-field__opt">optional</span>
                </label>
                <input
                  id={`${formId}-due`}
                  type="date"
                  className="yd-relay-qc-field__input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {assignMode === "people" && !domainById(domainId).doctorOnly ? (
              <div className="yd-relay-qc-member-pick">
                {assignableMembers
                  .filter((m) => m.user_id !== currentUserId)
                  .map((m) => (
                    <label key={m.user_id} className="yd-relay-qc-member-pick__item">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(m.user_id)}
                        onChange={() => toggleTaskMember(m.user_id)}
                      />
                      <span className="truncate">{m.email}</span>
                    </label>
                  ))}
              </div>
            ) : null}

            <div className="yd-relay-qc-popover__grid">
              <div>
                <label className="yd-relay-qc-field__label" htmlFor={`${formId}-prio`}>
                  Priorität
                </label>
                <select
                  id={`${formId}-prio`}
                  className="yd-relay-qc-field__input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as "normal" | "high")}
                >
                  <option value="normal">Normal</option>
                  <option value="high">Hoch</option>
                </select>
              </div>
              {section === "routines" ? (
                <div>
                  <label className="yd-relay-qc-field__label" htmlFor={`${formId}-rec`}>
                    Rhythmus
                  </label>
                  <select
                    id={`${formId}-rec`}
                    className="yd-relay-qc-field__input"
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as TaskRecurrenceType)}
                  >
                    {RECURRENCE_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            <label className="yd-relay-qc-field__label" htmlFor={`${formId}-patient`}>
              Patient <span className="yd-relay-qc-field__opt">optional</span>
            </label>
            <input
              id={`${formId}-patient`}
              className="yd-relay-qc-field__input"
              value={patientRef}
              onChange={(e) => setPatientRef(e.target.value)}
              placeholder="Name oder Kurzbezug"
            />

            <label className="yd-relay-qc-field__label" htmlFor={`${formId}-sub`}>
              Tracker-Fall-ID <span className="yd-relay-qc-field__opt">optional</span>
            </label>
            <input
              id={`${formId}-sub`}
              className="yd-relay-qc-field__input"
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
              placeholder="UUID des Falls"
            />
          </>
        ) : (
          <>
            <label className="yd-relay-qc-field__label" htmlFor={`${formId}-msg-to`}>
              Empfänger
            </label>
            <select
              id={`${formId}-msg-to`}
              className="yd-relay-qc-field__input"
              value={msgRecipientMode}
              onChange={(e) => setMsgRecipientMode(e.target.value as "person" | "people" | "team")}
            >
              <option value="person">Einzelne Person</option>
              <option value="people">Mehrere Personen</option>
              <option value="team">Ganzes Team</option>
            </select>

            {msgRecipientMode === "person" ? (
              <select
                className="yd-relay-qc-field__input"
                value={msgRecipientId}
                onChange={(e) => setMsgRecipientId(e.target.value)}
              >
                <option value="">Person wählen …</option>
                {assignableMembers
                  .filter((m) => m.user_id !== currentUserId)
                  .map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.email}
                    </option>
                  ))}
              </select>
            ) : null}

            {msgRecipientMode === "people" ? (
              <div className="yd-relay-qc-member-pick">
                {assignableMembers
                  .filter((m) => m.user_id !== currentUserId)
                  .map((m) => (
                    <label key={m.user_id} className="yd-relay-qc-member-pick__item">
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

            <label className="yd-relay-qc-field__label" htmlFor={`${formId}-msg`}>
              Nachricht
            </label>
            <textarea
              id={`${formId}-msg`}
              className="yd-relay-qc-field__textarea"
              rows={3}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Interne Übergabe …"
              autoFocus
            />

            <label className="yd-relay-qc-field__label" htmlFor={`${formId}-msg-patient`}>
              Patient <span className="yd-relay-qc-field__opt">optional</span>
            </label>
            <input
              id={`${formId}-msg-patient`}
              className="yd-relay-qc-field__input"
              value={msgPatientRef}
              onChange={(e) => setMsgPatientRef(e.target.value)}
              placeholder="Name oder Kurzbezug"
            />

            <label className="yd-relay-qc-field__label" htmlFor={`${formId}-msg-domain`}>
              Praxisbereich <span className="yd-relay-qc-field__opt">optional</span>
            </label>
            <select
              id={`${formId}-msg-domain`}
              className="yd-relay-qc-field__input"
              value={msgDomainId}
              onChange={(e) => setMsgDomainId(e.target.value as RelayTaskCategory)}
            >
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>

            <label className="yd-relay-qc-field__label" htmlFor={`${formId}-msg-sub`}>
              Tracker-Fall <span className="yd-relay-qc-field__opt">optional</span>
            </label>
            <input
              id={`${formId}-msg-sub`}
              className="yd-relay-qc-field__input"
              value={msgSubmissionId}
              onChange={(e) => setMsgSubmissionId(e.target.value)}
            />
          </>
        )}

        {error ? (
          <p className="yd-relay-qc-popover__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="yd-relay-qc-popover__footer">
          <button type="button" className="yd-relay-qc-popover__cancel" onClick={onClose} disabled={isPending}>
            Abbrechen
          </button>
          <button
            type="button"
            className="yd-relay-qc-popover__submit"
            disabled={isPending}
            onClick={mode === "task" ? submitTask : submitMessage}
          >
            {isPending ? "Wird gespeichert …" : mode === "task" ? "Anlegen" : "Senden"}
          </button>
        </div>
      </fieldset>
    </div>
  );

  if (isMobile) {
    return createPortal(
      <div
        className="yd-relay-qc-sheet-backdrop"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !isPending) onClose();
        }}
      >
        {panel}
      </div>,
      document.body
    );
  }

  return createPortal(panel, document.body);
}
