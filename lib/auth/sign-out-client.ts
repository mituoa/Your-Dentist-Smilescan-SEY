"use client";

import { AUTH_SIGN_OUT_PATH } from "@/lib/auth/sign-out-constants";

export { AUTH_SIGN_OUT_PATH };

/**
 * Serverseitige Session beenden und per vollständiger Navigation zur Login-Seite (oder return Location).
 */
export async function signOutWithFullPageRedirect(): Promise<void> {
  const res = await fetch(AUTH_SIGN_OUT_PATH, {
    method: "POST",
    credentials: "same-origin",
    redirect: "manual",
  });
  const loc = res.headers.get("Location");
  if (loc) {
    window.location.replace(loc);
    return;
  }
  window.location.replace("/login?signed_out=1");
}
