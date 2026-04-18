"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect(
      `/login?error=${encodeURIComponent("E-Mail und Passwort erforderlich.")}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const workspaceName = formData.get("workspace_name") as string;
  const displayName = formData.get("display_name") as string;

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
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        workspace_name: workspaceName || "Meine Praxis",
        display_name: displayName || email,
      },
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  // Falls Email Confirmation eingeschaltet ist, landet User jetzt auf
  // einer "Check your email"-Seite. Sonst direkt ins Dashboard.
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
