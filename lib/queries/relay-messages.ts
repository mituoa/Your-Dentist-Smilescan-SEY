import "server-only";

import { createClient } from "@/lib/supabase/server";

export type RelayConversationKind = "direct" | "group";

export type RelayConversationRow = {
  id: string;
  kind: RelayConversationKind;
  title: string | null;
  task_id: string | null;
  submission_id: string | null;
  updated_at: string;
  last_message_preview: string | null;
  last_message_at: string | null;
  unread_count: number;
  member_emails: string[];
  other_party_email: string | null;
};

export type RelayMessageRow = {
  id: string;
  sender_id: string;
  sender_email: string | null;
  body: string;
  created_at: string;
  is_own: boolean;
  read_by_others: boolean;
};

export async function getRelayConversationsForUser(
  workspaceId: string,
  userId: string
): Promise<RelayConversationRow[]> {
  const supabase = await createClient();

  const { data: memberships, error: memErr } = await supabase
    .from("relay_conversation_members")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId);

  if (memErr || !memberships?.length) return [];

  const conversationIds = memberships.map((m) => m.conversation_id);
  const lastReadMap = new Map(memberships.map((m) => [m.conversation_id, m.last_read_at]));

  const { data: conversations, error } = await supabase
    .from("relay_conversations")
    .select("id, kind, title, task_id, submission_id, updated_at")
    .eq("workspace_id", workspaceId)
    .in("id", conversationIds)
    .order("updated_at", { ascending: false });

  if (error || !conversations) return [];

  const admin = await import("@/lib/supabase/admin").then((m) => m.createAdminClient());

  const rows: RelayConversationRow[] = [];

  for (const c of conversations) {
    const { data: members } = await supabase
      .from("relay_conversation_members")
      .select("user_id")
      .eq("conversation_id", c.id);

    const memberIds = (members || []).map((m) => m.user_id);
    const emails: string[] = [];
    let otherEmail: string | null = null;
    for (const mid of memberIds) {
      const { data: u } = await admin.auth.admin.getUserById(mid);
      const email = u?.user?.email ?? null;
      if (email) {
        emails.push(email);
        if (c.kind === "direct" && mid !== userId) otherEmail = email;
      }
    }

    const { data: lastMsg } = await supabase
      .from("relay_messages")
      .select("body, created_at, sender_id")
      .eq("conversation_id", c.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastRead = lastReadMap.get(c.id);
    let unread = 0;
    if (lastMsg && lastMsg.sender_id !== userId) {
      const { count } = await supabase
        .from("relay_messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", c.id)
        .neq("sender_id", userId)
        .gt("created_at", lastRead || "1970-01-01");
      unread = count ?? 0;
    }

    rows.push({
      id: c.id,
      kind: c.kind as RelayConversationKind,
      title: c.title,
      task_id: c.task_id,
      submission_id: c.submission_id,
      updated_at: c.updated_at,
      last_message_preview: lastMsg?.body?.slice(0, 80) ?? null,
      last_message_at: lastMsg?.created_at ?? null,
      unread_count: unread,
      member_emails: emails,
      other_party_email: otherEmail,
    });
  }

  return rows;
}

export async function getRelayMessages(
  conversationId: string,
  userId: string,
  workspaceId: string
): Promise<{ messages: RelayMessageRow[]; title: string } | null> {
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("relay_conversations")
    .select("id, title, kind, workspace_id")
    .eq("id", conversationId)
    .eq("workspace_id", workspaceId)
    .single();

  if (!conv) return null;

  const { data: member } = await supabase
    .from("relay_conversation_members")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!member) return null;

  const { data: msgs } = await supabase
    .from("relay_messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);

  const admin = await import("@/lib/supabase/admin").then((m) => m.createAdminClient());

  const messages: RelayMessageRow[] = [];
  for (const m of msgs || []) {
    const { data: u } = await admin.auth.admin.getUserById(m.sender_id);
    const { data: reads } = await supabase
      .from("relay_message_reads")
      .select("user_id")
      .eq("message_id", m.id)
      .neq("user_id", m.sender_id);

    messages.push({
      id: m.id,
      sender_id: m.sender_id,
      sender_email: u?.user?.email ?? null,
      body: m.body,
      created_at: m.created_at,
      is_own: m.sender_id === userId,
      read_by_others: (reads?.length ?? 0) > 0,
    });
  }

  const displayTitle =
    conv.title ||
    (conv.kind === "direct" ? "Direktnachricht" : "Gruppe");

  return { messages, title: displayTitle };
}
