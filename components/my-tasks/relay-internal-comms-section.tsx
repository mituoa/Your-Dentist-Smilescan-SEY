"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import {
  loadRelayMessagesState,
  markRelayConversationRead,
  sendRelayMessage,
} from "@/app/(protected)/my-tasks/messages-actions";
import { NewRelayMessageModalTrigger } from "@/components/my-tasks/new-relay-message-modal";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { RelayConversationRow, RelayMessageRow } from "@/lib/queries/relay-messages";
import { formatRelayMessageTimestamp } from "@/lib/relay/read-receipt-display";
import { cn } from "@/lib/utils";

type RelayInternalCommsSectionProps = {
  basePath: "/my-tasks" | "/relay";
  conversations: RelayConversationRow[];
  assignableMembers: AssignableMember[];
  currentUserId: string;
};

function conversationTitle(c: RelayConversationRow): string {
  if (c.kind === "group" && c.title) return c.title;
  if (c.other_party_email) {
    const local = c.other_party_email.split("@")[0] ?? c.other_party_email;
    const part = local.split(/[._-]/)[0];
    if (part) return part.charAt(0).toUpperCase() + part.slice(1);
  }
  if (c.member_emails.length === 2) return c.member_emails.join(" · ");
  return c.kind === "group" ? "Team-Übergabe" : "Interne Nachricht";
}

function conversationPreview(c: RelayConversationRow): string {
  if (c.last_message_preview?.trim()) return c.last_message_preview.trim();
  if (c.task_id) return "Übergabe zu einer Aufgabe";
  if (c.submission_id) return "Übergabe zu einem Patientenfall";
  return "Interne Praxis-Kommunikation";
}

export function RelayInternalCommsSection({
  basePath,
  conversations,
  assignableMembers,
  currentUserId,
}: RelayInternalCommsSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("conversation");
  const [messages, setMessages] = useState<RelayMessageRow[]>([]);
  const [threadTitle, setThreadTitle] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [composer, setComposer] = useState("");
  const [isPending, startTransition] = useTransition();

  const sorted = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        const ta = a.last_message_at ?? a.updated_at;
        const tb = b.last_message_at ?? b.updated_at;
        return tb.localeCompare(ta);
      }),
    [conversations]
  );

  const visible = sorted.slice(0, 5);

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
    const params = new URLSearchParams(searchParams.toString());
    params.set("conversation", id);
    router.replace(`${basePath}?${params.toString()}`, { scroll: false });
  };

  const closeConversation = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("conversation");
    const qs = params.toString();
    router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
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
    <section className="yd-relay-decisions__section" aria-label="Interne Kommunikation">
      <div className="yd-relay-decisions__section-head">
        <h2 className="yd-relay-decisions__section-title yd-relay-decisions__section-title--inline">
          Interne Kommunikation
        </h2>
        <NewRelayMessageModalTrigger
          assignableMembers={assignableMembers}
          currentUserId={currentUserId}
          className="yd-relay-decisions__comms-new"
        />
      </div>
      <p className="yd-relay-decisions__section-note">
        Praxisrelevante Übergaben — keine Chats, nur was das Team wissen muss.
      </p>

      {visible.length === 0 ? (
        <p className="yd-relay-decisions__section-empty">
          Keine internen Nachrichten. Übergaben erscheinen hier, sobald das Team kommuniziert.
        </p>
      ) : (
        <ul className="yd-relay-decisions__list">
          {visible.map((c) => {
            const active = c.id === activeId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className={cn(
                    "yd-relay-decisions__row yd-relay-decisions__row--button",
                    active && "yd-relay-decisions__row--active",
                    c.unread_count > 0 && "yd-relay-decisions__row--unread"
                  )}
                  onClick={() => openConversation(c.id)}
                  aria-expanded={active}
                >
                  <span className="yd-relay-decisions__row-main">
                    <span className="yd-relay-decisions__row-top">
                      <span className="yd-relay-decisions__row-primary">{conversationTitle(c)}</span>
                      {c.last_message_at ? (
                        <span className="yd-relay-decisions__row-wait">
                          {formatRelayMessageTimestamp(c.last_message_at)}
                        </span>
                      ) : null}
                    </span>
                    <span className="yd-relay-decisions__row-context">{conversationPreview(c)}</span>
                  </span>
                  {c.unread_count > 0 ? (
                    <span className="yd-relay-decisions__row-badge" aria-label="Ungelesen">
                      {c.unread_count}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {activeId ? (
        <div className="yd-relay-decisions__thread" aria-label="Nachrichtenverlauf">
          <div className="yd-relay-decisions__thread-head">
            <p className="yd-relay-decisions__thread-title">{threadTitle || "Übergabe"}</p>
            <button
              type="button"
              className="yd-relay-decisions__thread-close"
              onClick={closeConversation}
            >
              Schließen
            </button>
          </div>
          {loadingThread ? (
            <p className="yd-relay-decisions__thread-status">Wird geladen …</p>
          ) : loadError ? (
            <p className="yd-relay-decisions__thread-status yd-relay-decisions__thread-status--error">
              {loadError}
            </p>
          ) : (
            <ul className="yd-relay-decisions__thread-messages">
              {messages.slice(-6).map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    "yd-relay-decisions__thread-message",
                    m.is_own && "yd-relay-decisions__thread-message--own"
                  )}
                >
                  <span className="yd-relay-decisions__thread-message-meta">
                    {m.is_own ? "Sie" : m.sender_email?.split("@")[0] ?? "Team"} ·{" "}
                    {formatRelayMessageTimestamp(m.created_at)}
                  </span>
                  <p className="yd-relay-decisions__thread-message-body">{m.body}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="yd-relay-decisions__thread-compose">
            <textarea
              className="yd-relay-decisions__thread-input"
              rows={2}
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              placeholder="Kurze Übergabe an das Team …"
              disabled={isPending || loadingThread}
            />
            {sendError ? (
              <p className="yd-relay-decisions__thread-status yd-relay-decisions__thread-status--error">
                {sendError}
              </p>
            ) : null}
            <button
              type="button"
              className="yd-relay-decisions__thread-send"
              onClick={handleSend}
              disabled={isPending || loadingThread || !composer.trim()}
            >
              {isPending ? "Wird gesendet …" : "Senden"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
