"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { THEME_COOKIE_NAME, type ThemePreference } from "@/lib/theme";

export async function setThemePreference(mode: ThemePreference) {
  const store = await cookies();
  store.set(THEME_COOKIE_NAME, mode, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });
  revalidatePath("/", "layout");
}
