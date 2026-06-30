import type { AppLocale } from "@/lib/locale";
import { FULL_UI_LOCALES } from "@/lib/locale";

import { de } from "./de";
import { en, type Messages } from "./en";

const CATALOG: Partial<Record<AppLocale, Messages>> = {
  en,
  de,
};

export type { Messages };

export function getMessages(locale: AppLocale): Messages {
  if (FULL_UI_LOCALES.has(locale)) {
    return CATALOG[locale] ?? en;
  }
  return en;
}
