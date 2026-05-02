"use server";

import { createClient } from "@/lib/supabase/server";
import { getAppBaseUrl } from "@/lib/env";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { acceptInvitation } from "@/app/(protected)/settings/actions";
import { resolveAuthenticatedEntryPath } from "@/lib/post-auth-entry";

function sanitizeReturnTo(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string") return null;
  const v = value.trim();
  if (!v.startsWith("/") || v.startsWith("//")) return null;
  if (v.startsWith("/accept-invite") || v.startsWith("/login")) return v;
  return null;
}

export async function signIn(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const inviteToken = (formData.get("invite_token") as string | null)?.trim();

  const loginQuery = (errorMsg: string) => {
    const p = new URLSearchParams();
    p.set("error", errorMsg);
    if (inviteToken) p.set("invite", inviteToken);
    if (email) p.set("email", email);
    return `/login?${p.toString()}`;
  };

  if (!email || !password) {
    redirect(loginQuery("E-Mail und Passwort erforderlich."));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(loginQuery(error.message));
  }

  revalidatePath("/", "layout");
  if (inviteToken) {
    redirect(`/accept-invite?token=${encodeURIComponent(inviteToken)}`);
  }
  const nextPath = await resolveAuthenticatedEntryPath();
  redirect(nextPath);
}

/** After password reset (client): same routing as post-login when no explicit invite in URL. */
export async function getAuthenticatedEntryPath(): Promise<string> {
  return resolveAuthenticatedEntryPath();
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const workspaceName = formData.get("workspace_name") as string;
  const displayName = formData.get("display_name") as string;
  const inviteToken = (formData.get("invite_token") as string | null)?.trim();

  if (!email || !password) {
    redirect(
      `/register?error=${encodeURIComponent("E-Mail und Passwort erforderlich.")}`
    );
  }

  if (password.length < 8) {
    redirect(
      `/register?error=${encodeURIComponent("Passwort muss mindestens 8 Zeichen haben.")}`
    );
  }

  const supabase = await createClient();
  const userMetadata: Record<string, string | null> = {
    display_name: displayName || email,
    invite_token: inviteToken || null,
  };
  if (!inviteToken) {
    userMetadata.workspace_name = workspaceName || "Meine Praxis";
  }

  const { data: signData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userMetadata,
    },
  });

  if (error) {
    const inviteQ = inviteToken
      ? `&invite=${encodeURIComponent(inviteToken)}`
      : "";
    redirect(
      `/register?error=${encodeURIComponent(error.message)}${inviteQ}`
    );
  }

  if (inviteToken) {
    const inviteResult = await acceptInvitation(inviteToken, {
      mode: "post_signup",
      registeredEmail: email,
      registeredUserId: signData.user?.id ?? null,
    });
    if (!inviteResult.ok) {
      redirect(
        `/dashboard?invite_notice=${encodeURIComponent(inviteResult.error)}`
      );
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut(formData?: FormData) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  const raw = formData?.get("return_to");
  const to = sanitizeReturnTo(typeof raw === "string" ? raw : null);
  redirect(to ?? "/login");
}

export async function requestPasswordResetFromLogin(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase() || "";
  const inviteToken = (formData.get("invite_token") as string | null)?.trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const params = new URLSearchParams();
    params.set("error", "Bitte geben Sie eine gültige E-Mail-Adresse ein.");
    if (inviteToken) params.set("invite", inviteToken);
    if (email) params.set("email", email);
    redirect(
      `/forgot-password?${params.toString()}`
    );
  }

  const supabase = await createClient();
  const resetUrl = inviteToken
    ? `${getAppBaseUrl()}/reset-password?invite=${encodeURIComponent(inviteToken)}`
    : `${getAppBaseUrl()}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetUrl,
  });

  if (error) {
    console.error("[requestPasswordResetFromLogin]", error);
  }

  const params = new URLSearchParams();
  params.set("sent", "1");
  if (inviteToken) params.set("invite", inviteToken);
  params.set("email", email);
  redirect(`/forgot-password?${params.toString()}`);
}
