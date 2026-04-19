"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { acceptInvitation } from "@/app/(protected)/settings/actions";

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
  redirect("/dashboard");
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
  const { data: signData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        workspace_name: workspaceName || "Meine Praxis",
        display_name: displayName || email,
        invite_token: inviteToken || null,
      },
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
