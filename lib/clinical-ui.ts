/**
 * Tracker (Figma) — gemeinsame Workspace-Chrome-Werte für geschützte Routen.
 * Nur Klassen / Konstanten; keine Business-Logik.
 */

/** Haupt-Canvas wie Tracker-Inbox (`#F7F9FC`). */
export const CLINICAL_CANVAS_HEX = "#F7F9FC" as const;

/**
 * Horizontaler Rahmen: gleiche Außenränder wie Topbar (`md:px-10`), max. Inhalt 1600px
 * (Relay / breite Arbeitsflächen).
 */
export const clinicalWorkspaceFrame =
  "mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-10" as const;

/** Vertikaler Rhythmus für Seiten mit voller Arbeitsfläche (nicht Modal). */
export const clinicalWorkspaceVerticalPadding = "py-6 md:py-8" as const;

/** Schmale Spalte für Formulare (Settings, partielle Editor-Spalten). */
export const clinicalFormColumnMax = "max-w-[640px]" as const;

/** Command-Sheet Desktop: eine feste Logikbreite über alle Routen. */
export const clinicalCommandSheetWidthMd =
  "md:w-[min(440px,calc(100vw-2rem))]" as const;
