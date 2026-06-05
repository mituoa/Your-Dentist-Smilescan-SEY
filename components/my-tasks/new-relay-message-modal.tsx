"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { MessageSquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { sendRelayMessageToRecipient } from "@/app/(protected)/my-tasks/messages-actions";
import { fetchAssignableMembersForTaskCreate } from "@/app/(protected)/my-tasks/actions";
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
import { cn } from "@/lib/utils";

type MsgRecipientMode = "person" | "people" | "team";

const MSG_RECIPIENT_OPTIONS = [
  { id: "person" as const, label: "Einzelperson" },
  { id: "people" as const, label: "Mehrere" },
  { id: "team" as const, label: "Gesamtes Team" },
];

type NewRelayMessageModalTriggerProps = {
  className?: string;
  assignableMembers?: AssignableMember[];
  currentUserId?: string;
};

export function NewRelayMessageModalTrigger({
  className,
  assignableMembers,
  currentUserId,
}: NewRelayMessageModalTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex h-10 min-h-[2.75rem] items-center gap-2 rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-3 text-[13px] font-medium text-[#0F172A] transition-colors hover:border-[rgba(15,23,42,0.12)] hover:bg-[#F8FAFC] md:px-4 md:text-[14px]"
        }
      >
        <MessageSquarePlus className="h-4 w-4 shrink-0 text-[#2F80ED]" strokeWidth={2} />
        <span>Neue Übergabe</span>
      </button>
      <NewRelayMessageModal
        open={open}
        onClose={() => setOpen(false)}
        assignableMembers={assignableMembers}
        currentUserId={currentUserId}
      />
    </>
  );
}

type NewRelayMessageModalProps = {
  open: boolean;
  onClose: () => void;
  assignableMembers?: AssignableMember[];
  currentUserId?: string;
  submissionId?: string | null;
};

function RelayMessageCreateForm({
  onClose,
  assignableMembers: membersProp,
  currentUserId: currentUserIdProp,
  submissionId = null,
}: Omit<NewRelayMessageModalProps, "open">) {
  const router = useRouter();
  const formId = useId();
  const errorRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<AssignableMember[]>(membersProp ?? []);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(currentUserIdProp ?? null);

  const [msgRecipientMode, setMsgRecipientMode] = useState<MsgRecipientMode>("person");
  const [msgRecipientId, setMsgRecipientId] = useState("");
  const [msgRecipientIds, setMsgRecipientIds] = useState<string[]>([]);
  const [messageBody, setMessageBody] = useState("");
  const [msgSubmissionId, setMsgSubmissionId] = useState(submissionId ?? "");

  const busy = isPending;

  useEffect(() => {
    if (membersProp?.length) {
      setMembers(membersProp);
      return;
    }
    let cancelled = false;
    void fetchAssignableMembersForTaskCreate().then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setMembers([]);
        setMembersError(res.error);
        return;
      }
      setMembersError(null);
      setMembers(res.members);
      if (res.currentUserId) setCurrentUserId(res.currentUserId);
    });
    return () => {
      cancelled = true;
    };
  }, [membersProp]);

  useEffect(() => {
    if (!error) return;
    errorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [error]);

  const close = () => {
    if (busy) return;
    onClose();
  };

  const toggleMsgMember = (id: string) => {
    setMsgRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
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
      onClose();
      setMessageBody("");
      setMsgRecipientId("");
      setMsgRecipientIds([]);
      if (res.conversationId) {
        router.replace(`/relay?tab=nachrichten&conversation=${res.conversationId}`);
      }
      router.refresh();
    });
  };

  return (
    <MedicalFormShell
      title="Interne Nachricht"
      subtitle="Übergabe oder Hinweis an Kolleginnen und Kollegen — kein Patientenkanal."
      onClose={close}
      closeDisabled={busy}
      ariaLabel="Interne Nachricht"
      footer={
        <MedicalFormFooterActions
          onCancel={close}
          cancelDisabled={busy}
          primaryLabel="Nachricht senden"
          primaryPendingLabel="Wird gesendet…"
          onPrimary={handleSubmit}
          primaryDisabled={!messageBody.trim()}
          isPending={busy}
        />
      }
    >
      <div className="yd-medical-form">
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
              placeholder="Interne Übergabe formulieren …"
            />
          </MedicalFormSection>

          <MedicalFormSection title="Bezug" hint="Optional — Fall oder Tracker-Verknüpfung.">
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
                  placeholder="UUID des Falls"
                  disabled={Boolean(submissionId)}
                />
              </div>
            </MedicalFormFieldStack>
          </MedicalFormSection>
        </fieldset>
      </div>
    </MedicalFormShell>
  );
}

export function NewRelayMessageModal({
  open,
  onClose,
  assignableMembers,
  currentUserId,
  submissionId,
}: NewRelayMessageModalProps) {
  if (!open) return null;

  return (
    <RelayMessageCreateForm
      onClose={onClose}
      assignableMembers={assignableMembers}
      currentUserId={currentUserId}
      submissionId={submissionId}
    />
  );
}
