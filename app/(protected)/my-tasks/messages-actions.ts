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

const PERSONAL_NOTES_TITLE = "Eigene Notizen";

async function ensurePersonalNotesConversation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  userId: string
): Promise<string | null> {
  const { data: myConvs } = await supabase
    .from("relay_conversation_members")
    .select("conversation_id")
    .eq("user_id", userId);

  const myIds = (myConvs || []).map((c) => c.conversation_id);
  if (myIds.length > 0) {
    const { data: groups } = await supabase
      .from("relay_conversations")
      .select("id, title")
      .eq("workspace_id", workspaceId)
      .eq("kind", "group")
      .in("id", myIds);

    for (const group of groups || []) {
      if (group.title !== PERSONAL_NOTES_TITLE) continue;
      const { data: members } = await supabase
        .from("relay_conversation_members")
        .select("user_id")
        .eq("conversation_id", group.id);
      const memberIds = (members || []).map((m) => m.user_id);
      if (memberIds.length === 1 && memberIds[0] === userId) {
        return group.id as string;
      }
    }
  }

  const { data: conv, error } = await supabase
    .from("relay_conversations")
    .insert({
      workspace_id: workspaceId,
      kind: "group",
      title: PERSONAL_NOTES_TITLE,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error || !conv?.id) {
    console.error("[ensurePersonalNotesConversation]", error?.code);
    return null;
  }

  const { error: memErr } = await supabase.from("relay_conversation_members").insert({
    conversation_id: conv.id,
    user_id: userId,
    last_read_at: new Date().toISOString(),
  });

  if (memErr) {
    await supabase.from("relay_conversations").delete().eq("id", conv.id);
    return null;
  }

  return conv.id as string;
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

/** Neue interne Nachricht: Direktgespräch starten oder fortsetzen und erste Nachricht senden. */
export async function sendRelayMessageToRecipient(input: {
  recipientUserId?: string;
  recipientUserIds?: string[];
  assignAllTeam?: boolean;
  body: string;
  submissionId?: string | null;
}): Promise<{ ok?: boolean; conversationId?: string; error?: string }> {
  const actor = await resolveActor();
  if (!actor.ok) return { error: actor.error };
  const trimmed = input.body.trim();
  if (!trimmed) return { error: "Bitte schreiben Sie eine Nachricht." };

  const { supabase, user, workspace } = actor;

  if (input.assignAllTeam) {
    const { data: members } = await supabase
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", workspace.workspace_id);

    const memberIds = (members || [])
      .map((m) => m.user_id as string)
      .filter((id) => id !== user.id);
    if (memberIds.length === 0) {
      const conversationId = await ensurePersonalNotesConversation(
        supabase,
        workspace.workspace_id,
        user.id
      );
      if (!conversationId) {
        return { error: "Nachricht konnte nicht gesendet werden." };
      }
      const sent = await sendRelayMessage(conversationId, trimmed);
      if (sent.error) return { error: sent.error };
      return { ok: true, conversationId };
    }

    const fd = new FormData();
    fd.set("title", "Team");
    for (const id of memberIds) {
      fd.append("member_ids[]", id);
    }
    if (input.submissionId) fd.set("submission_id", input.submissionId);

    const group = await createGroupConversation(fd);
    if (group.error || !group.conversationId) {
      return { error: group.error ?? "Nachricht konnte nicht gesendet werden." };
    }
    const sent = await sendRelayMessage(group.conversationId, trimmed);
    if (sent.error) return { error: sent.error };
    return { ok: true, conversationId: group.conversationId };
  }

  const multiIds = Array.from(
    new Set((input.recipientUserIds ?? []).map((id) => id.trim()).filter(Boolean))
  ).filter((id) => id !== user.id);

  if (multiIds.length > 1) {
    const fd = new FormData();
    fd.set("title", "Übergabe");
    for (const id of multiIds) {
      fd.append("member_ids[]", id);
    }
    if (input.submissionId) fd.set("submission_id", input.submissionId);
    const group = await createGroupConversation(fd);
    if (group.error || !group.conversationId) {
      return { error: group.error ?? "Nachricht konnte nicht gesendet werden." };
    }
    const sent = await sendRelayMessage(group.conversationId, trimmed);
    if (sent.error) return { error: sent.error };
    return { ok: true, conversationId: group.conversationId };
  }

  const recipientId = (multiIds[0] ?? input.recipientUserId)?.trim();
  if (!recipientId) {
    return { error: "Bitte wählen Sie einen Empfänger." };
  }

  const direct = await createDirectConversation(recipientId);
  if (direct.error || !direct.conversationId) {
    return { error: direct.error ?? "Nachricht konnte nicht gesendet werden." };
  }

  const sent = await sendRelayMessage(direct.conversationId, trimmed);
  if (sent.error) return { error: sent.error };
  return { ok: true, conversationId: direct.conversationId };
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
