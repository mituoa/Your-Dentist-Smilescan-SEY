"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminAllowlistUser, requireUser } from "@/lib/auth-helpers";
import { getAdminEmailsAllowlist, getAdminGithubUsernames } from "@/lib/env";

function requirePlatformAdmin(
  user: NonNullable<Awaited<ReturnType<typeof requireUser>>>
) {
  const hasEmailAllow = getAdminEmailsAllowlist().length > 0;
  const hasGhAllow = getAdminGithubUsernames().length > 0;
  if (!hasEmailAllow && !hasGhAllow) return;
  if (!isAdminAllowlistUser(user)) throw new Error("Not authorized");
}

export async function approveWorkspace(workspaceId: string) {
  const user = await requireUser();
  requirePlatformAdmin(user);

  const admin = createAdminClient();
  const { error } = await admin
    .from("workspaces")
    .update({ approved_at: new Date().toISOString(), approved_by: user.id })
    .eq("id", workspaceId);

  if (error) {
    console.error("[approveWorkspace]", error);
    throw new Error("Approve failed");
  }

  revalidatePath("/admin/registrations");
}

export async function openSignedLicenseUrl(storagePath: string) {
  const user = await requireUser();
  requirePlatformAdmin(user);

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("submission-photos")
    .createSignedUrl(storagePath, 10 * 60);

  if (error || !data?.signedUrl) {
    console.error("[openSignedLicenseUrl]", error);
    throw new Error("Signed URL failed");
  }

  redirect(data.signedUrl);
}

