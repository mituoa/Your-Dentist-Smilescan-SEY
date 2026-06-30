"use client";

import type {
  CommandAiAssistantPayload,
  CommandAiChatContext,
  CommandAiChatTurn,
} from "@/lib/command-ai/command-ai-chat-types";

export type CommandAiStreamHandlers = {
  onSession?: (sessionId: string) => void;
  onDelta: (text: string) => void;
  onDone: (assistant: CommandAiAssistantPayload) => void;
  onError: (message: string) => void;
};

export async function streamPracticeCommandAi(input: {
  history: CommandAiChatTurn[];
  userMessage: string;
  context: CommandAiChatContext;
  sessionId?: string | null;
  handlers: CommandAiStreamHandlers;
}): Promise<boolean> {
  const res = await fetch("/api/command-ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      history: input.history,
      userMessage: input.userMessage,
      context: input.context,
      sessionId: input.sessionId,
    }),
  });

  if (res.status === 503) return false;
  if (!res.ok || !res.body) {
    input.handlers.onError("KI-Chat nicht verfügbar.");
    return true;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const lines = part.split("\n");
      let event = "message";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) data = line.slice(5).trim();
      }
      if (!data) continue;
      try {
        const parsed = JSON.parse(data) as Record<string, unknown>;
        if (event === "session" && typeof parsed.sessionId === "string") {
          input.handlers.onSession?.(parsed.sessionId);
        } else if (event === "delta" && typeof parsed.text === "string") {
          input.handlers.onDelta(parsed.text);
        } else if (event === "done" && parsed.assistant) {
          input.handlers.onDone(parsed.assistant as CommandAiAssistantPayload);
        } else if (event === "error") {
          input.handlers.onError(
            typeof parsed.message === "string" ? parsed.message : "Fehler."
          );
        }
      } catch {
        /* ignore */
      }
    }
  }

  return true;
}

export async function streamPatientCommandAi(input: {
  slug: string;
  history: CommandAiChatTurn[];
  userMessage: string;
  sessionId?: string | null;
  handlers: CommandAiStreamHandlers & {
    onSession?: (sessionId: string, practiceName?: string) => void;
  };
}): Promise<void> {
  const res = await fetch("/api/command-ai/patient-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug: input.slug,
      history: input.history,
      userMessage: input.userMessage,
      sessionId: input.sessionId,
    }),
  });

  if (!res.ok || !res.body) {
    input.handlers.onError("Assistenz vorübergehend nicht verfügbar.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const lines = part.split("\n");
      let event = "message";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) data = line.slice(5).trim();
      }
      if (!data) continue;
      try {
        const parsed = JSON.parse(data) as Record<string, unknown>;
        if (event === "session" && typeof parsed.sessionId === "string") {
          input.handlers.onSession?.(
            parsed.sessionId,
            typeof parsed.practiceName === "string" ? parsed.practiceName : undefined
          );
        } else if (event === "delta" && typeof parsed.text === "string") {
          input.handlers.onDelta(parsed.text);
        } else if (event === "done" && parsed.assistant) {
          input.handlers.onDone(parsed.assistant as CommandAiAssistantPayload);
        } else if (event === "error") {
          input.handlers.onError(
            typeof parsed.message === "string" ? parsed.message : "Fehler."
          );
        }
      } catch {
        /* ignore */
      }
    }
  }
}

export function commandAiStorageKey(submissionId: string | null): string {
  return `yd-command-ai-${submissionId ?? "global"}`;
}

export function loadLocalCommandAiSession(submissionId: string | null): {
  sessionId: string | null;
  messages: { role: "user" | "assistant"; content: string }[];
} {
  if (typeof window === "undefined") return { sessionId: null, messages: [] };
  try {
    const raw = localStorage.getItem(commandAiStorageKey(submissionId));
    if (!raw) return { sessionId: null, messages: [] };
    const parsed = JSON.parse(raw) as {
      sessionId?: string;
      messages?: { role: "user" | "assistant"; content: string }[];
    };
    return {
      sessionId: parsed.sessionId ?? null,
      messages: parsed.messages ?? [],
    };
  } catch {
    return { sessionId: null, messages: [] };
  }
}

export function saveLocalCommandAiSession(
  submissionId: string | null,
  data: { sessionId: string | null; messages: { role: "user" | "assistant"; content: string }[] }
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(commandAiStorageKey(submissionId), JSON.stringify(data));
  } catch {
    /* quota */
  }
}
