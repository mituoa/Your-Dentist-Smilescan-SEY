"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

import { createGroupConversation } from "@/app/(protected)/my-tasks/messages-actions";
import type { AssignableMember } from "@/lib/queries/team-members";
import { cn } from "@/lib/utils";

type RelayGroupCreateModalProps = {
  open: boolean;
  onClose: () => void;
  members: AssignableMember[];
  currentUserId: string;
  onCreated?: (conversationId: string) => void;
};

function fieldCls() {
  return "w-full rounded-lg border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2.5 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[rgba(15,23,42,0.14)] focus:outline-none focus:ring-2 focus:ring-[rgba(43,111,232,0.12)] disabled:opacity-50";
}

export function RelayGroupCreateModal({
  open,
  onClose,
  members,
  currentUserId,
  onCreated,
}: RelayGroupCreateModalProps) {
  const router = useRouter();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    setError(null);
    setSelected([]);
  }, [open]);

  if (!mounted || !open) return null;

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    const fd = new FormData(e.currentTarget);
    for (const id of selected) fd.append("member_ids[]", id);
    startTransition(async () => {
      const res = await createGroupConversation(fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.conversationId) {
        onCreated?.(res.conversationId);
        router.replace(`/relay?panel=messages&conversation=${res.conversationId}`);
      }
      onClose();
      router.refresh();
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[85] flex items-end justify-center bg-[rgba(15,23,42,0.16)] p-0 sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="yd-clinical-control flex max-h-[min(90dvh,720px)] w-full max-w-md flex-col rounded-t-2xl border border-[rgba(43,111,232,0.1)] bg-[#FAFBFC] shadow-[0_12px_48px_-20px_rgba(43,111,232,0.2)] sm:rounded-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[rgba(15,23,42,0.06)] px-5 py-4">
          <div>
            <h2 id={titleId} className="text-[17px] font-semibold text-[#0F172A]">
              Gruppe anlegen
            </h2>
            <p className="mt-1 text-[13px] text-[#64748B]">
              z. B. Laborrückfragen, Implantatfälle, Morgenbesprechung
            </p>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={() => !isPending && onClose()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] hover:bg-[rgba(15,23,42,0.05)]"
            aria-label="Schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <fieldset disabled={isPending} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <div>
              <label htmlFor="rg-title" className="mb-1.5 block text-[12px] font-medium text-[#64748B]">
                Gruppenname
              </label>
              <input
                id="rg-title"
                name="title"
                required
                maxLength={80}
                className={fieldCls()}
                placeholder="Interne Besprechung …"
              />
            </div>
            <div>
              <span className="mb-2 block text-[12px] font-medium text-[#64748B]">
                Teammitglieder
              </span>
              <ul className="max-h-[220px] space-y-1 overflow-y-auto rounded-lg border border-[rgba(15,23,42,0.06)] bg-white p-2">
                {members
                  .filter((m) => m.user_id !== currentUserId)
                  .map((m) => (
                    <li key={m.user_id}>
                      <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-[13px] text-[#334155] hover:bg-[rgba(43,111,232,0.04)]">
                        <input
                          type="checkbox"
                          checked={selected.includes(m.user_id)}
                          onChange={() => toggle(m.user_id)}
                          className="h-4 w-4"
                        />
                        <span className="truncate">{m.email || m.user_id.slice(0, 8)}</span>
                      </label>
                    </li>
                  ))}
              </ul>
            </div>
            {error ? (
              <p className="rounded-lg border border-[rgba(220,38,38,0.15)] bg-[rgba(254,242,242,0.6)] px-3 py-2 text-[13px] text-[#991B1B]">
                {error}
              </p>
            ) : null}
          </fieldset>
          <div className="flex gap-2 border-t border-[rgba(15,23,42,0.06)] px-5 py-4">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="flex-1 rounded-lg border border-[rgba(15,23,42,0.08)] px-4 py-2.5 text-[14px] font-medium text-[#475569]"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "flex-1 rounded-lg bg-[#2B6FE8] px-4 py-2.5 text-[14px] font-medium text-white",
                isPending && "opacity-70"
              )}
            >
              {isPending ? "Wird angelegt …" : "Gruppe erstellen"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
