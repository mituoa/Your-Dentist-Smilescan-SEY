import "server-only";

export function isCommandAiGptEnabled(): boolean {
  const key = process.env.OPENAI_API_KEY?.trim();
  return Boolean(key && key.length > 10);
}

export function commandAiGptModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export function commandAiVisionModel(): string {
  return (
    process.env.OPENAI_VISION_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    "gpt-4o-mini"
  );
}

export function commandAiUsesVision(): boolean {
  const model = commandAiVisionModel().toLowerCase();
  return model.includes("gpt-4o") || model.includes("gpt-4.1") || model.includes("vision");
}
