"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Search } from "lucide-react";

import {
  loadRelayMessagesState,
  markRelayConversationRead,
  sendRelayMessage,
} from "@/app/(protected)/my-tasks/messages-actions";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { RelayConversationRow, RelayMessageRow } from "@/lib/queries/relay-messages";
import { RelayReadStatusCompact } from "@/components/my-tasks/relay-read-status-compact";
import { formatRelayMessageTimestamp } from "@/lib/relay/read-receipt-display";
import { cn } from "@/lib/utils";

type MessageFilter = "all" | "unread" | "direct" | "team" | "group";

type RelayMessagesCentralViewProps = {
  conversations: RelayConversationRow[];
  assignableMembers: AssignableMember[];
  currentUserId: string;
};

const FILTERS: { id: MessageFilter; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "unread", label: "Ungelesen" },
  { id: "direct", label: "Direkt" },
  { id: "team", label: "Team" },
  { id: "group", label: "Gruppen" },
];

const TRACKER_CARD =
  "yd-tracker-v4-inbox-card yd-tracker-v8-inbox-card yd-tracker-v10-inbox-card yd-tracker-v12-inbox-card yd-tracker-v14-inbox-card yd-tracker-v15-inbox-card yd-tracker-v16-inbox-card";

const TRACKER_BODY =
  "yd-tracker-v10-inbox-card__body yd-tracker-v12-inbox-card__body yd-tracker-v15-inbox-card__body yd-tracker-v16-inbox-card__body";

function senderDisplayName(email: string | null): string {
  if (!email) return "Team";
  const local = email.split("@")[0] ?? email;
  const part = local.split(/[._-]/)[0];
  if (!part) return "Team";
  return part.charAt(0).toUpperCase() + part.slice(1);
}

function conversationLabel(c: RelayConversationRow): string {
  if (c.kind === "group" && c.title) return c.title;
  if (c.other_party_email) return senderDisplayName(c.other_party_email);
  if (c.member_emails.length === 2) {
    return c.member_emails.map((e) => senderDisplayName(e)).join(" · ");
  }
  return c.kind === "group" ? "Gruppe" : "Direktnachricht";
}

function conversationContext(c: RelayConversationRow): string {
  const preview = c.last_message_preview?.trim();
  if (!preview) return "Noch keine Nachricht";
  return preview.length > 72 ? `${preview.slice(0, 69)}…` : preview;
}

function matchesFilter(c: RelayConversationRow, filter: MessageFilter): boolean {
  if (filter === "all") return true;
  if (filter === "unread") return c.unread_count > 0;
  if (filter === "direct") return c.kind === "direct";
  if (filter === "group") return c.kind === "group";
  if (filter === "team") return c.kind === "group" || c.member_emails.length > 2;
  return true;
}

export function RelayMessagesCentralView({
  conversations,
}: RelayMessagesCentralViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("conversation");
  const filterParam = (searchParams.get("msgFilter") as MessageFilter | null) ?? "all";
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<RelayMessageRow[]>([]);
  const [threadTitle, setThreadTitle] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [composer, setComposer] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      if (!matchesFilter(c, filterParam)) return false;
      if (!q) return true;
      const label = conversationLabel(c).toLowerCase();
      const preview = (c.last_message_preview ?? "").toLowerCase();
      return label.includes(q) || preview.includes(q);
    });
  }, [conversations, filterParam, query]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  const setFilter = (filter: MessageFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "nachrichten");
    if (filter === "all") params.delete("msgFilter");
    else params.set("msgFilter", filter);
    router.replace(`/relay?${params.toString()}`, { scroll: false });
  };

  const openConversation = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "nachrichten");
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

  const unreadTotal = conversations.reduce((n, c) => n + c.unread_count, 0);

  return (
    <div className="yd-relay-practice__messages yd-tracker-v12-inbox yd-tracker-v15-inbox yd-tracker-v16-triage min-h-0 flex-1 flex flex-col">
      <div className="yd-relay-practice__messages-shell yd-dash-surface yd-clinical-control min-h-0 flex-1 flex flex-col">
        <div className="yd-relay-practice__messages-toolbar">
          <div className="yd-relay-practice__messages-search">
            <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <input
              type="search"
              className="yd-relay-practice__messages-search-input"
              placeholder="Nachrichten suchen …"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="yd-tracker-filter-scroll">
            <div
              className="yd-tracker-filter-chips"
              role="tablist"
              aria-label="Nachrichten filtern"
            >
              {FILTERS.map((f) => {
                const active = filterParam === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={cn(
                      "yd-tracker-filter-chip",
                      active && "yd-tracker-filter-chip--active"
                    )}
                    onClick={() => setFilter(f.id)}
                  >
                    <span>{f.label}</span>
                    {f.id === "unread" && unreadTotal > 0 ? (
                      <span className="yd-tracker-filter-chip__count">{unreadTotal}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="yd-relay-practice__messages-body">
          <div className="yd-relay-practice__messages-list-pane" aria-label="Konversationen">
            {filtered.length === 0 ? (
              <div className="yd-tracker-empty yd-relay-practice__panel-empty">
                <p className="yd-tracker-empty__title">
                  {query.trim()
                    ? "Keine Nachrichten zu dieser Suche"
                    : "Noch keine Nachrichten in diesem Filter"}
                </p>
                <p className="yd-tracker-empty__text">
                  Interne Nachrichten und Übergaben erscheinen hier — oder über „Erstellen“
                  senden.
                </p>
              </div>
            ) : (
              <ul className="yd-tracker-v4-inbox__list yd-tracker-v12-inbox__list yd-relay-practice__panel-list">
                {filtered.map((c) => {
                  const active = c.id === activeId;
                  const unread = c.unread_count > 0;
                  return (
                    <li key={c.id} className="yd-relay-practice__card-item">
                      <div
                        className={cn(
                          TRACKER_CARD,
                          active && "yd-tracker-v4-inbox-card--active yd-tracker-v12-inbox-card--active",
                          unread && "yd-tracker-v15-inbox-card--fresh",
                          unread && "yd-tracker-v16-inbox-card--attention-patient_waiting"
                        )}
                      >
                        <button
                          type="button"
                          className={cn(TRACKER_BODY, "yd-relay-practice__card-link")}
                          onClick={() => openConversation(c.id)}
                        >
                          <span className="yd-tracker-v15-inbox-card__urgency-rail" aria-hidden />
                          <span className="yd-tracker-v16-inbox-card__scan">
                            <span className="yd-tracker-v16-inbox-card__headline-row">
                              <span className="yd-tracker-v16-inbox-card__headline">
                                {conversationLabel(c)}
                              </span>
                              {c.last_message_at ? (
                                <span className="yd-tracker-v16-inbox-card__time">
                                  {formatRelayMessageTimestamp(c.last_message_at)}
                                </span>
                              ) : null}
                            </span>
                            <span className="yd-tracker-v16-inbox-card__patient">
                              {conversationContext(c)}
                            </span>
                            {unread ? (
                              <span className="yd-tracker-v16-inbox-card__context">
                                {c.unread_count === 1
                                  ? "1 ungelesen"
                                  : `${c.unread_count} ungelesen`}
                              </span>
                            ) : null}
                          </span>
                          <span className="yd-relay-practice__card-action">
                            {unread ? "Antworten" : "Öffnen"}
                          </span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <section className="yd-relay-practice__messages-thread-pane" aria-label="Verlauf">
            {!activeConversation ? (
              <div className="yd-tracker-empty yd-relay-practice__panel-empty yd-relay-practice__panel-empty--thread">
                <p className="yd-tracker-empty__title">Unterhaltung wählen</p>
                <p className="yd-tracker-empty__text">
                  Links eine Nachricht öffnen — oder über „Erstellen“ eine neue Nachricht senden.
                </p>
              </div>
            ) : (
              <div className="yd-relay-practice__thread-panel yd-dash-surface yd-clinical-control">
                <header className="yd-relay-practice__thread-head">
                  <div className="yd-relay-practice__thread-head-main">
                    <button
                      type="button"
                      className="yd-relay-practice__thread-back md:hidden"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("conversation");
                        router.replace(`/relay?${params.toString()}`, { scroll: false });
                      }}
                    >
                      Zurück
                    </button>
                    <h3 className="yd-dash-section yd-relay-practice__panel-title">
                      {threadTitle || conversationLabel(activeConversation)}
                    </h3>
                  </div>
                  {(activeConversation.task_id || activeConversation.submission_id) && (
                    <span className="yd-relay-practice__thread-links">
                      {activeConversation.task_id ? (
                        <Link href={`/my-tasks/${activeConversation.task_id}`}>Aufgabe</Link>
                      ) : null}
                      {activeConversation.submission_id ? (
                        <Link href={`/inbox/${activeConversation.submission_id}`}>Fall</Link>
                      ) : null}
                    </span>
                  )}
                </header>

                <div className="yd-relay-practice__thread-scroll">
                  {loadingThread ? (
                    <p className="yd-relay-practice__thread-status">Wird geladen …</p>
                  ) : loadError ? (
                    <p className="yd-relay-practice__thread-status yd-relay-practice__thread-status--error">
                      {loadError}
                    </p>
                  ) : messages.length === 0 ? (
                    <p className="yd-relay-practice__thread-status">Noch keine Nachrichten.</p>
                  ) : (
                    <ul className="yd-relay-practice__thread-messages">
                      {messages.map((m) => (
                        <li
                          key={m.id}
                          className={cn(
                            "yd-relay-practice__thread-message",
                            m.is_own && "yd-relay-practice__thread-message--own"
                          )}
                        >
                          <span className="yd-relay-practice__thread-message-meta">
                            {m.is_own ? "Sie" : senderDisplayName(m.sender_email)}
                          </span>
                          <p className="yd-relay-practice__thread-message-body">{m.body}</p>
                          <RelayReadStatusCompact
                            receipts={m.read_receipts}
                            isGroup={m.is_group_thread}
                          />
                          <span className="yd-relay-practice__thread-message-meta">
                            {formatRelayMessageTimestamp(m.created_at)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <footer className="yd-relay-practice__thread-compose">
                  {sendError ? (
                    <p className="yd-relay-practice__thread-status yd-relay-practice__thread-status--error">
                      {sendError}
                    </p>
                  ) : null}
                  <textarea
                    className="yd-clinical-control yd-relay-practice__thread-input"
                    rows={2}
                    value={composer}
                    onChange={(e) => setComposer(e.target.value)}
                    placeholder="Nachricht schreiben …"
                    disabled={isPending || loadingThread}
                  />
                  <button
                    type="button"
                    className="yd-tracker-v4-new-case yd-relay-practice__thread-send"
                    onClick={handleSend}
                    disabled={isPending || loadingThread || !composer.trim()}
                  >
                    {isPending ? "…" : "Senden"}
                  </button>
                </footer>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
