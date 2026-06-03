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
          <div>
            <p className="relay-messages-list-title">Übergaben</p>
            <p className="relay-messages-list-sub">Intern · Praxis</p>
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
                <ul className="relay-messages-handoffs">
                  {messages.map((m) => {
                    const senderLabel = m.sender_email
                      ? m.sender_email.split("@")[0]!.replace(/[._-]/g, " ").trim() || "Team"
                      : "Team";
                    const readSummary = m.is_own
                      ? formatRelayReadReceiptSummary(
                          m.read_receipts,
                          m.is_group_thread
                        )
                      : null;
                    return (
                      <li
                        key={m.id}
                        className={cn(
                          "relay-handoff-entry",
                          m.is_own && "relay-handoff-entry--own"
                        )}
                      >
                        <span className="relay-handoff-entry__label">
                          {m.is_own ? "Ihre Übergabe" : senderLabel}
                        </span>
                        <p className="relay-handoff-entry__body">{m.body}</p>
                        <div className="relay-handoff-entry__footer">
                          {m.is_own ? (
                            <RelayMessageReadStatus message={m} />
                          ) : (
                            <span className="relay-message-status">
                              {formatTime(m.created_at)}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
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
