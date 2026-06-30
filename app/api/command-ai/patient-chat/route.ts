import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAppBaseUrl } from "@/lib/env";
import type { CommandAiChatTurn } from "@/lib/command-ai/command-ai-chat-types";
import { buildRichCommandAiContext, streamCommandAiChat } from "@/lib/command-ai/gpt-practice-assistant";
import { isCommandAiGptEnabled } from "@/lib/command-ai/gpt-config";

export const runtime = "nodejs";

type PatientChatBody = {
  slug: string;
  userMessage: string;
  history?: CommandAiChatTurn[];
  sessionId?: string | null;
};

export async function POST(req: Request) {
  if (!isCommandAiGptEnabled()) {
    return NextResponse.json({ error: "Assistenz vorübergehend nicht verfügbar." }, { status: 503 });
  }

  let body: PatientChatBody;
  try {
    body = (await req.json()) as PatientChatBody;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const slug = body.slug?.trim().toLowerCase();
  const trimmed = body.userMessage?.trim();
  if (!slug || !trimmed) {
    return NextResponse.json({ error: "Nachricht fehlt." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: workspace } = await admin
    .from("workspaces")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!workspace?.id) {
    return NextResponse.json({ error: "Praxis nicht gefunden." }, { status: 404 });
  }

  const { data: profile } = await admin
    .from("profile_data")
    .select("practice_phone, appointment_link")
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  const context = {
    zone: "other" as const,
    activeCase: null,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    publicSlug: workspace.slug,
  };

  const rich = await buildRichCommandAiContext({
    workspaceId: workspace.id,
    context,
    userMessage: trimmed,
    audience: "patient",
  });

  rich.activeCase = null;

  const sessionId = body.sessionId ?? crypto.randomUUID();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send("session", { sessionId, practiceName: workspace.name, baseUrl: getAppBaseUrl() });

        let assistantPayload = null;
        for await (const chunk of streamCommandAiChat({
          history: body.history ?? [],
          userMessage: trimmed,
          rich,
        })) {
          if (chunk.type === "delta") send("delta", { text: chunk.text });
          else if (chunk.type === "done") {
            assistantPayload = chunk.assistant;
            send("done", { assistant: chunk.assistant });
          } else if (chunk.type === "error") send("error", { message: chunk.message });
        }

        void assistantPayload;
      } catch (err) {
        console.error("[patient-command-ai]", err);
        send("error", { message: "Antwort nicht verfügbar. Bitte die Praxis direkt kontaktieren." });
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
