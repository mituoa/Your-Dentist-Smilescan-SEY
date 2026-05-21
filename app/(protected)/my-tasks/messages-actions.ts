"use server";

import { revalidatePath } from "next/cache";

import { getRelayMessages } from "@/lib/queries/relay-messages";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceMembershipForUserId } from "@/lib/auth-helpers";

async function resolveActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Bitte melden Sie sich an." };

  const workspace = await getWorkspaceMembershipForUserId(user.id);
  if (!workspace) return { ok: false as const, error: "Kein Arbeitsbereich gefunden." };

  return { ok: true as const, supabase, user, workspace };
}

export async function loadRelayMessagesState(conversationId: string) {
  const actor = await resolveActor();
  if (!actor.ok) return { ok: false as const, error: actor.error };
  const data = await getRelayMessages(
    conversationId,
    actor.user.id,
    actor.workspace.workspace_id
  );
  if (!data) return { ok: false as const, error: "Unterhaltung nicht gefunden." };
  return { ok: true as const, ...data };
}

export async function createDirectConversation(recipientUserId: string): Promise<{
  ok?: boolean;
  conversationId?: string;
  error?: string;
}> {
  const actor = await resolveActor();
  if (!actor.ok) return { error: actor.error };
  const { supabase, user, workspace } = actor;

  if (recipientUserId === user.id) {
    return { error: "Bitte wählen Sie eine andere Person im Team." };
  }

  const { data: member } = await supabase
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspace.workspace_id)
    .eq("user_id", recipientUserId)
    .maybeSingle();

  if (!member) return { error: "Diese Person gehört nicht zu Ihrer Praxis." };

  const { data: myConvs } = await supabase
    .from("relay_conversation_members")
    .select("conversation_id")
    .eq("user_id", user.id);

  const myIds = (myConvs || []).map((c) => c.conversation_id);
  if (myIds.length > 0) {
    const { data: directConvs } = await supabase
      .from("relay_conversations")
      .select("id")
      .eq("workspace_id", workspace.workspace_id)
      .eq("kind", "direct")
      .in("id", myIds);

    for (const dc of directConvs || []) {
      const { data: members } = await supabase
        .from("relay_conversation_members")
        .select("user_id")
        .eq("conversation_id", dc.id);
      const ids = new Set((members || []).map((m) => m.user_id));
      if (ids.has(user.id) && ids.has(recipientUserId) && ids.size === 2) {
        revalidatePath("/relay");
        return { ok: true, conversationId: dc.id };
      }
    }
  }

  const { data: conv, error } = await supabase
    .from("relay_conversations")
    .insert({
      workspace_id: workspace.workspace_id,
      kind: "direct",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !conv) {
    console.error("[createDirectConversation]", error?.code);
    return { error: "Nachricht konnte nicht gestartet werden." };
  }

  const { error: memErr } = await supabase.from("relay_conversation_members").insert([
    { conversation_id: conv.id, user_id: user.id, last_read_at: new Date().toISOString() },
    { conversation_id: conv.id, user_id: recipientUserId },
  ]);

  if (memErr) {
    await supabase.from("relay_conversations").delete().eq("id", conv.id);
    return { error: "Nachricht konnte nicht gestartet werden." };
  }

  revalidatePath("/relay");
  return { ok: true, conversationId: conv.id };
}

export async function createGroupConversation(formData: FormData): Promise<{
  ok?: boolean;
  conversationId?: string;
  error?: string;
}> {
  const actor = await resolveActor();
  if (!actor.ok) return { error: actor.error };
  const { supabase, user, workspace } = actor;

  const title = ((formData.get("title") as string) || "").trim();
  const memberIds = Array.from(
    new Set(
      formData
        .getAll("member_ids[]")
        .map((v) => String(v).trim())
        .filter(Boolean)
    )
  );

  if (!title) return { error: "Bitte vergeben Sie einen Gruppennamen." };
  if (memberIds.length === 0) return { error: "Bitte wählen Sie mindestens ein Teammitglied." };

  const allIds = Array.from(new Set([user.id, ...memberIds]));

  const { data: members } = await supabase
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspace.workspace_id)
    .in("user_id", allIds);

  if ((members || []).length !== allIds.length) {
    return { error: "Ein ausgewähltes Mitglied gehört nicht zu Ihrer Praxis." };
  }

  const taskId = ((formData.get("task_id") as string) || "").trim() || null;
  const submissionId = ((formData.get("submission_id") as string) || "").trim() || null;

  const { data: conv, error } = await supabase
    .from("relay_conversations")
    .insert({
      workspace_id: workspace.workspace_id,
      kind: "group",
      title,
      task_id: taskId,
      submission_id: submissionId,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !conv) return { error: "Gruppe konnte nicht erstellt werden." };

  const rows = allIds.map((uid) => ({
    conversation_id: conv.id,
    user_id: uid,
    last_read_at: uid === user.id ? new Date().toISOString() : null,
  }));

  const { error: memErr } = await supabase.from("relay_conversation_members").insert(rows);
  if (memErr) {
    await supabase.from("relay_conversations").delete().eq("id", conv.id);
    return { error: "Gruppe konnte nicht erstellt werden." };
  }

  revalidatePath("/relay");
  return { ok: true, conversationId: conv.id };
}

export async function sendRelayMessage(
  conversationId: string,
  body: string
): Promise<{ ok?: boolean; error?: string }> {
  const actor = await resolveActor();
  if (!actor.ok) return { error: actor.error };
  const trimmed = body.trim();
  if (!trimmed) return { error: "Bitte schreiben Sie eine Nachricht." };

  const { supabase, user, workspace } = actor;

  const { data: member } = await supabase
    .from("relay_conversation_members")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) return { error: "Sie sind nicht Teil dieser Unterhaltung." };

  const { error } = await supabase.from("relay_messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: trimmed,
  });

  if (error) return { error: "Nachricht konnte nicht gesendet werden." };

  await supabase
    .from("relay_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("workspace_id", workspace.workspace_id);

  await supabase
    .from("relay_conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);

  revalidatePath("/relay");
  return { ok: true };
}

export async function markRelayConversationRead(conversationId: string): Promise<void> {
  const actor = await resolveActor();
  if (!actor.ok) return;
  const now = new Date().toISOString();
  await actor.supabase
    .from("relay_conversation_members")
    .update({ last_read_at: now })
    .eq("conversation_id", conversationId)
    .eq("user_id", actor.user.id);

  const { data: unreadMsgs } = await actor.supabase
    .from("relay_messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .neq("sender_id", actor.user.id);

  if (unreadMsgs?.length) {
    await actor.supabase.from("relay_message_reads").upsert(
      unreadMsgs.map((m) => ({
        message_id: m.id,
        user_id: actor.user.id,
        read_at: now,
      })),
      { onConflict: "message_id,user_id" }
    );
  }

  revalidatePath("/relay");
}
