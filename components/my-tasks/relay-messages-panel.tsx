"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { MessageSquarePlus } from "lucide-react";

import {
  loadRelayMessagesState,
  markRelayConversationRead,
  sendRelayMessage,
} from "@/app/(protected)/my-tasks/messages-actions";
import { NewRelayMessageModal } from "@/components/my-tasks/new-relay-message-modal";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { RelayConversationRow, RelayMessageRow } from "@/lib/queries/relay-messages";
import { YdSkeletonThreadList } from "@/components/design-system/yd-skeleton";
import { RelayReadStatusCompact } from "@/components/my-tasks/relay-read-status-compact";
import { formatRelayMessageTimestamp } from "@/lib/relay/read-receipt-display";
import { cn } from "@/lib/utils";

type RelayMessagesPanelProps = {
  conversations: RelayConversationRow[];
  assignableMembers: AssignableMember[];
  currentUserId: string;
};

function senderDisplayName(email: string | null): string {
  if (!email) return "Team";
  const local = email.split("@")[0] ?? email;
  const part = local.split(/[._-]/)[0];
  if (!part) return "Team";
  return part.charAt(0).toUpperCase() + part.slice(1);
}

function conversationLabel(c: RelayConversationRow) {
  if (c.kind === "group" && c.title) return c.title;
  if (c.other_party_email) return c.other_party_email;
  if (c.member_emails.length === 2) {
    return c.member_emails.join(" · ");
  }
  return c.kind === "group" ? "Gruppe" : "Direktnachricht";
}

export function RelayMessagesPanel({
  conversations,
  assignableMembers,
  currentUserId,
}: RelayMessagesPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("conversation");
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [messages, setMessages] = useState<RelayMessageRow[]>([]);
  const [threadTitle, setThreadTitle] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [composer, setComposer] = useState("");

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  const loadThread = useCallback(async (conversationId: string) => {
    setLoadingThread(true);
    setLoadError(null);
    const res = await loadRelayMessagesState(conversationId);
    setLoadingThread(false);
    if (!res.ok) {
      setMessages([]);
      setLoadError(res.error);
      return;
    }
    setMessages(res.messages);
    setThreadTitle(res.title);
    await markRelayConversationRead(conversationId);
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      setThreadTitle("");
      return;
    }
    void loadThread(activeId);
  }, [activeId, loadThread]);

  const openConversation = (id: string) => {
    router.replace(`/relay?section=handoffs&conversation=${id}`, { scroll: false });
  };

  const handleSend = () => {
    if (!activeId || !composer.trim() || isPending) return;
    setSendError(null);
    startTransition(async () => {
      const res = await sendRelayMessage(activeId, composer);
      if (res.error) {
        setSendError(res.error);
        return;
      }
      setComposer("");
      await loadThread(activeId);
      router.refresh();
    });
  };

  return (
    <div className="relay-messages yd-relay-v4-messages">
      <aside className="relay-messages-list" aria-label="Nachrichten">
        <div className="relay-messages-list-head">
          <div>
            <p className="relay-messages-list-title">Praxisübergaben</p>
            <p className="relay-messages-list-sub">Intern · mit Lesebestätigung</p>
          </div>
          <button
            type="button"
            className="relay-messages-new-btn"
            onClick={() => setNewMessageOpen(true)}
          >
            <MessageSquarePlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Neu
          </button>
        </div>

        <NewRelayMessageModal
          open={newMessageOpen}
          onClose={() => setNewMessageOpen(false)}
          assignableMembers={assignableMembers}
          currentUserId={currentUserId}
        />

        {conversations.length === 0 ? (
          <div className="relay-messages-empty">
            <p className="text-[14px] font-medium text-[#0F172A]">Noch keine Nachrichten</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">
              Kurze interne Hinweise fürs Team — keine externen Kanäle.
            </p>
          </div>
        ) : (
          <ul className="relay-messages-threads">
            {conversations.map((c) => {
              const active = c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => openConversation(c.id)}
                    className={cn(
                      "relay-messages-thread relay-messages-thread-preview-card",
                      active && "relay-messages-thread--active"
                    )}
                  >
                    <span className="relay-messages-thread-top">
                      <span className="relay-messages-thread-name">{conversationLabel(c)}</span>
                      {c.unread_count > 0 ? (
                        <span className="relay-messages-unread" aria-label="Ungelesen">
                          {c.unread_count}
                        </span>
                      ) : null}
                    </span>
                    {c.last_message_preview ? (
                      <span className="relay-messages-thread-preview">{c.last_message_preview}</span>
                    ) : (
                      <span className="relay-messages-thread-preview relay-messages-thread-preview--muted">
                        Noch keine Nachricht
                      </span>
                    )}
                    {(c.task_id || c.submission_id) && (
                      <span className="relay-messages-context">
                        {c.task_id ? (
                          <Link href={`/my-tasks/${c.task_id}`} onClick={(e) => e.stopPropagation()}>
                            Aufgabe verknüpft
                          </Link>
                        ) : null}
                        {c.submission_id ? (
                          <Link href={`/inbox/${c.submission_id}`} onClick={(e) => e.stopPropagation()}>
                            Fall verknüpft
                          </Link>
                        ) : null}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <section className="relay-messages-thread-pane" aria-label="Nachrichtenverlauf">
        {!activeConversation ? (
          <div className="relay-messages-thread-empty">
            <p className="text-[15px] font-medium text-[#0F172A]">Übergabe wählen</p>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[#64748B]">
              Links einen Verlauf öffnen oder „Neu“ für eine interne Übergabe.
            </p>
          </div>
        ) : (
          <>
            <header className="relay-messages-thread-header">
              <h3 className="text-[16px] font-semibold text-[#0F172A]">
                {threadTitle || conversationLabel(activeConversation)}
              </h3>
              {activeConversation.kind === "group" ? (
                <p className="mt-0.5 text-[12px] text-[#64748B]">
                  {activeConversation.member_emails.length} Teilnehmende
                </p>
              ) : null}
            </header>

            <div className="relay-messages-scroll">
              {loadingThread ? (
                <div className="px-2 py-4" role="status" aria-label="Nachrichten werden geladen">
                  <YdSkeletonThreadList rows={5} />
                </div>
              ) : loadError ? (
                <p className="mx-4 my-6 rounded-lg border border-[rgba(220,38,38,0.12)] bg-[rgba(254,242,242,0.5)] px-3 py-2 text-[13px] text-[#991B1B]">
                  {loadError}
                </p>
              ) : messages.length === 0 ? (
                <p className="px-4 py-10 text-center text-[13px] text-[#64748B]">
                  Noch keine Nachrichten in dieser Unterhaltung.
                </p>
              ) : (
                <ul className="relay-messages-handoffs">
                  {messages.map((m) => (
                    <li key={m.id} className="relay-handoff-entry">
                      <p className="relay-handoff-entry__author">
                        {m.is_own ? "Ihre Übergabe" : senderDisplayName(m.sender_email)}
                      </p>
                      <p className="relay-handoff-entry__body">{m.body}</p>
                      <RelayReadStatusCompact
                        receipts={m.read_receipts}
                        isGroup={m.is_group_thread}
                      />
                      <p className="relay-handoff-entry__time">
                        {formatRelayMessageTimestamp(m.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <footer className="relay-messages-composer">
              {sendError ? (
                <p className="mb-2 text-[12px] text-[#991B1B]">{sendError}</p>
              ) : null}
              <div className="relay-messages-composer-row">
                <textarea
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  disabled={isPending}
                  rows={2}
                  placeholder="Praxisübergabe formulieren …"
                  className="relay-messages-input"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={isPending || !composer.trim()}
                  onClick={handleSend}
                  className="relay-messages-send"
                >
                  {isPending ? "…" : "Senden"}
                </button>
              </div>
            </footer>
          </>
        )}
      </section>

    </div>
  );
}
