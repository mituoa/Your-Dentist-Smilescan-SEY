import type { SubmissionCareRecommendation } from "@/lib/care-center/match-submission-recommendation";

/** Ergänzt den Antwortentwurf um einen ruhigen Care-Center-Hinweis (nur mit öffentlicher URL). */
export function appendCareCenterRecommendationToDraft(
  draftBody: string,
  recommendation: SubmissionCareRecommendation
): string {
  if (!recommendation.publicUrl) return draftBody;
  if (draftBody.includes(recommendation.publicUrl)) return draftBody;

  const block =
    `\n\nFür ergänzende Informationen zu Ihrem Anliegen empfehlen wir Ihnen unseren Praxisartikel „${recommendation.title}“:\n` +
    `${recommendation.publicUrl}`;

  return `${draftBody.trimEnd()}${block}`;
}
