import Link from "next/link";
import { MessagesSquare, Users } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { DashboardPanelChrome } from "@/components/dashboard/hc/dashboard-panel-chrome";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import { YD } from "@/lib/design/yd-design-tokens";

function formatRelative(iso: string | null): string {
  if (!iso) return "";
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 60) return `vor ${Math.max(1, diffMin)} Min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `vor ${h} Std`;
  return "gestern";
}

function conversationTitle(c: RelayConversationRow): string {
  if (c.title?.trim()) return c.title.trim();
  if (c.kind === "group") return "Gruppe";
  if (c.other_party_email) {
    const local = c.other_party_email.split("@")[0];
    return local ? local.replace(/\./g, " ") : c.other_party_email;
  }
  return "Direktnachricht";
}

type DashboardRelayCommsPanelProps = {
  conversations: RelayConversationRow[] | null;
  loadFailed?: boolean;
};

export function DashboardRelayCommsPanel({
  conversations,
  loadFailed = false,
}: DashboardRelayCommsPanelProps) {
  const items = conversations?.slice(0, 5) ?? [];

  return (
    <HcCard tone="default" className="yd-dash-panel flex min-h-0 flex-col p-0 md:min-h-[280px]">
      <DashboardPanelChrome
        title="Interne Kommunikation"
        hint="Relay · Direkt, Gruppen, fallbezogen"
        action={
          <Link href="/relay" className="text-[12px] font-medium no-underline" style={{ color: YD.accent.core }}>
            Relay
          </Link>
        }
      />

      <div className="flex flex-1 flex-col px-5 py-4 md:px-6">
        {loadFailed ? (
          <p className="text-[13px]" style={{ color: YD.text.secondary }}>
            Kommunikation momentan nicht verfügbar.
          </p>
        ) : items.length === 0 ? (
          <p className="text-[13px]" style={{ color: YD.text.secondary }}>
            Noch keine Konversationen — Team startet in Relay.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((c) => (
              <li key={c.id}>
                <Link
                  href="/relay"
                  className="flex gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[rgba(248,252,255,0.9)]"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "rgba(180,198,218,0.18)" }}
                  >
                    {c.kind === "group" ? (
                      <Users className="h-4 w-4" style={{ color: YD.text.muted }} strokeWidth={1.65} />
                    ) : (
                      <MessagesSquare
                        className="h-4 w-4"
                        style={{ color: YD.text.muted }}
                        strokeWidth={1.65}
                      />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[13px] font-medium" style={{ color: YD.text.primary }}>
                        {conversationTitle(c)}
                      </p>
                      {c.unread_count > 0 ? (
                        <span
                          className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums"
                          style={{
                            background: YD.status.active.bg,
                            color: YD.status.active.text,
                          }}
                        >
                          {c.unread_count}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug" style={{ color: YD.text.secondary }}>
                      {c.last_message_preview || "Noch keine Nachricht"}
                    </p>
                    {c.last_message_at ? (
                      <p className="mt-0.5 text-[10px]" style={{ color: YD.text.faint }}>
                        {formatRelative(c.last_message_at)}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </HcCard>
  );
}
