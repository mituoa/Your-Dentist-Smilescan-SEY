import type { AppLocale } from "@/lib/locale";

import { de } from "./de";
import { en, type Messages } from "./en";

const CATALOG: Record<AppLocale, Messages> = {
  en,
  de,
};

export type { Messages };

export function getMessages(locale: AppLocale): Messages {
  return CATALOG[locale] ?? en;
}
