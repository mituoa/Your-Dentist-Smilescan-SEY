import "server-only";

import { timingSafeEqual } from "crypto";

import { createAdminClient } from "@/lib/supabase/admin";

/** Demo / Chef-Termin: ein festes Login aus Env, ohne OAuth zu konfigurieren. */
export function isEmergencyPasswordLoginConfigured(): boolean {
  const en = (process.env.EMERGENCY_PASSWORD_LOGIN_ENABLED || "").trim().toLowerCase();
  return (
    (en === "true" || en === "1") &&
    Boolean((process.env.EMERGENCY_LOGIN_EMAIL || "").trim()) &&
    Boolean((process.env.EMERGENCY_LOGIN_PASSWORD || "").trim())
  );
}

export function matchesEmergencyLogin(email: string, password: string): boolean {
  if (!isEmergencyPasswordLoginConfigured()) return false;
  const cfgEmail = (process.env.EMERGENCY_LOGIN_EMAIL || "").trim().toLowerCase();
  const cfgPass = (process.env.EMERGENCY_LOGIN_PASSWORD || "").trim();
  if (email.trim().toLowerCase() !== cfgEmail) return false;
  try {
    const a = Buffer.from(password, "utf8");
    const b = Buffer.from(cfgPass, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Legt den User an oder setzt Passwort + email_confirm per Service Role,
 * damit anschließend signInWithPassword funktioniert.
 */
export async function syncEmergencyUserToSupabase(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const admin = createAdminClient();
  const normalized = email.trim().toLowerCase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Admin API-Typen je nach SDK-Version leicht unterschiedlich
  const authAdmin = (admin.auth as any).admin;

  const { data: created, error: createErr } = await authAdmin.createUser({
    email: normalized,
    password,
    email_confirm: true,
  });

  if (!createErr && created?.user) {
    return { ok: true };
  }

  const msg = String(createErr?.message || "");
  const duplicate =
    msg.toLowerCase().includes("already") ||
    msg.toLowerCase().includes("registered") ||
    msg.toLowerCase().includes("exists") ||
    (createErr as { status?: number } | null | undefined)?.status === 422;

  if (!duplicate) {
    return {
      ok: false,
      message: msg || "Notfall-Login: Benutzer konnte nicht angelegt werden.",
    };
  }

  const { data: listed, error: listErr } = await authAdmin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listErr) {
    return { ok: false, message: "Notfall-Login: Nutzerliste nicht lesbar." };
  }

  const user = listed?.users?.find(
    (u: { email?: string }) => (u.email || "").toLowerCase() === normalized
  );
  if (!user?.id) {
    return {
      ok: false,
      message: "Notfall-Login: Diese E-Mail existiert nicht in Supabase Auth.",
    };
  }

  const { error: upErr } = await authAdmin.updateUserById(user.id, {
    password,
    email_confirm: true,
  });

  if (upErr) {
    return {
      ok: false,
      message: String(upErr.message || "Passwort konnte nicht gesetzt werden."),
    };
  }

  return { ok: true };
}
