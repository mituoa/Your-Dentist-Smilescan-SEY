export const THEME_COOKIE_NAME = "smilescan-theme";

export type ThemePreference = "light" | "dark";

export function parseThemeCookie(value: string | undefined): ThemePreference {
  return value === "dark" ? "dark" : "light";
}
