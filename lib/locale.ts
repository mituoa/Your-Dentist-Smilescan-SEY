export const LOCALE_COOKIE_NAME = "yd-locale";

export const LOCALE_CATALOG = [
  { code: "de", nativeName: "Deutsch", regionLabel: "Deutschland", direction: "ltr" as const },
  { code: "en", nativeName: "English", regionLabel: "International", direction: "ltr" as const },
  { code: "tr", nativeName: "Türkçe", regionLabel: "Türkiye", direction: "ltr" as const },
  { code: "pl", nativeName: "Polski", regionLabel: "Polska", direction: "ltr" as const },
  { code: "ru", nativeName: "Русский", regionLabel: "Россия", direction: "ltr" as const },
  { code: "ar", nativeName: "العربية", regionLabel: "العالم العربي", direction: "rtl" as const },
  { code: "fr", nativeName: "Français", regionLabel: "France", direction: "ltr" as const },
  { code: "es", nativeName: "Español", regionLabel: "España / Latinoamérica", direction: "ltr" as const },
  { code: "it", nativeName: "Italiano", regionLabel: "Italia", direction: "ltr" as const },
] as const;

export type AppLocale = (typeof LOCALE_CATALOG)[number]["code"];

export const APP_LOCALES: readonly AppLocale[] = LOCALE_CATALOG.map((item) => item.code);

export const DEFAULT_LOCALE: AppLocale = "de";

const LOCALE_SET = new Set<string>(APP_LOCALES);

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return typeof value === "string" && LOCALE_SET.has(value);
}

export function parseLocaleCookie(value: string | undefined): AppLocale {
  return isAppLocale(value) ? value : DEFAULT_LOCALE;
}

export function getLocaleMeta(locale: AppLocale) {
  return LOCALE_CATALOG.find((item) => item.code === locale) ?? LOCALE_CATALOG[0];
}

/** Vollständig übersetzte UI-Sprachen; andere nutzen Englisch als Oberflächen-Fallback. */
export const FULL_UI_LOCALES = new Set<AppLocale>(["de", "en"]);

export function localeUsesEnglishUiFallback(locale: AppLocale): boolean {
  return !FULL_UI_LOCALES.has(locale);
}

export function localeDisplayName(locale: AppLocale, inLocale?: AppLocale): string {
  return getLocaleMeta(locale).nativeName;
}
