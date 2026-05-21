import type { CSSProperties } from "react";

/**
 * @deprecated Legacy warm-canvas shell — neue Auth-Seiten nutzen `YdAuthEnvironment` + `app/yd-auth.css`.
 * Bestehende Imports bleiben für schrittweise Migration erhalten.
 */
export const AUTH_SCREEN_CANVAS_CLASS =
  "relative min-h-[100dvh] w-full overflow-x-hidden bg-[#F8F7F3]" as const;

export const authScreenCanvasStyle: CSSProperties = {
  backgroundImage:
    "radial-gradient(ellipse at center, rgba(255,255,255,0.6) 0%, rgba(248,247,243,0) 60%, rgba(240,240,240,0.3) 100%)",
};

/** Identisch zur Login-Kartenhülle (`login-page-client`). */
export const AUTH_CARD_SHELL_CLASS =
  "max-md:border-gray-200/55 max-md:p-4 rounded-2xl border border-gray-200/70 bg-white p-5 lg:rounded-[22px] lg:border-gray-100/80 lg:p-8" as const;

export const authCardShellShadowStyle: CSSProperties = {
  boxShadow:
    "0 1px 2px rgba(0,0,0,0.02), 0 4px 8px rgba(0,0,0,0.02), 0 16px 24px rgba(0,0,0,0.03)",
};

/** Schmale Auth-Spalte: Mobile wirkt wie fokussierte App-Maske, nicht „volle Marketingseite“. */
export const AUTH_NARROW_COLUMN_CLASS =
  "mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:px-6 sm:pb-10 sm:pt-6" as const;

/** Logo-Zeile über der Karte — gleiches rhythmisches Gewicht wie Login `mb-12` auf Mobile. */
export const AUTH_LOGO_BLOCK_CLASS = "mb-10 flex shrink-0 justify-center sm:mb-11" as const;
