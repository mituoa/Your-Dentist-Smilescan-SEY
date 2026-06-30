import "server-only";

import { buildCommandMessageDraft } from "@/lib/command-ai/build-command-message-draft";
import {
  commandAiGptModel,
  commandAiVisionModel,
  isCommandAiGptEnabled,
} from "@/lib/command-ai/gpt-config";
import {
  formatRichContextBlock,
  buildRichCommandAiContext,
} from "@/lib/command-ai/build-rich-context";
import {
  COMMAND_AI_DOMAIN_KNOWLEDGE,
  COMMAND_AI_PATIENT_AUDIENCE_RULES,
} from "@/lib/command-ai/domain-knowledge";
import { parseMessageSignals } from "@/lib/command-ai/message-signals";
import { resolveCommandReplyIntent } from "@/lib/command-ai/reply-intent";
import { resolveCommandIntent } from "@/lib/command-ai/intent-resolver";
import { prepareWorkFromIntent } from "@/lib/command-ai/preparation-engine";
import {
  COMMAND_AI_ACTIONS_DELIMITER,
  COMMAND_AI_PATIENT_WELCOME_MESSAGE,
  COMMAND_AI_WELCOME_MESSAGE,
  type CommandAiAssistantAction,
  type CommandAiAssistantPayload,
  type CommandAiAudience,
  type CommandAiChatContext,
  type CommandAiChatResult,
  type CommandAiChatTurn,
  type CommandAiRichContext,
} from "@/lib/command-ai/command-ai-chat-types";

const ACTIONS_JSON_SCHEMA = `{
  "patientDraft": "string oder null",
  "taskTitle": "string oder null",
  "taskNotes": "string oder null",
  "relayMessage": "string oder null",
  "journalLinks": [{"title":"string","url":"string|null"}],
  "actions": [
    {"type":"set_status","status":"new|in_progress|waiting_for_patient|photo_requested|watching|resolved"},
    {"type":"navigate","navigate":"inbox|inbox_case|relay|relay_messages|journal|dashboard|settings"},
    {"type":"relay_message","relayBody":"string"},
    {"type":"open_draft"},
    {"type":"send_patient","sendBody":"string","sendKind":"reply|question|photo_request|appointment_offer","includeAppointmentLink":false}
  ],
  "suggestedNavigate": "inbox_case|relay|journal|null"
}`;

function buildSystemPrompt(audience: CommandAiAudience): string {
  const audienceBlock =
    audience === "patient"
      ? COMMAND_AI_PATIENT_AUDIENCE_RULES
      : `Zielgruppe: Zahnärztinnen, ZFA und Praxisteam.
Du kannst Status vorschlagen, navigieren, Entwürfe, Relay-Nachrichten und (nur auf explizite Anweisung) Versand vorbereiten.`;

  return `Du bist Command AI — die Praxis-Assistenz in Your Dentist (deutsche Zahnarztpraxis-Software).

${audienceBlock}

${COMMAND_AI_DOMAIN_KNOWLEDGE}

Antwortformat (strikt):
1. Zuerst der Gesprächstext an die Nutzerin (Markdown erlaubt, kurz).
2. Dann exakt diese Zeile allein: ${COMMAND_AI_ACTIONS_DELIMITER}
3. Dann ein JSON-Objekt (kein Markdown drumherum):
${ACTIONS_JSON_SCHEMA}

Regeln für actions:
- set_status nur wenn Team explizit Status ändern will.
- send_patient nur wenn Team explizit „senden/verschicken“ sagt — sonst open_draft.
- relay_message für interne Team-Kommunikation.
- navigate wenn ein Modul sinnvoll ist (z. B. inbox_case bei offenem Fall).
- Bei Fotos im Kontext: beschreibe sichtbare Hinweise vorsichtig, keine Diagnose.

Antworte auf Deutsch.`;
}

function emptyPayload(reply: string): CommandAiAssistantPayload {
  return {
    reply,
    patientDraft: null,
    taskTitle: null,
    taskNotes: null,
    relayMessage: null,
    journalLinks: [],
    actions: [],
    suggestedNavigate: null,
  };
}

function parseActionsJson(raw: string): Partial<CommandAiAssistantPayload> | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const actions = Array.isArray(parsed.actions)
      ? (parsed.actions as CommandAiAssistantAction[])
      : [];

    return {
      patientDraft:
        typeof parsed.patientDraft === "string" && parsed.patientDraft.trim()
          ? parsed.patientDraft.trim()
          : null,
      taskTitle:
        typeof parsed.taskTitle === "string" && parsed.taskTitle.trim()
          ? parsed.taskTitle.trim()
          : null,
      taskNotes:
        typeof parsed.taskNotes === "string" && parsed.taskNotes.trim()
          ? parsed.taskNotes.trim()
          : null,
      relayMessage:
        typeof parsed.relayMessage === "string" && parsed.relayMessage.trim()
          ? parsed.relayMessage.trim()
          : null,
      journalLinks: Array.isArray(parsed.journalLinks)
        ? (parsed.journalLinks as { title: string; url: string | null }[])
        : [],
      actions,
      suggestedNavigate:
        typeof parsed.suggestedNavigate === "string"
          ? (parsed.suggestedNavigate as CommandAiAssistantPayload["suggestedNavigate"])
          : null,
    };
  } catch {
    return null;
  }
}

export function splitReplyAndActions(full: string): CommandAiAssistantPayload {
  const delimiterIndex = full.indexOf(COMMAND_AI_ACTIONS_DELIMITER);
  if (delimiterIndex === -1) {
    return emptyPayload(full.trim());
  }

  const reply = full.slice(0, delimiterIndex).trim();
  const jsonPart = full.slice(delimiterIndex + COMMAND_AI_ACTIONS_DELIMITER.length).trim();
  const parsed = parseActionsJson(jsonPart);

  return {
    reply: reply || "Fertig.",
    patientDraft: parsed?.patientDraft ?? null,
    taskTitle: parsed?.taskTitle ?? null,
    taskNotes: parsed?.taskNotes ?? null,
    relayMessage: parsed?.relayMessage ?? null,
    journalLinks: parsed?.journalLinks ?? [],
    actions: parsed?.actions ?? [],
    suggestedNavigate: parsed?.suggestedNavigate ?? null,
  };
}

type OpenAiMessage =
  | { role: "system" | "user" | "assistant"; content: string }
  | {
      role: "user";
      content: (
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string; detail: "low" | "high" } }
      )[];
    };

function buildOpenAiMessages(
  history: CommandAiChatTurn[],
  rich: CommandAiRichContext
): OpenAiMessage[] {
  const messages: OpenAiMessage[] = [
    { role: "system", content: buildSystemPrompt(rich.audience) },
    { role: "system", content: `Kontext:\n${formatRichContextBlock(rich)}` },
    ...history.slice(-16).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  if (rich.photoUrls.length > 0) {
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx >= 0) {
      const idx = messages.length - 1 - lastUserIdx;
      const last = messages[idx];
      if (last.role === "user" && typeof last.content === "string") {
        messages[idx] = {
          role: "user",
          content: [
            { type: "text", text: `${last.content}\n\n[Fotos des Falls anbei — nur organisatorisch/kursorisch beschreiben, keine Diagnose.]` },
            ...rich.photoUrls.map((url) => ({
              type: "image_url" as const,
              image_url: { url, detail: "low" as const },
            })),
          ],
        };
      }
    }
  }

  return messages;
}

export async function* streamCommandAiChat(input: {
  history: CommandAiChatTurn[];
  userMessage: string;
  rich: CommandAiRichContext;
}): AsyncGenerator<
  | { type: "delta"; text: string }
  | { type: "done"; assistant: CommandAiAssistantPayload }
  | { type: "error"; message: string }
> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    yield { type: "error", message: "OPENAI_API_KEY fehlt." };
    return;
  }

  const history: CommandAiChatTurn[] = [
    ...input.history,
    { role: "user", content: input.userMessage.trim() },
  ];

  const useVision = input.rich.photoUrls.length > 0;
  const model = useVision ? commandAiVisionModel() : commandAiGptModel();
  const messages = buildOpenAiMessages(history, input.rich);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 2200,
      stream: true,
      messages,
    }),
  });

  if (!res.ok || !res.body) {
    console.error("[command-ai-gpt] stream status=", res.status);
    yield { type: "error", message: "KI-Antwort konnte nicht geladen werden." };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const chunk = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[];
        };
        const piece = chunk.choices?.[0]?.delta?.content;
        if (piece) {
          full += piece;
          const delimiterAt = full.indexOf(COMMAND_AI_ACTIONS_DELIMITER);
          const visible =
            delimiterAt === -1 ? piece : full.slice(0, delimiterAt).slice(-piece.length);
          if (visible) yield { type: "delta", text: visible };
        }
      } catch {
        /* ignore partial SSE */
      }
    }
  }

  yield { type: "done", assistant: splitReplyAndActions(full) };
}

async function callOpenAiChatBlocking(
  history: CommandAiChatTurn[],
  rich: CommandAiRichContext
): Promise<CommandAiAssistantPayload | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const useVision = rich.photoUrls.length > 0;
  const model = useVision ? commandAiVisionModel() : commandAiGptModel();
  const messages = buildOpenAiMessages(history, rich);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 2200,
      messages,
    }),
  });

  if (!res.ok) {
    console.error("[command-ai-gpt] status=", res.status);
    return null;
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  return splitReplyAndActions(content);
}

function fallbackAssistant(
  userMessage: string,
  rich: CommandAiRichContext
): CommandAiAssistantPayload {
  const activeCase = rich.activeCase
    ? {
        submissionId: rich.activeCase.submissionId,
        patientName: rich.activeCase.patientName,
        concernLine: rich.activeCase.concernLine,
      }
    : null;

  const intent = resolveCommandIntent(userMessage, null, activeCase);
  const work = prepareWorkFromIntent(intent, {
    patients: rich.activeCase
      ? [
          {
            name: rich.activeCase.patientName?.trim() || "Patient",
            submissionId: rich.activeCase.submissionId,
            concernLine: rich.activeCase.concernLine,
          },
        ]
      : [],
    practicePhone: rich.activeCase?.practicePhone ?? null,
    appointmentUrl: rich.activeCase?.appointmentUrl ?? null,
  });

  const actions: CommandAiAssistantAction[] = [];
  if (rich.activeCase && intent.kind === "patient_message") {
    actions.push({ type: "open_draft" });
    if (rich.zone === "inbox") {
      actions.push({ type: "navigate", navigate: "inbox_case" });
    }
  }

  if (work?.messageDraft) {
    return {
      reply:
        work.suggestionSummary ||
        "Ich habe einen Antwortentwurf vorbereitet — bitte prüfen und freigeben.",
      patientDraft: work.messageDraft,
      taskTitle: work.relayTaskDraft?.title ?? null,
      taskNotes: work.relayTaskDraft?.notes ?? null,
      relayMessage: null,
      journalLinks: rich.journalSnippets.map((j) => ({
        title: j.title,
        url: j.publicUrl,
      })),
      actions,
      suggestedNavigate: rich.activeCase ? "inbox_case" : null,
    };
  }

  if (rich.activeCase && intent.kind === "patient_message") {
    const signals = parseMessageSignals(userMessage);
    const draft = buildCommandMessageDraft({
      patientName: rich.activeCase.patientName?.trim() || "Patient",
      practicePhone: rich.activeCase.practicePhone?.trim() || "",
      appointmentUrl: rich.activeCase.appointmentUrl,
      signals,
      replyIntent: resolveCommandReplyIntent(userMessage, signals),
      submissionUrgency: rich.activeCase.urgency as
        | "today"
        | "within_24h"
        | "this_week"
        | "not_urgent"
        | null,
    });
    return {
      reply: "Hier ist ein Entwurf für die Patientenantwort — bitte anpassen und freigeben.",
      patientDraft: draft,
      taskTitle: null,
      taskNotes: null,
      relayMessage: null,
      journalLinks: rich.journalSnippets.map((j) => ({
        title: j.title,
        url: j.publicUrl,
      })),
      actions: [{ type: "open_draft" }],
      suggestedNavigate: "inbox_case",
    };
  }

  if (work?.relayTaskDraft) {
    return {
      reply: work.situationSummary || "Ich schlage eine Team-Aufgabe vor.",
      patientDraft: null,
      taskTitle: work.relayTaskDraft.title,
      taskNotes: work.relayTaskDraft.notes,
      relayMessage: null,
      journalLinks: [],
      actions: [],
      suggestedNavigate: "relay",
    };
  }

  return {
    reply:
      "Ich bin Ihre Praxis-Assistenz. Öffnen Sie einen Fall im Tracker oder beschreiben Sie, was Sie brauchen.",
    patientDraft: null,
    taskTitle: null,
    taskNotes: null,
    relayMessage: null,
    journalLinks: rich.journalSnippets.map((j) => ({ title: j.title, url: j.publicUrl })),
    actions: rich.activeCase ? [{ type: "navigate", navigate: "inbox_case" }] : [],
    suggestedNavigate: null,
  };
}

export async function runCommandAiChatTurn(input: {
  history: CommandAiChatTurn[];
  userMessage: string;
  context: CommandAiChatContext;
  workspaceId: string;
  audience?: CommandAiAudience;
}): Promise<CommandAiChatResult> {
  const trimmed = input.userMessage.trim();
  if (!trimmed) {
    return { ok: false, error: "Bitte eine Nachricht eingeben." };
  }

  const audience = input.audience ?? "practice";
  const rich = await buildRichCommandAiContext({
    workspaceId: input.workspaceId,
    context: input.context,
    userMessage: trimmed,
    audience,
  });

  const history: CommandAiChatTurn[] = [
    ...input.history,
    { role: "user", content: trimmed },
  ];

  if (isCommandAiGptEnabled()) {
    try {
      const assistant = await callOpenAiChatBlocking(history, rich);
      if (assistant) {
        return { ok: true, assistant, usedGpt: true };
      }
    } catch (err) {
      console.error("[command-ai-gpt] request failed", err);
    }
  }

  const assistant = fallbackAssistant(trimmed, rich);
  return { ok: true, assistant, usedGpt: false };
}

export {
  COMMAND_AI_WELCOME_MESSAGE,
  COMMAND_AI_PATIENT_WELCOME_MESSAGE,
  buildRichCommandAiContext,
};
