/**
 * Shared surface treatment for the Clinical-Glass pilot (Inbox + My-Tasks).
 * Uses semantic tokens so Mond/Sonne stay consistent.
 */
export const pilotGlassPanel =
  "rounded-xl border border-border/85 bg-surface-card/92 shadow-sm backdrop-blur-sm dark:border-border/55 dark:bg-surface-card/90 dark:shadow-[0_1px_0_rgb(255_255_255/0.04)] dark:backdrop-blur-md";

export const pilotGlassInset =
  "rounded-xl border border-border/70 bg-surface-page/80 backdrop-blur-sm dark:border-border/50 dark:bg-surface-sunken/50 dark:backdrop-blur-sm";

/** Compact meta chips (Inbox detail header). */
export const pilotGlassChip =
  "rounded-md border border-border/75 bg-surface-card/88 px-2.5 py-1 backdrop-blur-sm dark:border-border/50 dark:bg-surface-card/72 dark:backdrop-blur-sm";

/**
 * Clinical core shell (Figma: Atlas / Tracker / Relay) — medical blue family, cool borders.
 * Prefer this over `pilotGlassPanel` for Relay, task board, and shared clinical workspace.
 */
export const clinicalCorePanel =
  "rounded-xl border border-[rgba(15,23,42,0.06)] bg-white/[0.97] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_32px_-16px_rgba(43,111,232,0.07)] backdrop-blur-sm " +
  "dark:border-slate-700/55 dark:bg-surface-card/95 dark:shadow-[0_1px_0_rgb(255_255_255/0.04)]";

/** Cool neutral dividers (no warm paper line). */
export const clinicalDividerBorder = "border-[rgba(15,23,42,0.06)]";
