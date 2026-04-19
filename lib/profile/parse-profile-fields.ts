import type { ServiceStructured } from "@/lib/types/profile-editor-data";

export function parseSpecializations(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string");
}

export function parseServicesStructured(raw: unknown): ServiceStructured[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is Record<string, unknown> =>
        item !== null && typeof item === "object"
    )
    .map((item) => ({
      id: String(item.id ?? ""),
      name: String(item.name ?? ""),
      note: typeof item.note === "string" ? item.note : "",
      custom: Boolean(item.custom),
    }))
    .filter((s) => s.id && s.name);
}
