"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { MessageSquarePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { sendRelayMessageToRecipient } from "@/app/(protected)/my-tasks/messages-actions";
import type { AssignableMember } from "@/lib/queries/team-members";
import { cn } from "@/lib/utils";

type AssignMode = "person" | "all";

type NewRelayMessageModalTriggerProps = {
  className?: string;
};

export function NewRelayMessageModalTrigger({ className }: NewRelayMessageModalTriggerProps) {
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
        <span>Neue Nachricht</span>
      </button>
      <NewRelayMessageModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

type NewRelayMessageModalProps = {
  open: boolean;
  onClose: () => void;
  assignableMembers?: AssignableMember[];
  currentUserId?: string;
};

export function NewRelayMessageModal({
  open,
  onClose,
  assignableMembers: membersProp,
  currentUserId,
}: NewRelayMessageModalProps) {
  const router = useRouter();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [assignMode, setAssignMode] = useState<AssignMode>("person");
  const [recipientId, setRecipientId] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [members, setMembers] = useState<AssignableMember[]>(membersProp ?? []);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
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
  }, [open, membersProp]);

  if (!open || !mounted) return null;

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
        router.replace(`/relay?panel=messages&conversation=${res.conversationId}`);
      }
      router.refresh();
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-[rgba(15,23,42,0.35)] p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="yd-clinical-control max-h-[min(92dvh,640px)] w-full overflow-y-auto rounded-t-[20px] border border-[rgba(15,23,42,0.08)] bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-[17px] font-semibold text-[#0F172A]">
              Neue Nachricht
            </h2>
            <p className="mt-1 text-[13px] text-[#64748B]">
              Interne Übergabe — nur für Ihr Praxisteam.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#64748B] hover:bg-[#F8FAFC]"
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mb-1.5 block text-[12px] font-medium text-[#64748B]">Empfänger</label>
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={cn(
              "rounded-lg border px-3 py-2 text-[13px] font-medium",
              assignMode === "person"
                ? "border-[rgba(43,111,232,0.3)] bg-[#EEF6FF] text-[#1D4ED8]"
                : "border-[rgba(15,23,42,0.08)] text-[#475569]"
            )}
            onClick={() => setAssignMode("person")}
          >
            Person
          </button>
          <button
            type="button"
            className={cn(
              "rounded-lg border px-3 py-2 text-[13px] font-medium",
              assignMode === "all"
                ? "border-[rgba(43,111,232,0.3)] bg-[#EEF6FF] text-[#1D4ED8]"
                : "border-[rgba(15,23,42,0.08)] text-[#475569]"
            )}
            onClick={() => setAssignMode("all")}
          >
            Gesamtes Team
          </button>
        </div>

        {assignMode === "person" ? (
          <select
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            disabled={isPending}
            className="mb-4 w-full rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2.5 text-[14px] text-[#0F172A]"
          >
            <option value="">Person wählen …</option>
            {members
              .filter((m) => m.user_id !== currentUserId)
              .map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {m.email || "Teammitglied"}
                </option>
              ))}
          </select>
        ) : null}

        <label className="mb-1.5 block text-[12px] font-medium text-[#64748B]">Nachricht</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isPending}
          rows={4}
          placeholder="Interne Übergabe formulieren …"
          className="mb-4 w-full resize-none rounded-lg border border-[rgba(15,23,42,0.08)] px-3 py-2.5 text-[15px] text-[#0F172A] placeholder:text-[#94A3B8]"
        />

        {error ? <p className="mb-3 text-[13px] text-[#991B1B]">{error}</p> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="min-h-[2.75rem] rounded-xl border border-[rgba(15,23,42,0.08)] px-4 text-[14px] font-medium text-[#475569]"
          >
            Abbrechen
          </button>
          <button
            type="button"
            disabled={
              isPending ||
              !body.trim() ||
              (assignMode === "person" && !recipientId)
            }
            onClick={submit}
            className="min-h-[2.75rem] rounded-xl bg-[#2563EB] px-4 text-[14px] font-semibold text-white disabled:opacity-50"
          >
            {isPending ? "Wird gesendet …" : "Nachricht senden"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
