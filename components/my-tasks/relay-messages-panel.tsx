"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { MessageSquarePlus, Users } from "lucide-react";

import {
  createDirectConversation,
  loadRelayMessagesState,
  markRelayConversationRead,
  sendRelayMessage,
} from "@/app/(protected)/my-tasks/messages-actions";
import { RelayGroupCreateModal } from "@/components/my-tasks/relay-group-create-modal";
import { NewRelayMessageModal } from "@/components/my-tasks/new-relay-message-modal";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { RelayConversationRow, RelayMessageRow } from "@/lib/queries/relay-messages";
import {
  formatRelayReadReceiptDetail,
  formatRelayReadReceiptSummary,
} from "@/lib/relay/read-receipt-display";
import { cn } from "@/lib/utils";

type RelayMessagesPanelProps = {
  conversations: RelayConversationRow[];
  assignableMembers: AssignableMember[];
  currentUserId: string;
};

function formatTime(iso: string | null) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
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
  const [groupOpen, setGroupOpen] = useState(false);
  const [directOpen, setDirectOpen] = useState(false);
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
    router.replace(`/relay?panel=messages&conversation=${id}`, { scroll: false });
  };

  const handleDirectStart = (recipientId: string) => {
    startTransition(async () => {
      const res = await createDirectConversation(recipientId);
      if (res.error) {
        setSendError(res.error);
        return;
      }
      if (res.conversationId) {
        setDirectOpen(false);
        router.replace(`/relay?panel=messages&conversation=${res.conversationId}`);
        router.refresh();
      }
    });
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
    <div className="relay-messages">
      <aside className="relay-messages-list" aria-label="Nachrichten">
        <div className="relay-messages-list-head">
          <p className="relay-messages-list-title">Interne Nachrichten</p>
          <div className="relay-messages-list-actions">
            <button
              type="button"
              className="relay-messages-icon-btn relay-messages-icon-btn--primary"
              title="Neue Nachricht"
              onClick={() => setNewMessageOpen(true)}
            >
              <MessageSquarePlus className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className="relay-messages-icon-btn"
              title="An Person"
              onClick={() => setDirectOpen((o) => !o)}
            >
              <span className="text-[11px] font-semibold">1:1</span>
            </button>
            <button
              type="button"
              className="relay-messages-icon-btn"
              title="Gruppe anlegen"
              onClick={() => setGroupOpen(true)}
            >
              <Users className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {directOpen ? (
          <div className="relay-messages-direct-picker">
            <p className="text-[12px] font-medium text-[#64748B]">An Teammitglied</p>
            <ul className="mt-2 max-h-[160px] space-y-0.5 overflow-y-auto">
              {assignableMembers
                .filter((m) => m.user_id !== currentUserId)
                .map((m) => (
                  <li key={m.user_id}>
                    <button
                      type="button"
                      disabled={isPending}
                      className="w-full truncate rounded-md px-2 py-2 text-left text-[13px] text-[#334155] hover:bg-[rgba(43,111,232,0.06)]"
                      onClick={() => handleDirectStart(m.user_id)}
                    >
                      {m.email || "Teammitglied"}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}

        {conversations.length === 0 ? (
          <div className="relay-messages-empty">
            <p className="text-[14px] font-medium text-[#0F172A]">Noch keine Nachrichten</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">
              Übergaben und Hinweise fürs Team — intern in Relay, ohne externe Kanäle.
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
                    className={cn("relay-messages-thread", active && "relay-messages-thread--active")}
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
                    {c.last_message_at ? (
                      <span className="relay-messages-thread-time">{formatTime(c.last_message_at)}</span>
                    ) : null}
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
            <p className="text-[15px] font-medium text-[#0F172A]">Nachricht wählen</p>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[#64748B]">
              Wählen Sie links einen Verlauf oder starten Sie eine neue interne Nachricht.
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
                <p className="px-4 py-8 text-center text-[13px] text-[#64748B]">Wird geladen …</p>
              ) : loadError ? (
                <p className="mx-4 my-6 rounded-lg border border-[rgba(220,38,38,0.12)] bg-[rgba(254,242,242,0.5)] px-3 py-2 text-[13px] text-[#991B1B]">
                  {loadError}
                </p>
              ) : messages.length === 0 ? (
                <p className="px-4 py-10 text-center text-[13px] text-[#64748B]">
                  Noch keine Nachrichten in dieser Unterhaltung.
                </p>
              ) : (
                <ul className="relay-messages-bubbles">
                  {messages.map((m) => (
                    <li
                      key={m.id}
                      className={cn(
                        "relay-message",
                        m.is_own && "relay-message--own"
                      )}
                    >
                      {!m.is_own && m.sender_email ? (
                        <span className="relay-message-sender">{m.sender_email}</span>
                      ) : null}
                      <div className="relay-message-body">{m.body}</div>
                      <div className="relay-message-meta">
                        <time dateTime={m.created_at}>{formatTime(m.created_at)}</time>
                        {m.is_own ? (
                          <RelayMessageReadStatus message={m} />
                        ) : null}
                      </div>
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
                  placeholder="Interne Nachricht …"
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

      <RelayGroupCreateModal
        open={groupOpen}
        onClose={() => setGroupOpen(false)}
        members={assignableMembers}
        currentUserId={currentUserId}
      />
      <NewRelayMessageModal
        open={newMessageOpen}
        onClose={() => setNewMessageOpen(false)}
        assignableMembers={assignableMembers}
        currentUserId={currentUserId}
      />
    </div>
  );
}

function RelayMessageReadStatus({ message }: { message: RelayMessageRow }) {
  const summary = formatRelayReadReceiptSummary(
    message.read_receipts,
    message.is_group_thread
  );
  if (message.read_receipts.length === 0) {
    return (
      <span className="relay-message-status" aria-label="Zustellstatus">
        Zugestellt
      </span>
    );
  }
  return (
    <details className="relay-message-read-details">
      <summary className="relay-message-status cursor-pointer list-none">
        {summary}
      </summary>
      <ul className="relay-message-read-list">
        {message.read_receipts.map((r) => (
          <li key={r.user_id}>{formatRelayReadReceiptDetail(r)}</li>
        ))}
      </ul>
    </details>
  );
}
