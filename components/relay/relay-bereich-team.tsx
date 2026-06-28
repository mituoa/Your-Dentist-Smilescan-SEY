"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import {
  loadRelayMessagesState,
  markRelayConversationRead,
  sendRelayMessage,
} from "@/app/(protected)/my-tasks/messages-actions";
import type { RelayConversationRow, RelayMessageRow } from "@/lib/queries/relay-messages";
import { formatRelayMessageTimestamp } from "@/lib/relay/read-receipt-display";
import { cn } from "@/lib/utils";

import { RelayV2EmptyState } from "./relay-side-nav";

type Props = {
  conversations: RelayConversationRow[];
};

function conversationLabel(c: RelayConversationRow): string {
  if (c.kind === "group" && c.title) return c.title;
  if (c.other_party_email) {
    const local = c.other_party_email.split("@")[0] ?? c.other_party_email;
    const part = local.split(/[._-]/)[0];
    return part ? part.charAt(0).toUpperCase() + part.slice(1) : "Team";
  }
  return "Team";
}

export function RelayBereichTeam({ conversations }: Props) {
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
      [...conversations].sort((a, b) =>
        (b.last_message_at ?? b.updated_at).localeCompare(a.last_message_at ?? a.updated_at)
      ),
    [conversations]
  );

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  const openConversation = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("bereich", "team");
    params.set("conversation", id);
    router.replace(`/relay?${params.toString()}`, { scroll: false });
  };

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

  if (conversations.length === 0) {
    return <RelayV2EmptyState title="Keine Teamnachrichten" hint="Interne Nachrichten Ihres Teams erscheinen hier." />;
  }

  return (
    <div className="relay-mod-team">
      <aside
        className={cn("relay-mod-team__list", activeConversation && "relay-mod-team__list--hidden-mobile")}
        aria-label="Konversationen"
      >
        <ul className="relay-mod-team__threads">
          {sorted.map((c) => {
            const active = c.id === activeId;
            const unread = c.unread_count > 0;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className={cn(
                    "relay-mod-team__thread",
                    active && "relay-mod-team__thread--active",
                    unread && "relay-mod-team__thread--unread"
                  )}
                  onClick={() => openConversation(c.id)}
                >
                  <span className="relay-mod-team__thread-name">{conversationLabel(c)}</span>
                  <span className="relay-mod-team__thread-preview">
                    {c.last_message_preview?.trim() || "Interne Nachricht"}
                  </span>
                  <time className="relay-mod-team__thread-time">
                    {c.last_message_at
                      ? formatRelayMessageTimestamp(c.last_message_at)
                      : ""}
                  </time>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div
        className={cn(
          "relay-mod-team__chat",
          !activeConversation && "relay-mod-team__chat--empty"
        )}
      >
        {!activeConversation ? (
          <p className="relay-mod-team__placeholder">Konversation auswählen</p>
        ) : (
          <>
            <header className="relay-mod-team__chat-head">
              <button
                type="button"
                className="relay-mod-team__back"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("conversation");
                  router.replace(`/relay?${params.toString()}`, { scroll: false });
                }}
              >
                ←
              </button>
              <h2 className="relay-mod-team__chat-title">
                {threadTitle || conversationLabel(activeConversation)}
              </h2>
            </header>

            <div className="relay-mod-team__messages" aria-live="polite">
              {loadingThread ? (
                <p className="relay-mod-team__status">Wird geladen …</p>
              ) : loadError ? (
                <p className="relay-mod-team__status relay-mod-team__status--error">{loadError}</p>
              ) : (
                <ul className="relay-mod-team__log">
                  {messages.map((m) => (
                    <li
                      key={m.id}
                      className={cn(
                        "relay-mod-team__bubble",
                        m.is_own && "relay-mod-team__bubble--own"
                      )}
                    >
                      <span className="relay-mod-team__bubble-meta">
                        {m.is_own ? "Sie" : m.sender_email?.split("@")[0] ?? "Team"} ·{" "}
                        {formatRelayMessageTimestamp(m.created_at)}
                      </span>
                      <p>{m.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <footer className="relay-mod-team__compose">
              {sendError ? (
                <p className="relay-mod-team__status relay-mod-team__status--error">{sendError}</p>
              ) : null}
              <input
                type="text"
                className="relay-mod-team__input"
                placeholder="Nachricht schreiben …"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isPending || loadingThread}
              />
              <button
                type="button"
                className="relay-mod-team__send"
                onClick={handleSend}
                disabled={isPending || loadingThread || !composer.trim()}
              >
                Senden
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
