import { NextResponse } from "next/server";

import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import {
  appendCommandAiMessage,
  getOrCreateCommandAiSession,
} from "@/lib/command-ai/chat-persistence";
import type {
  CommandAiChatContext,
  CommandAiChatTurn,
} from "@/lib/command-ai/command-ai-chat-types";
import { buildRichCommandAiContext, streamCommandAiChat } from "@/lib/command-ai/gpt-practice-assistant";
import { isCommandAiGptEnabled } from "@/lib/command-ai/gpt-config";

export const runtime = "nodejs";

type ChatRequestBody = {
  history: CommandAiChatTurn[];
  userMessage: string;
  context: CommandAiChatContext;
  sessionId?: string | null;
};

export async function POST(req: Request) {
  const [user, workspace] = await Promise.all([getCurrentUser(), getCurrentWorkspace()]);
  if (!user || !workspace) {
    return NextResponse.json({ error: "Bitte erneut anmelden." }, { status: 401 });
  }

  if (!isCommandAiGptEnabled()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY nicht konfiguriert — Regel-Assistent nutzen." },
      { status: 503 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const trimmed = body.userMessage?.trim();
  if (!trimmed) {
    return NextResponse.json({ error: "Leere Nachricht." }, { status: 400 });
  }

  const submissionId = body.context?.activeCase?.submissionId ?? null;
  const sessionId = await getOrCreateCommandAiSession(
    {
      workspaceId: workspace.workspace_id,
      userId: user.id,
      submissionId,
      audience: "practice",
    },
    body.sessionId
  );

  if (sessionId) {
    await appendCommandAiMessage({
      sessionId,
      role: "user",
      content: trimmed,
    });
  }

  const rich = await buildRichCommandAiContext({
    workspaceId: workspace.workspace_id,
    context: body.context,
    userMessage: trimmed,
    audience: "practice",
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        if (sessionId) send("session", { sessionId });

        let assistantPayload = null;
        for await (const chunk of streamCommandAiChat({
          history: body.history ?? [],
          userMessage: trimmed,
          rich,
        })) {
          if (chunk.type === "delta") {
            send("delta", { text: chunk.text });
          } else if (chunk.type === "done") {
            assistantPayload = chunk.assistant;
            send("done", { assistant: chunk.assistant });
          } else if (chunk.type === "error") {
            send("error", { message: chunk.message });
          }
        }

        if (sessionId && assistantPayload) {
          await appendCommandAiMessage({
            sessionId,
            role: "assistant",
            content: assistantPayload.reply,
            payload: assistantPayload,
          });
        }
      } catch (err) {
        console.error("[command-ai-stream]", err);
        send("error", { message: "Antwort unterbrochen. Bitte erneut versuchen." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
