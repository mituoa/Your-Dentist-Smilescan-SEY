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
import { findAuthUserIdByEmail } from "@/lib/team-invitations/get-invitation-by-token";
import { isInviteTokenFormat } from "@/lib/team-invitations/invite-token-format";

export async function saveAppointmentLink(
  url: string
): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor") return { error: "Keine Berechtigung." };

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
  if (workspace.role !== "doctor") return { error: "Keine Berechtigung." };

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
  if (workspace.role !== "doctor") return { error: "Keine Berechtigung." };

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
    redirectTo: `${getAppBaseUrl()}/reset-password`,
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
    console.error("[inviteTeamMember] event=invite_insert_failed", insertError.code ?? "unknown");
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
    profile?.practice_name || ws?.name || "Unbenannte Praxis";
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
  if (workspace.role !== "doctor") return { error: "Keine Berechtigung." };

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

// Nur Mitgliedschaft entfernen — User bleibt in auth.users erhalten, da er sich
// später selbst löschen kann.
// Falls Doctor denselben User NOCHMAL einladen will und dieser nicht mehr
// existieren soll, muss er via Supabase Dashboard gelöscht werden.
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
  if (workspace.role !== "doctor") return { error: "Keine Berechtigung." };

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
  if (workspace.role !== "doctor") return { error: "Keine Berechtigung." };

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Keine Datei." };

  if (file.size > 5 * 1024 * 1024) return { error: "Max 5 MB." };

  const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (!allowed.includes(file.type)) return { error: "PNG, JPG, WEBP oder SVG." };

  const admin = createAdminClient();
  const ext =
    file.type === "image/png" ? "png"
    : file.type === "image/webp" ? "webp"
    : file.type === "image/svg+xml" ? "svg"
    : "jpg";
  const path = `${workspace.workspace_id}/logo-${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("branding-assets")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (upErr) {
    console.error("[uploadLogo]", (upErr as { code?: string }).code ?? "unknown");
    return { error: "Upload fehlgeschlagen." };
  }

  const { data } = admin.storage.from("branding-assets").getPublicUrl(path);

  const { error: linkErr } = await admin
    .from("profile_data")
    .update({ logo_url: data.publicUrl })
    .eq("workspace_id", workspace.workspace_id);
  if (linkErr) {
    console.error("[uploadLogo] profile_data update", (linkErr as { code?: string }).code ?? "unknown");
    return { error: "Das Logo wurde hochgeladen, konnte aber nicht mit Ihrem Profil verknüpft werden." };
  }

  revalidatePath("/settings");
  return { url: data.publicUrl };
}

export async function removeLogo(): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor") return { error: "Keine Berechtigung." };

  const admin = createAdminClient();
  await admin
    .from("profile_data")
    .update({ logo_url: null })
    .eq("workspace_id", workspace.workspace_id);

  revalidatePath("/settings");
  return { success: true };
}

export type AcceptInvitationMode = "accept_page" | "post_signup";

export type AcceptInvitationOptions = {
  mode?: AcceptInvitationMode;
  registeredEmail?: string;
  registeredUserId?: string | null;
};

export type AcceptInvitationResult =
  | {
      ok: true;
      success: true;
      alreadyMember?: boolean;
      workspaceId: string;
      role: "doctor" | "team";
    }
  | { ok: false; error: string; code?: string };

/**
 * Team-Einladung einlösen: Mitgliedschaft anlegen, Invite auf `accepted` setzen.
 * Idempotent, wenn der Nutzer bereits Mitglied ist. Bei parallelem Insert (23505) wird die
 * Membership verifiziert, bevor der Invite geschlossen wird.
 */
export async function acceptInvitation(
  token: string,
  options?: AcceptInvitationOptions
): Promise<AcceptInvitationResult> {
  const mode = options?.mode ?? "accept_page";
  const admin = createAdminClient();

  const tokenNorm = (token ?? "").trim();
  if (!tokenNorm || !isInviteTokenFormat(tokenNorm)) {
    return {
      ok: false,
      error: "Dieser Einladungslink ist ungültig.",
      code: "INVALID_TOKEN",
    };
  }

  const { data: invite, error: loadErr } = await admin
    .from("team_invitations")
    .select("id, workspace_id, email, role, status, expires_at")
    .eq("token", tokenNorm)
    .maybeSingle();

  if (loadErr) {
    console.error("[acceptInvitation] event=invite_load_failed");
    return {
      ok: false,
      error: "Die Einladung konnte gerade nicht geladen werden. Bitte versuchen Sie es in einem Moment erneut.",
      code: "INVITE_LOAD_FAILED",
    };
  }

  if (!invite) {
    return {
      ok: false,
      error: "Zu dieser Einladung liegen keine aktiven Daten vor.",
      code: "NOT_FOUND",
    };
  }

  if (invite.status !== "pending") {
    return {
      ok: false,
      error: "Diese Einladung ist nicht mehr aktiv.",
      code: "INVALID_STATUS",
    };
  }

  if (new Date(invite.expires_at) < new Date()) {
    return {
      ok: false,
      error: "Die Frist dieser Einladung ist abgelaufen.",
      code: "EXPIRED",
    };
  }

  let userId: string;
  const inviteEmail = String(invite.email ?? "").trim();
  if (!inviteEmail) {
    return {
      ok: false,
      error: "Die Einladung ist unvollständig. Bitte wenden Sie sich an die einladende Praxis.",
      code: "INVALID_INVITE_EMAIL",
    };
  }
  const inviteEmailLower = inviteEmail.toLowerCase();
  const normalizedRole: "doctor" | "team" = invite.role === "doctor" ? "doctor" : "team";

  if (mode === "post_signup") {
    const reg = options?.registeredEmail?.trim().toLowerCase();
    if (!reg || reg !== inviteEmailLower) {
      return {
        ok: false,
        error: "Die verwendete E-Mail-Adresse entspricht nicht der Einladung.",
        code: "EMAIL_MISMATCH",
      };
    }
    const fromSignup = options?.registeredUserId?.trim();
    if (fromSignup) {
      const { data: authLookup, error: authLookupErr } = await admin.auth.admin.getUserById(fromSignup);
      if (authLookupErr || !authLookup.user?.email) {
        return {
          ok: false,
          error: "Die Registrierung konnte nicht zugeordnet werden. Bitte melden Sie sich an und öffnen Sie den Einladungslink erneut.",
          code: "USER_LOOKUP_FAILED",
        };
      }
      if (authLookup.user.email.trim().toLowerCase() !== inviteEmailLower) {
        return {
          ok: false,
          error: "Die verwendete E-Mail-Adresse entspricht nicht der Einladung.",
          code: "EMAIL_MISMATCH",
        };
      }
      userId = fromSignup;
    } else {
      const found = await findAuthUserIdByEmail(inviteEmail);
      if (!found) {
        return {
          ok: false,
          error:
            "Bitte bestätigen Sie zuerst Ihre E-Mail; danach können Sie die Einladung über den Link erneut annehmen.",
          code: "USER_NOT_FOUND",
        };
      }
      userId = found;
    }
  } else {
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr) {
      console.error("[acceptInvitation] event=get_user_failed");
      return {
        ok: false,
        error: "Ihre Anmeldung konnte nicht bestätigt werden. Bitte melden Sie sich erneut an.",
        code: "NOT_AUTHENTICATED",
      };
    }
    if (!user?.id || !user.email) {
      return {
        ok: false,
        error: "Sie sind nicht angemeldet. Bitte melden Sie sich an und öffnen Sie den Einladungslink erneut.",
        code: "NOT_AUTHENTICATED",
      };
    }
    if (user.email.trim().toLowerCase() !== inviteEmailLower) {
      return {
        ok: false,
        error: "Die E-Mail-Adresse dieses Kontos passt nicht zu der eingeladenen Adresse.",
        code: "EMAIL_MISMATCH",
      };
    }
    userId = user.id;
  }

  const { data: thisMember } = await admin
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", invite.workspace_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (thisMember) {
    await admin
      .from("team_invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", invite.id);
    return {
      ok: true,
      success: true,
      alreadyMember: true,
      workspaceId: invite.workspace_id,
      role: normalizedRole,
    };
  }

  const { data: otherMembers } = await admin
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .neq("workspace_id", invite.workspace_id)
    .limit(1);

  if (otherMembers && otherMembers.length > 0) {
    return {
      ok: false,
      error:
        "Sie sind bereits einer anderen Praxis zugeordnet. Eine zweite gleichzeitige Mitgliedschaft ist derzeit nicht möglich.",
      code: "OTHER_WORKSPACE",
    };
  }

  const { error: memberError } = await admin.from("workspace_members").insert({
    workspace_id: invite.workspace_id,
    user_id: userId,
    role: normalizedRole,
  });

  if (memberError?.code === "23505") {
    const { data: verifyMember } = await admin
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", invite.workspace_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!verifyMember) {
      console.error("[acceptInvitation] event=duplicate_insert_no_membership");
      return {
        ok: false,
        error:
          "Der Beitritt konnte nicht abgeschlossen werden. Bitte laden Sie die Seite neu — Sie sind möglicherweise bereits zugeordnet.",
        code: "JOIN_RACE",
      };
    }
  } else if (memberError) {
    console.error("[acceptInvitation] event=member_insert_failed");
    return {
      ok: false,
      error: "Der Beitritt konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.",
      code: "MEMBER_INSERT_FAILED",
    };
  }

  await admin
    .from("team_invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return {
    ok: true,
    success: true,
    workspaceId: invite.workspace_id,
    role: normalizedRole,
  };
}
