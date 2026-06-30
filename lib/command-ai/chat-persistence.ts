import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  CommandAiAssistantPayload,
  CommandAiAudience,
  CommandAiPersistedMessage,
} from "@/lib/command-ai/command-ai-chat-types";

export type CommandAiSessionScope = {
  workspaceId: string;
  userId: string;
  submissionId?: string | null;
  audience: CommandAiAudience;
};

function isMissingTableError(err: unknown): boolean {
  const row = err as { code?: string; message?: string };
  return row?.code === "42P01" || (row?.message ?? "").includes("command_ai_sessions");
}

export async function isCommandAiPersistenceAvailable(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("command_ai_sessions").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}

export async function getOrCreateCommandAiSession(
  scope: CommandAiSessionScope,
  existingSessionId?: string | null
): Promise<string | null> {
  try {
    const supabase = await createClient();

    if (existingSessionId) {
      const { data } = await supabase
        .from("command_ai_sessions")
        .select("id")
        .eq("id", existingSessionId)
        .eq("workspace_id", scope.workspaceId)
        .eq("user_id", scope.userId)
        .maybeSingle();
      if (data?.id) return data.id as string;
    }

    const { data: created, error } = await supabase
      .from("command_ai_sessions")
      .insert({
        workspace_id: scope.workspaceId,
        user_id: scope.userId,
        submission_id: scope.submissionId ?? null,
        audience: scope.audience,
      })
      .select("id")
      .single();

    if (error || !created?.id) {
      if (!isMissingTableError(error)) {
        console.error("[command-ai-persist] create session", error);
      }
      return null;
    }
    return created.id as string;
  } catch (err) {
    if (!isMissingTableError(err)) console.error("[command-ai-persist] session", err);
    return null;
  }
}

export async function loadCommandAiMessages(
  sessionId: string,
  workspaceId: string,
  userId: string
): Promise<CommandAiPersistedMessage[]> {
  try {
    const supabase = await createClient();
    const { data: session } = await supabase
      .from("command_ai_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!session?.id) return [];

    const { data, error } = await supabase
      .from("command_ai_messages")
      .select("id, role, content, payload, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(80);

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id as string,
      role: row.role as "user" | "assistant",
      content: row.content as string,
      payload: (row.payload as CommandAiAssistantPayload | null) ?? null,
      createdAt: row.created_at as string,
    }));
  } catch {
    return [];
  }
}

export async function appendCommandAiMessage(input: {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  payload?: CommandAiAssistantPayload | null;
}): Promise<void> {
  try {
    const supabase = await createClient();
    const { error: insertError } = await supabase.from("command_ai_messages").insert({
      session_id: input.sessionId,
      role: input.role,
      content: input.content,
      payload: input.payload ?? null,
    });
    if (insertError && !isMissingTableError(insertError)) {
      console.error("[command-ai-persist] insert message", insertError);
      return;
    }

    await supabase
      .from("command_ai_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", input.sessionId);
  } catch (err) {
    if (!isMissingTableError(err)) console.error("[command-ai-persist] append", err);
  }
}
