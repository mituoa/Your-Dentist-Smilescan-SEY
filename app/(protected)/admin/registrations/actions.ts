"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth-helpers";
import { getAdminEmailsAllowlist } from "@/lib/env";

function requireAdminByEmail(userEmail: string | null | undefined) {
  const allow = getAdminEmailsAllowlist();
  if (allow.length === 0) return;
  const email = (userEmail || "").trim().toLowerCase();
  if (!email || !allow.includes(email)) {
    throw new Error("Not authorized");
  }
}

export async function approveWorkspace(workspaceId: string) {
  const user = await requireUser();
  requireAdminByEmail(user.email);

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
  requireAdminByEmail(user.email);

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

