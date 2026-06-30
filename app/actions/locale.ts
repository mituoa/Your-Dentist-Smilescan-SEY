"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { LOCALE_COOKIE_NAME, type AppLocale, isAppLocale } from "@/lib/locale";

export async function setLocalePreference(locale: AppLocale) {
  if (!isAppLocale(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });
  revalidatePath("/", "layout");
}
