export const LOCALE_COOKIE_NAME = "yd-locale";

export const APP_LOCALES = ["en", "de"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "de";

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return value === "en" || value === "de";
}

export function parseLocaleCookie(value: string | undefined): AppLocale {
  return isAppLocale(value) ? value : DEFAULT_LOCALE;
}

export function localeDisplayName(locale: AppLocale, inLocale?: AppLocale): string {
  const lang = inLocale ?? locale;
  if (locale === "en") return lang === "de" ? "Englisch" : "English";
  return lang === "de" ? "Deutsch" : "German";
}
