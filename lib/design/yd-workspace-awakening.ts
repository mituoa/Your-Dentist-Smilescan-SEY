/** Session flag + URL hook for post-login workspace reveal. */
export const YD_ENTER_QUERY = "yd_enter";
export const YD_AWAKEN_SESSION_KEY = "yd-workspace-awaken";

/** Stagger between content layers (ms) — calm OS pacing */
export const YD_STAGGER_MS = [0, 80, 160, 240, 320, 400, 480, 560] as const;

/** Total awakening window before interactive settle */
export const YD_AWAKEN_DURATION_MS = 4400;

export function pathWithWorkspaceEnter(path: string): string {
  if (path.includes(YD_ENTER_QUERY)) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${YD_ENTER_QUERY}=1`;
}
