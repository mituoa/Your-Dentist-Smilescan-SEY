"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { MessageSquarePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { sendRelayMessageToRecipient } from "@/app/(protected)/my-tasks/messages-actions";
import type { AssignableMember } from "@/lib/queries/team-members";

type AssignMode = "person" | "all";

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
  /** Inline panel at trigger site — no fullscreen overlay. */
  variant?: "modal" | "inline";
};

function RelayMessageCreateForm({
  titleId,
  onClose,
  assignableMembers: membersProp,
  currentUserId,
  inline,
}: {
  titleId: string;
  onClose: () => void;
  assignableMembers?: AssignableMember[];
  currentUserId?: string;
  inline?: boolean;
}) {
  const router = useRouter();
  const [assignMode, setAssignMode] = useState<AssignMode>("person");
  const [recipientId, setRecipientId] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [members, setMembers] = useState<AssignableMember[]>(membersProp ?? []);

  useEffect(() => {
    setError(null);
    if (membersProp?.length) {
      setMembers(membersProp);
      return;
    }
    void import("@/app/(protected)/my-tasks/actions").then((m) => {
      void m.fetchAssignableMembersForTaskCreate().then((res) => {
        if (res.ok && res.members) setMembers(res.members);
      });
    });
  }, [membersProp]);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await sendRelayMessageToRecipient({
        recipientUserId: assignMode === "person" ? recipientId : undefined,
        assignAllTeam: assignMode === "all",
        body,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      onClose();
      setBody("");
      setRecipientId("");
      if (res.conversationId) {
        router.replace(`/relay?section=handoffs&conversation=${res.conversationId}`);
      }
      router.refresh();
    });
  };

  const shellClass = inline
    ? "yd-relay-message-create-panel"
    : "yd-clinical-control max-h-[min(92dvh,640px)] w-full overflow-y-auto rounded-t-[20px] border border-[rgba(15,23,42,0.08)] bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl";

  return (
    <div
      role="dialog"
      aria-modal={inline ? undefined : true}
      aria-labelledby={titleId}
      className={shellClass}
      onClick={inline ? undefined : (e) => e.stopPropagation()}
    >
      <div className={inline ? "yd-relay-create-panel__head" : "mb-4 flex items-start justify-between gap-3"}>
        <div>
          <h2
            id={titleId}
            className={inline ? "yd-relay-create-panel__title" : "text-[17px] font-semibold text-[#0F172A]"}
          >
            Neue Übergabe
          </h2>
          {inline ? (
            <p className="yd-relay-create-panel__hint">Interne Nachricht — Empfänger und Text in einem Schritt.</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className={
            inline
              ? "yd-relay-create-panel__close"
              : "flex h-10 w-10 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8FAFC]"
          }
          aria-label="Schließen"
        >
          <X className={inline ? "h-4 w-4" : "h-5 w-5"} strokeWidth={2} />
        </button>
      </div>

      <fieldset
        disabled={isPending}
        aria-busy={isPending}
        className="m-0 min-w-0 border-0 p-0 disabled:pointer-events-none disabled:opacity-[0.58]"
      >
        <label
          htmlFor={`${titleId}-recipient`}
          className={inline ? "yd-relay-create-panel__label" : "mb-1.5 block text-[12px] font-medium text-[#64748B]"}
        >
          Empfänger
        </label>
        <select
          id={`${titleId}-recipient`}
          value={assignMode === "all" ? "__all__" : recipientId}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "__all__") {
              setAssignMode("all");
              setRecipientId("");
            } else {
              setAssignMode("person");
              setRecipientId(v);
            }
          }}
          disabled={isPending}
          className={
            inline
              ? "yd-relay-create-panel__input mb-3"
              : "mb-4 w-full rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2.5 text-[14px] text-[#0F172A]"
          }
        >
          <option value="">Empfänger wählen …</option>
          <option value="__all__">Gesamtes Team</option>
          {members
            .filter((m) => m.user_id !== currentUserId)
            .map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.email || "Teammitglied"}
              </option>
            ))}
        </select>

        <label
          htmlFor={`${titleId}-body`}
          className={inline ? "yd-relay-create-panel__label" : "mb-1.5 block text-[12px] font-medium text-[#64748B]"}
        >
          Nachricht
        </label>
        <textarea
          id={`${titleId}-body`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isPending}
          rows={inline ? 3 : 4}
          placeholder="Interne Übergabe formulieren …"
          className={
            inline
              ? "yd-relay-create-panel__textarea mb-3"
              : "mb-4 w-full resize-none rounded-lg border border-[rgba(15,23,42,0.08)] px-3 py-2.5 text-[15px] text-[#0F172A] placeholder:text-[#94A3B8]"
          }
        />

        {error ? (
          <p className={inline ? "yd-relay-create-panel__error" : "mb-3 text-[13px] text-[#991B1B]"} role="alert">
            {error}
          </p>
        ) : null}

        <div
          className={
            inline
              ? "yd-relay-create-panel__footer yd-relay-create-panel__footer--end"
              : "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
          }
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={
              inline
                ? "yd-relay-create-panel__cancel"
                : "min-h-[2.75rem] rounded-xl border border-[rgba(15,23,42,0.08)] px-4 text-[14px] font-medium text-[#475569]"
            }
          >
            Abbrechen
          </button>
          <button
            type="button"
            disabled={isPending || !body.trim() || (assignMode === "person" && !recipientId)}
            onClick={submit}
            className={
              inline
                ? "yd-relay-create-panel__submit"
                : "min-h-[2.75rem] rounded-xl bg-[#2563EB] px-4 text-[14px] font-semibold text-white disabled:opacity-50"
            }
          >
            {isPending ? "Wird gesendet …" : "Senden"}
          </button>
        </div>
      </fieldset>
    </div>
  );
}

export function NewRelayMessageModal({
  open,
  onClose,
  assignableMembers: membersProp,
  currentUserId,
  variant = "modal",
}: NewRelayMessageModalProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  const form = (
    <RelayMessageCreateForm
      titleId={titleId}
      onClose={onClose}
      assignableMembers={membersProp}
      currentUserId={currentUserId}
      inline={variant === "inline"}
    />
  );

  if (variant === "inline") return form;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-[rgba(15,23,42,0.35)] p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      {form}
    </div>,
    document.body
  );
}
