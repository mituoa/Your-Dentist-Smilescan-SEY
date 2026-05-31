const STORAGE_KEY = "yd-command-pending-draft";

export type PendingCommandDraft = {
  submissionId: string;
  body: string;
  savedAt: string;
};

export function stashCommandDraftForSubmission(draft: PendingCommandDraft): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* ignore quota */
  }
}

export function consumeCommandDraftForSubmission(
  submissionId: string
): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCommandDraft;
    if (parsed.submissionId !== submissionId) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    return parsed.body;
  } catch {
    return null;
  }
}
