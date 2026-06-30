import "server-only";

import {
  commandAiGptModel,
  isCommandAiGptEnabled,
} from "@/lib/command-ai/gpt-config";
import type { ClinicalAreaId } from "@/lib/journal/clinical-areas";
import { generateGuidedDraftMarkdown } from "@/lib/journal/guided-drafts";

export type CareAnswerDraftInput = {
  question: string;
  notes?: string;
  clinicalArea?: ClinicalAreaId | null;
};

export type CareAnswerDraftResult = {
  content: string;
  source: "ki" | "template";
};

function buildTemplateDraft(question: string, notes: string): string {
  const guided = generateGuidedDraftMarkdown(question);
  if (guided.trim()) return guided;

  const lines = [
    notes.trim() ? `${notes.trim()}\n` : "",
    "Diese Antwort richtet sich an Patientinnen und Patienten Ihrer Praxis. Formulieren Sie verständlich und ohne Diagnose.",
    "",
    "**Kurz erklärt**",
    "— Was Patientinnen wissen sollten",
    "— Wann ein Praxisbesuch sinnvoll ist",
    "",
    "**Hinweis**",
    "Bei akuten Beschwerden oder Unsicherheit bitte direkt die Praxis kontaktieren.",
  ].filter(Boolean);

  return lines.join("\n");
}

async function generateWithGpt(input: CareAnswerDraftInput): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || !isCommandAiGptEnabled()) return null;

  const question = input.question.trim();
  const notes = input.notes?.trim() ?? "";
  const area = input.clinicalArea?.trim() ?? "";

  const system = `Du schreibst Entwürfe für das Care Center einer Zahnarztpraxis — patientenverständliche Antworten auf häufige Fragen.

Regeln:
- Deutsch, ruhig und professionell
- Keine Diagnose, keine Heilsversprechen, keine individuelle Behandlungszusage
- Markdown mit kurzen Absätzen und optional 2–3 Überschriften
- Am Ende ein neutraler Hinweis: bei akuten Beschwerden die Praxis kontaktieren
- Nur den Antworttext — keine Meta-Kommentare`;

  const user = [
    `Patientenfrage / Thema: ${question}`,
    area ? `Themenbereich: ${area}` : null,
    notes ? `Zusätzliche Hinweise der Praxis: ${notes}` : null,
    "Erstelle einen ersten Entwurf (ca. 120–220 Wörter).",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: commandAiGptModel(),
        temperature: 0.45,
        max_tokens: 900,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      console.error("[care-center-draft] gpt status=", res.status);
      return null;
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    return text && text.length > 40 ? text : null;
  } catch (error) {
    console.error("[care-center-draft] gpt failed", error);
    return null;
  }
}

export async function generateCareAnswerDraft(
  input: CareAnswerDraftInput
): Promise<CareAnswerDraftResult> {
  const question = input.question.trim();
  const notes = input.notes?.trim() ?? "";

  const fromGpt = await generateWithGpt(input);
  if (fromGpt) {
    return { content: fromGpt, source: "ki" };
  }

  return {
    content: buildTemplateDraft(question, notes),
    source: "template",
  };
}
