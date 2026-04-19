"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { isValidSlug } from "@/lib/validation/slug-validation";
import { isSlugAvailable } from "@/lib/queries/settings";
import { sendTransactionalMailBestEffort } from "@/lib/mail/send-mail-best-effort";
import { buildTeamInvitationEmail } from "@/lib/mail/team-invitation-email";
import { getAppBaseUrl } from "@/lib/env";

export async function saveAppointmentLink(
  url: string
): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const trimmed = url.trim();

  if (trimmed && !/^https?:\/\//.test(trimmed)) {
    return { error: "URL muss mit http:// oder https:// beginnen." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profile_data")
    .update({ appointment_link: trimmed || null })
    .eq("workspace_id", workspace.workspace_id);

  if (error) {
    console.error("[saveAppointmentLink]", error);
    return { error: "Speichern fehlgeschlagen." };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function changeSlug(
  newSlug: string
): Promise<{ error?: string; success?: boolean; slug?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const normalized = newSlug.trim().toLowerCase();
  const validation = isValidSlug(normalized);
  if (!validation.valid) return { error: validation.error };

  const available = await isSlugAvailable(normalized, workspace.workspace_id);
  if (!available) return { error: "Dieser Slug ist bereits vergeben." };

  const admin = createAdminClient();

  const { data: current } = await admin
    .from("workspaces")
    .select("slug")
    .eq("id", workspace.workspace_id)
    .single();

  if (current?.slug && current.slug !== normalized) {
    await admin.from("workspace_slug_history").insert({
      workspace_id: workspace.workspace_id,
      old_slug: current.slug,
    });
  }

  const { error } = await admin
    .from("workspaces")
    .update({ slug: normalized })
    .eq("id", workspace.workspace_id);

  if (error) {
    console.error("[changeSlug]", error);
    return { error: "Slug konnte nicht geändert werden." };
  }

  revalidatePath("/settings");
  revalidatePath(`/doc/${normalized}`);
  if (current?.slug) revalidatePath(`/doc/${current.slug}`);

  return { success: true, slug: normalized };
}

export async function checkSlugAvailability(
  slug: string
): Promise<{ available: boolean; error?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { available: false, error: "Nicht angemeldet." };

  const normalized = slug.trim().toLowerCase();
  const validation = isValidSlug(normalized);
  if (!validation.valid) return { available: false, error: validation.error };

  const available = await isSlugAvailable(normalized, workspace.workspace_id);
  return { available };
}

export async function changeWorkspaceName(
  name: string
): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const trimmed = name.trim();
  if (!trimmed) return { error: "Name darf nicht leer sein." };
  if (trimmed.length > 80) return { error: "Maximal 80 Zeichen." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("workspaces")
    .update({ name: trimmed })
    .eq("id", workspace.workspace_id);

  if (error) return { error: "Speichern fehlgeschlagen." };

  revalidatePath("/settings");
  return { success: true };
}

export async function requestPasswordReset(): Promise<{
  error?: string;
  success?: boolean;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Nicht angemeldet." };

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${getAppBaseUrl()}/login`,
  });

  if (error) {
    console.error("[requestPasswordReset]", error);
    return { error: "E-Mail konnte nicht verschickt werden." };
  }

  return { success: true };
}

export async function inviteTeamMember(
  email: string,
  role: "team" | "doctor"
): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor") return { error: "Nur Ärzte können einladen." };

  const trimmedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { error: "Ungültige E-Mail-Adresse." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { data: existing } = await supabase
    .from("team_invitations")
    .select("id")
    .eq("workspace_id", workspace.workspace_id)
    .eq("email", trimmedEmail)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString());

  if (existing && existing.length > 0) {
    return {
      error:
        "Einladung bereits verschickt. Widerrufen Sie die bestehende, um eine neue zu senden.",
    };
  }

  const token = crypto.randomBytes(32).toString("hex");

  const { error: insertError } = await supabase.from("team_invitations").insert({
    workspace_id: workspace.workspace_id,
    email: trimmedEmail,
    role,
    invited_by: user.id,
    token,
  });

  if (insertError) {
    console.error("[inviteTeamMember]", insertError);
    return { error: "Einladung konnte nicht erstellt werden." };
  }

  const admin = createAdminClient();
  const { data: ws } = await admin
    .from("workspaces")
    .select("name")
    .eq("id", workspace.workspace_id)
    .single();
  const { data: profile } = await admin
    .from("profile_data")
    .select("display_name, practice_name")
    .eq("workspace_id", workspace.workspace_id)
    .single();

  const practiceName =
    profile?.practice_name || ws?.name || "SmileScan Praxis";
  const inviterName = profile?.display_name || null;
  const acceptUrl = `${getAppBaseUrl()}/accept-invite?token=${token}`;

  const mail = buildTeamInvitationEmail({
    practiceName,
    inviterName,
    acceptUrl,
    recipientEmail: trimmedEmail,
  });

  await sendTransactionalMailBestEffort(
    { to: trimmedEmail, subject: mail.subject, text: mail.text, html: mail.html },
    "team_invitation"
  );

  revalidatePath("/settings");
  return { success: true };
}

export async function revokeInvitation(
  invitationId: string
): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("team_invitations")
    .delete()
    .eq("id", invitationId)
    .eq("workspace_id", workspace.workspace_id);

  if (error) return { error: "Widerruf fehlgeschlagen." };

  revalidatePath("/settings");
  return { success: true };
}

export async function removeTeamMember(
  userId: string
): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor")
    return { error: "Nur Ärzte können Mitglieder entfernen." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (userId === user?.id) {
    return { error: "Sie können sich nicht selbst entfernen." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspace.workspace_id)
    .eq("user_id", userId);

  if (error) return { error: "Entfernen fehlgeschlagen." };

  revalidatePath("/settings");
  return { success: true };
}

export async function saveAccentColor(
  color: string
): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return { error: "Ungültige Farbe. Format: #RRGGBB" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profile_data")
    .update({ accent_color: color })
    .eq("workspace_id", workspace.workspace_id);

  if (error) return { error: "Speichern fehlgeschlagen." };

  revalidatePath("/settings");
  return { success: true };
}

export async function uploadLogo(
  formData: FormData
): Promise<{ error?: string; url?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Keine Datei." };

  if (file.size > 5 * 1024 * 1024) return { error: "Max 5 MB." };

  const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (!allowed.includes(file.type)) return { error: "PNG, JPG, WEBP oder SVG." };

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${workspace.workspace_id}/logo-${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("branding-assets")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (upErr) {
    console.error("[uploadLogo]", upErr);
    return { error: "Upload fehlgeschlagen." };
  }

  const { data } = admin.storage.from("branding-assets").getPublicUrl(path);

  await admin
    .from("profile_data")
    .update({ logo_url: data.publicUrl })
    .eq("workspace_id", workspace.workspace_id);

  revalidatePath("/settings");
  return { url: data.publicUrl };
}

export async function removeLogo(): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const admin = createAdminClient();
  await admin
    .from("profile_data")
    .update({ logo_url: null })
    .eq("workspace_id", workspace.workspace_id);

  revalidatePath("/settings");
  return { success: true };
}

export async function acceptInvitation(
  token: string
): Promise<{
  error?: string;
  success?: boolean;
  needsSignup?: boolean;
  email?: string;
}> {
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("team_invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .maybeSingle();

  if (!invite) {
    return { error: "Einladung nicht gefunden oder bereits angenommen." };
  }

  if (new Date(invite.expires_at) < new Date()) {
    return { error: "Einladung ist abgelaufen." };
  }

  const { data: allUsers } = await admin.auth.admin.listUsers();
  const existingUser = allUsers.users.find(
    (u) => u.email?.toLowerCase() === invite.email.toLowerCase()
  );

  if (!existingUser) {
    return { needsSignup: true, email: invite.email };
  }

  const { error: memberError } = await admin.from("workspace_members").insert({
    workspace_id: invite.workspace_id,
    user_id: existingUser.id,
    role: invite.role,
  });

  if (memberError && memberError.code !== "23505") {
    console.error("[acceptInvitation]", memberError);
    return { error: "Beitritt fehlgeschlagen." };
  }

  await admin
    .from("team_invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return { success: true };
}
