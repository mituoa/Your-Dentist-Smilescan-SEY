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
import { RelayPremiumEmpty } from "@/components/my-tasks/relay-premium-empty";
import { RelayReadStatusCompact } from "@/components/my-tasks/relay-read-status-compact";
import { RelayWorkRowIcon } from "@/components/my-tasks/relay-work-row-icon";
import { formatRelayMessageTimestamp } from "@/lib/relay/read-receipt-display";
import { cn } from "@/lib/utils";

type MessageFilter = "direct" | "group" | "cases";

type RelayMessagesCentralViewProps = {
  conversations: RelayConversationRow[];
  assignableMembers: AssignableMember[];
  currentUserId: string;
};

const FILTERS: { id: MessageFilter; label: string }[] = [
  { id: "direct", label: "Direkt" },
  { id: "group", label: "Gruppen" },
  { id: "cases", label: "Fälle" },
];

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


function matchesFilter(c: RelayConversationRow, filter: MessageFilter): boolean {
  if (filter === "direct") return c.kind === "direct";
  if (filter === "group") return c.kind === "group";
  if (filter === "cases") return Boolean(c.submission_id);
  return true;
}

export function RelayMessagesCentralView({
  conversations,
}: RelayMessagesCentralViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("conversation");
  const filterParam = (searchParams.get("msgFilter") as MessageFilter | null) ?? "direct";
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
    params.set("bereich", "handovers");
    params.set("msgFilter", filter);
    router.replace(`/relay?${params.toString()}`, { scroll: false });
  };

  const openConversation = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("bereich", "handovers");
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

  return (
    <div className="yd-relay-v6-shell yd-relay-v3-shell yd-tracker-shell flex min-h-0 flex-1 overflow-hidden">
      <div
        className={cn(
          "yd-relay-v3-shell__list yd-relay-v6-messages-list yd-tracker-shell__inbox flex min-h-0 flex-col",
          activeConversation && "max-lg:hidden"
        )}
      >
        <div className="yd-relay-v6-messages-list__tools">
          <div className="yd-relay-v6-messages-list__search">
            <Search className="h-4 w-4 shrink-0 opacity-60" strokeWidth={1.75} aria-hidden />
            <input
              type="search"
              className="yd-relay-v6-messages-list__search-input"
              placeholder="Suchen …"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Nachrichten suchen"
            />
          </div>
          <div className="yd-relay-v6-messages-list__filters" role="tablist" aria-label="Nachrichten filtern">
            {FILTERS.map((f) => {
              const active = filterParam === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={cn("yd-relay-v6-messages-list__filter", active && "yd-relay-v6-messages-list__filter--active")}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="yd-relay-v6-list__scroll min-h-0 flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <RelayPremiumEmpty
              variant="inline"
              title={query.trim() ? "Keine Nachrichten zu dieser Suche." : "Keine Nachrichten mit Handlungsbedarf."}
              text={
                query.trim()
                  ? "Passen Sie die Suche an oder starten Sie über „Erstellen“ eine neue Nachricht."
                  : "Interne Kommunikation erscheint hier, sobald eine Rückmeldung nötig ist."
              }
            />
          ) : (
            <ul className="yd-relay-v6-list__items">
              {filtered.map((c) => {
                const active = c.id === activeId;
                const unread = c.unread_count > 0;
                const from = senderDisplayName(c.other_party_email ?? c.member_emails[0] ?? null);
                const to =
                  c.kind === "group"
                    ? "Gruppe"
                    : senderDisplayName(c.member_emails.find((e) => e !== c.other_party_email) ?? null);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={cn(
                        "yd-relay-v6-row yd-relay-v7-row",
                        active && "yd-relay-v6-row--active yd-relay-v7-row--active",
                        unread && "yd-relay-v6-row--urgent"
                      )}
                      onClick={() => openConversation(c.id)}
                    >
                      <RelayWorkRowIcon
                        row={{
                          id: `msg-${c.id}`,
                          href: "",
                          primaryLabel: conversationLabel(c),
                          context: "",
                          timeLabel: "",
                          actionLabel: "",
                          statusLabel: "",
                          typeLabel: "Nachricht",
                          groupLabel: "",
                          fromLabel: from,
                          toLabel: to,
                          dueLabel: null,
                          kind: "message",
                        }}
                      />
                      <span className="yd-relay-v6-row__body">
                        <span className="yd-relay-v7-row__type">Nachricht</span>
                        <span className="yd-relay-v6-row__title">{conversationLabel(c)}</span>
                        <span className="yd-relay-v6-row__route">
                          {from} → {to}
                        </span>
                        <span className="yd-relay-v6-row__meta">
                          {[
                            c.submission_id ? "Fallbezug" : null,
                            unread ? "Neu" : null,
                            c.last_message_at ? formatRelayMessageTimestamp(c.last_message_at) : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div
        className={cn(
          "yd-relay-v3-shell__workspace max-lg:min-h-0 max-lg:flex-1",
          !activeConversation && "max-lg:hidden",
          activeConversation && "max-lg:flex max-lg:flex-col"
        )}
      >
        <div className="yd-relay-v3-shell__context yd-relay-v6-messages-thread">
          {!activeConversation ? (
            <RelayPremiumEmpty
              variant="detail"
              title="Konversation wählen"
              text="Links eine Unterhaltung auswählen — der Verlauf erscheint hier."
            />
          ) : (
            <>
              <header className="yd-relay-v6-messages-thread__head">
                <button
                  type="button"
                  className="yd-relay-v6-messages-thread__back md:hidden"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("conversation");
                    router.replace(`/relay?${params.toString()}`, { scroll: false });
                  }}
                >
                  Zurück
                </button>
                <h2 className="yd-relay-v6-messages-thread__title">
                  {threadTitle || conversationLabel(activeConversation)}
                </h2>
              </header>

              <div className="yd-relay-v6-messages-thread__scroll">
                {loadingThread ? (
                  <p className="yd-relay-v6-messages-thread__status">Wird geladen …</p>
                ) : loadError ? (
                  <p className="yd-relay-v6-messages-thread__status yd-relay-v6-messages-thread__status--error">
                    {loadError}
                  </p>
                ) : messages.length === 0 ? (
                  <p className="yd-relay-v6-messages-thread__status">Noch keine Nachrichten.</p>
                ) : (
                  <ul className="yd-relay-v6-messages-log">
                    {messages.map((m) => (
                      <li key={m.id} className="yd-relay-v6-messages-log__entry">
                        <div className="yd-relay-v6-messages-log__head">
                          <span className="yd-relay-v6-messages-log__author">
                            {m.is_own ? "Sie" : senderDisplayName(m.sender_email)}
                          </span>
                          <span className="yd-relay-v6-messages-log__time">
                            {formatRelayMessageTimestamp(m.created_at)}
                          </span>
                        </div>
                        <p className="yd-relay-v6-messages-log__body">{m.body}</p>
                        <RelayReadStatusCompact
                          receipts={m.read_receipts}
                          isGroup={m.is_group_thread}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <footer className="yd-relay-v6-messages-thread__compose">
                {sendError ? (
                  <p className="yd-relay-v6-messages-thread__status yd-relay-v6-messages-thread__status--error">
                    {sendError}
                  </p>
                ) : null}
                <textarea
                  className="yd-relay-v6-messages-thread__input"
                  rows={2}
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  placeholder="Nachricht schreiben …"
                  disabled={isPending || loadingThread}
                />
                <button
                  type="button"
                  className="yd-relay-v6-messages-thread__send"
                  onClick={handleSend}
                  disabled={isPending || loadingThread || !composer.trim()}
                >
                  {isPending ? "…" : "Senden"}
                </button>
              </footer>
            </>
          )}
        </div>

        <aside className="yd-relay-v3-shell__actions yd-relay-v6-messages-details" aria-label="Details">
          {!activeConversation ? (
            <p className="yd-relay-v6-messages-details__empty">Details zur Unterhaltung</p>
          ) : (
            <>
              <h2 className="yd-relay-v3-actions__title">Details</h2>
              <dl className="yd-relay-v3-context__facts">
                <div>
                  <dt>Typ</dt>
                  <dd>{activeConversation.kind === "group" ? "Gruppe" : "Direkt"}</dd>
                </div>
                {activeConversation.member_emails.length > 0 ? (
                  <div>
                    <dt>Mitglieder</dt>
                    <dd>
                      {activeConversation.member_emails.map((e) => senderDisplayName(e)).join(", ")}
                    </dd>
                  </div>
                ) : null}
                {activeConversation.submission_id ? (
                  <div>
                    <dt>Patientenbezug</dt>
                    <dd>
                      <Link href={`/inbox/${activeConversation.submission_id}`}>Fall öffnen</Link>
                    </dd>
                  </div>
                ) : null}
                {activeConversation.task_id ? (
                  <div>
                    <dt>Aufgabe</dt>
                    <dd>
                      <Link href={`/my-tasks/${activeConversation.task_id}`}>Verknüpfte Aufgabe</Link>
                    </dd>
                  </div>
                ) : null}
                {activeConversation.unread_count > 0 ? (
                  <div>
                    <dt>Ungelesen</dt>
                    <dd>{activeConversation.unread_count}</dd>
                  </div>
                ) : null}
              </dl>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
