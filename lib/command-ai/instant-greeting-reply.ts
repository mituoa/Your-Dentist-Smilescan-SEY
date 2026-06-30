import type {
  CommandAiAssistantPayload,
  CommandAiRichContext,
} from "@/lib/command-ai/command-ai-chat-types";

/** Sofortantwort für „Hallo“ & Co. — ohne OpenAI-Roundtrip. */
export function buildInstantGreetingReply(rich: CommandAiRichContext): CommandAiAssistantPayload {
  const patient = rich.activeCase?.patientName?.trim();

  let reply: string;
  if (patient) {
    reply = `Hallo! Der Fall von ${patient} ist geöffnet. Soll ich einen Antwortentwurf, eine Aufgabe oder eine interne Nachricht vorbereiten?`;
  } else if (rich.zone === "relay") {
    reply =
      "Hallo! Ich helfe bei Aufgaben und Team-Nachrichten. Was soll als Nächstes passieren?";
  } else if (rich.zone === "inbox") {
    reply =
      "Hallo! Öffnen Sie einen Fall in der Liste — dann kann ich Entwürfe und nächste Schritte vorbereiten.";
  } else {
    reply =
      "Hallo! Wobei kann ich helfen — Fall im Tracker, Aufgabe in Relay oder eine Nachricht formulieren?";
  }

  return {
    reply,
    patientDraft: null,
    taskTitle: null,
    taskNotes: null,
    relayMessage: null,
    journalLinks: [],
    actions: rich.activeCase ? [{ type: "navigate", navigate: "inbox_case" }] : [],
    suggestedNavigate: rich.activeCase ? "inbox_case" : null,
  };
}
