/** Session flag + URL hook for post-login workspace reveal. */
export const YD_ENTER_QUERY = "yd_enter";
export const YD_AWAKEN_SESSION_KEY = "yd-workspace-awaken";

/** Stagger between dashboard cards (ms). */
export const YD_STAGGER_MS = [0, 60, 120, 180, 240, 300, 360, 420] as const;

export function pathWithWorkspaceEnter(path: string): string {
  if (path.includes(YD_ENTER_QUERY)) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${YD_ENTER_QUERY}=1`;
}
