"use client";

import Link from "next/link";
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

type RelayHandoverThreadProps = {
  basePath: "/my-tasks" | "/relay";
  conversations: RelayConversationRow[];
  assignableMembers: AssignableMember[];
  currentUserId: string;
};

export function RelayHandoverThread({
  basePath,
  conversations,
  assignableMembers,
  currentUserId,
}: RelayHandoverThreadProps) {
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

  if (!activeId || !activeConversation) return null;

  return (
    <div className="yd-relay-decisions__thread" aria-label="Übergabe">
      <div className="yd-relay-decisions__thread-head">
        <p className="yd-relay-decisions__thread-title">{threadTitle || "Übergabe"}</p>
        <button type="button" className="yd-relay-decisions__thread-close" onClick={closeConversation}>
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
  );
}

export function RelayHandoverCreateTrigger({
  assignableMembers,
  currentUserId,
}: {
  assignableMembers: AssignableMember[];
  currentUserId: string;
}) {
  return (
    <NewRelayMessageModalTrigger
      assignableMembers={assignableMembers}
      currentUserId={currentUserId}
      className="yd-relay-decisions__section-cta"
    />
  );
}
