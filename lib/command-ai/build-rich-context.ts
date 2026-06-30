import "server-only";

import { formatJournalSnippetsForPrompt, searchJournalForCommandAi } from "@/lib/command-ai/journal-rag";
import { isLightweightUserMessage } from "@/lib/command-ai/message-weight";
import type {
  CommandAiAudience,
  CommandAiChatContext,
  CommandAiRichContext,
} from "@/lib/command-ai/command-ai-chat-types";
import { practiceStatusLabel, normalizePracticeStatus } from "@/lib/practice-status";
import { getOutboundMessagesForSubmission } from "@/lib/queries/outbound-messages";
import { getLatestMessageDraftForSubmission } from "@/lib/queries/message-drafts";
import { getSubmissionById } from "@/lib/queries/submissions";
import { getOpenTaskCountForSubmission } from "@/lib/queries/inbox";

const MAX_PHOTOS_FOR_VISION = 4;
const NOTES_EXCERPT = 600;

function emptyJournalBlock() {
  return {
    journalSnippets: [] as Awaited<ReturnType<typeof searchJournalForCommandAi>>,
    journalPromptBlock: "Keine passenden Journal-Artikel (Kurznachricht).",
  };
}

function buildLightweightCaseRichContext(
  input: {
    context: CommandAiChatContext;
    audience: CommandAiAudience;
  }
): CommandAiRichContext {
  const { context, audience } = input;
  const activeCase = context.activeCase;
  const status = normalizePracticeStatus(activeCase?.practiceStatus ?? null);
  const { journalSnippets, journalPromptBlock } = emptyJournalBlock();

  return {
    ...context,
    audience,
    patientNotesExcerpt: null,
    practiceStatus: status,
    practiceStatusLabel: status ? practiceStatusLabel(status) : null,
    photoCount: activeCase?.photoCount ?? 0,
    photoUrls: [],
    openTaskCount: null,
    draftPreview: null,
    outboundSummary: null,
    journalSnippets,
    journalPromptBlock,
  };
}

export async function buildRichCommandAiContext(input: {
  workspaceId: string;
  context: CommandAiChatContext;
  userMessage: string;
  audience: CommandAiAudience;
}): Promise<CommandAiRichContext> {
  const { context, workspaceId, userMessage } = input;
  const activeCase = context.activeCase;
  const lightweight = isLightweightUserMessage(userMessage);

  if (!activeCase?.submissionId) {
    if (lightweight) {
      const { journalSnippets, journalPromptBlock } = emptyJournalBlock();
      return {
        ...context,
        audience: input.audience,
        patientNotesExcerpt: null,
        practiceStatus: null,
        practiceStatusLabel: null,
        photoCount: 0,
        photoUrls: [],
        openTaskCount: null,
        draftPreview: null,
        outboundSummary: null,
        journalSnippets,
        journalPromptBlock,
      };
    }

    const journalSnippets = await searchJournalForCommandAi({
      workspaceId,
      query: userMessage,
      limit: 4,
    });
    return {
      ...context,
      audience: input.audience,
      patientNotesExcerpt: null,
      practiceStatus: null,
      practiceStatusLabel: null,
      photoCount: 0,
      photoUrls: [],
      openTaskCount: null,
      draftPreview: null,
      outboundSummary: null,
      journalSnippets,
      journalPromptBlock: formatJournalSnippetsForPrompt(journalSnippets),
    };
  }

  if (lightweight) {
    return buildLightweightCaseRichContext({
      context,
      audience: input.audience,
    });
  }

  const submissionId = activeCase.submissionId;
  const [submission, outbound, draft, openTaskCount, journalSnippets] = await Promise.all([
    getSubmissionById(submissionId, workspaceId),
    getOutboundMessagesForSubmission(submissionId, workspaceId),
    getLatestMessageDraftForSubmission(submissionId, workspaceId, "draft"),
    getOpenTaskCountForSubmission(submissionId, workspaceId),
    searchJournalForCommandAi({
      workspaceId,
      query: [userMessage, activeCase.concernLine, activeCase.patientName]
        .filter(Boolean)
        .join(" "),
      limit: 5,
    }),
  ]);

  const notes = submission?.patient_notes?.trim() ?? null;
  const status = normalizePracticeStatus(submission?.practice_status ?? null);
  const photoUrls =
    submission?.photos
      ?.map((p) => p.signed_url)
      .filter((url): url is string => Boolean(url))
      .slice(0, MAX_PHOTOS_FOR_VISION) ?? [];

  const outboundSummary =
    outbound.length === 0
      ? "Noch keine versendete Patientenkommunikation."
      : outbound
          .slice(0, 5)
          .map(
            (m) =>
              `- ${m.message_kind} (${m.status}) ${m.created_at.slice(0, 10)}: ${m.body.slice(0, 120)}${m.body.length > 120 ? "…" : ""}`
          )
          .join("\n");

  return {
    ...context,
    audience: input.audience,
    patientNotesExcerpt: notes
      ? notes.slice(0, NOTES_EXCERPT) + (notes.length > NOTES_EXCERPT ? "…" : "")
      : null,
    practiceStatus: status,
    practiceStatusLabel: status ? practiceStatusLabel(status) : null,
    photoCount: submission?.photos.length ?? 0,
    photoUrls,
    openTaskCount,
    draftPreview: draft?.body?.trim().slice(0, 200) ?? null,
    outboundSummary,
    journalSnippets,
    journalPromptBlock: formatJournalSnippetsForPrompt(journalSnippets),
  };
}

export function formatRichContextBlock(rich: CommandAiRichContext): string {
  const lines = [
    `Zielgruppe: ${rich.audience === "patient" ? "Patient:in (öffentlich)" : "Praxis-Team"}`,
    `Aktuelle Ansicht: ${rich.zone}`,
  ];

  if (rich.activeCase) {
    const c = rich.activeCase;
    lines.push(`Aktiver Fall: ${c.patientName?.trim() || "Patient"}`);
    lines.push(`Fall-ID: ${c.submissionId}`);
    if (c.concernLine?.trim()) lines.push(`Anliegen (Kurz): ${c.concernLine.trim()}`);
    if (rich.patientNotesExcerpt) lines.push(`Patientenangaben: ${rich.patientNotesExcerpt}`);
    if (c.urgency) lines.push(`Dringlichkeit: ${c.urgency}`);
    if (rich.practiceStatusLabel) lines.push(`Praxisstatus: ${rich.practiceStatusLabel}`);
    if (rich.photoCount > 0) lines.push(`Fotos: ${rich.photoCount} (Bilder im Anhang wenn verfügbar)`);
    if (rich.openTaskCount != null) lines.push(`Offene Aufgaben: ${rich.openTaskCount}`);
    if (rich.draftPreview) lines.push(`Aktueller Entwurf (Auszug): ${rich.draftPreview}`);
    if (c.practicePhone?.trim()) lines.push(`Praxis-Telefon: ${c.practicePhone.trim()}`);
    if (c.appointmentUrl?.trim()) lines.push(`Terminlink: ${c.appointmentUrl.trim()}`);
    if (rich.outboundSummary) lines.push(`Kommunikationsverlauf:\n${rich.outboundSummary}`);
  } else {
    lines.push("Kein Patientenfall geöffnet.");
  }

  lines.push(`Relevante Praxis-Artikel (Journal):\n${rich.journalPromptBlock}`);
  return lines.join("\n");
}
