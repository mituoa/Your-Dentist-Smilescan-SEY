import "server-only";

import {
  detectGroupRecipientHint,
  getCommandAssignableMembers,
  groupRecipientLabel,
  resolvePersonAssignee,
} from "@/lib/command-ai/task-assignee-resolve";
import { parseRelayMessageFromVoice } from "@/lib/command-ai/relay-message-intent";
import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export type CreateRelayMessageResult =
  | { ok: true; conversationId: string; message: string }
  | { ok: false; error: string };

function logRelayMessageFailure(scope: string, err: unknown) {
  const row = err as { code?: string };
  console.error(`[command-relay-message] ${scope} code=${row?.code ?? "unknown"}`);
}

async function ensureDirectConversation(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  senderId: string,
  recipientId: string
): Promise<string | null> {
  const { data: myConvs } = await supabase
    .from("relay_conversation_members")
    .select("conversation_id")
    .eq("user_id", senderId);

  const myIds = (myConvs || []).map((c) => c.conversation_id);
  if (myIds.length > 0) {
    const { data: directConvs } = await supabase
      .from("relay_conversations")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("kind", "direct")
      .in("id", myIds);

    for (const dc of directConvs || []) {
      const { data: members } = await supabase
        .from("relay_conversation_members")
        .select("user_id")
        .eq("conversation_id", dc.id);
      const ids = new Set((members || []).map((m) => m.user_id));
      if (ids.has(senderId) && ids.has(recipientId) && ids.size === 2) {
        return dc.id;
      }
    }
  }

  const { data: conv, error } = await supabase
    .from("relay_conversations")
    .insert({
      workspace_id: workspaceId,
      kind: "direct",
      created_by: senderId,
    })
    .select("id")
    .single();

  if (error || !conv?.id) return null;

  const { error: memErr } = await supabase.from("relay_conversation_members").insert([
    { conversation_id: conv.id, user_id: senderId, last_read_at: new Date().toISOString() },
    { conversation_id: conv.id, user_id: recipientId },
  ]);

  if (memErr) {
    await supabase.from("relay_conversations").delete().eq("id", conv.id);
    return null;
  }

  return conv.id as string;
}

export async function createRelayMessageFromCommand(input: {
  rawText: string;
  submissionId?: string | null;
}): Promise<CreateRelayMessageResult> {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();
  if (!user || !workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const trimmed = input.rawText.trim();
  if (!trimmed) {
    return { ok: false, error: "Bitte formulieren Sie eine Nachricht." };
  }

  const parsed = parseRelayMessageFromVoice(trimmed);
  const body = parsed.body.trim() || trimmed;
  const members = await getCommandAssignableMembers(workspace.workspace_id);
  const groupHint = detectGroupRecipientHint(trimmed) ?? (parsed.groupHint === "reception" ? "empfang" : parsed.groupHint === "implant" ? "implantologie" : parsed.groupHint === "team" ? "team" : null);
  const person = resolvePersonAssignee(parsed.assigneeHint, members);

  const supabase = await createClient();
  const workspaceId = workspace.workspace_id;
  let conversationId: string | null = null;

  if (person.kind === "matched") {
    conversationId = await ensureDirectConversation(
      supabase,
      workspaceId,
      user.id,
      person.userId
    );
  } else if (groupHint) {
    const title = groupRecipientLabel(groupHint) ?? "Team";
    const memberIds = members.map((m) => m.user_id).filter((id) => id !== user.id);
    const { data: conv, error } = await supabase
      .from("relay_conversations")
      .insert({
        workspace_id: workspaceId,
        kind: "group",
        title,
        submission_id: input.submissionId ?? null,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error || !conv?.id) {
      logRelayMessageFailure("group insert", error);
      return { ok: false, error: "Nachricht konnte nicht vorbereitet werden." };
    }

    conversationId = conv.id as string;
    const rows = [user.id, ...memberIds].map((uid) => ({
      conversation_id: conversationId!,
      user_id: uid,
      last_read_at: uid === user.id ? new Date().toISOString() : null,
    }));
    const { error: memErr } = await supabase.from("relay_conversation_members").insert(rows);
    if (memErr) {
      await supabase.from("relay_conversations").delete().eq("id", conversationId);
      return { ok: false, error: "Nachricht konnte nicht vorbereitet werden." };
    }
  } else if (person.kind === "ambiguous") {
    return {
      ok: false,
      error: "Mehrere Personen passen — bitte im Relay die Nachricht manuell adressieren.",
    };
  } else {
    return {
      ok: false,
      error: "Bitte nennen Sie Empfang, Team oder eine Person (z. B. „Informiere Empfang …“).",
    };
  }

  if (!conversationId) {
    return { ok: false, error: "Nachricht konnte nicht vorbereitet werden." };
  }

  const { error: msgErr } = await supabase.from("relay_messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body,
  });

  if (msgErr) {
    logRelayMessageFailure("message insert", msgErr);
    return { ok: false, error: "Nachricht konnte nicht gesendet werden." };
  }

  await supabase
    .from("relay_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return {
    ok: true,
    conversationId,
    message: "Interne Nachricht gesendet.",
  };
}
