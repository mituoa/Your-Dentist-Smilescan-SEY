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

function isAllowedAdminLicenseStoragePath(path: string): boolean {
  const t = path.trim();
  if (t.length > 512 || t.includes("..") || /%2e%2e/i.test(t)) return false;
  const parts = t.split("/").filter(Boolean);
  if (parts.length !== 4) return false;
  if (parts[0] !== "registrations" || parts[1] !== "licenses") return false;
  if (parts[2] !== "pending" && parts[2] !== "final") return false;
  return /^[a-zA-Z0-9._-]+$/.test(parts[3]!);
}

export async function openSignedLicenseUrl(storagePath: string) {
  const user = await requireUser();
  requirePlatformAdmin(user);

  const path = storagePath.trim();
  if (!isAllowedAdminLicenseStoragePath(path)) {
    console.error("[openSignedLicenseUrl] rejected path shape");
    throw new Error("Invalid storage path");
  }

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

