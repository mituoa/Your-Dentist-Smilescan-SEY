"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleTaskDone(taskId: string, done: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet" };
  }

  const update = done
    ? { done_at: new Date().toISOString(), done_by: user.id }
    : { done_at: null, done_by: null };

  const { error } = await supabase
    .from("tasks")
    .update(update)
    .eq("id", taskId);

  if (error) {
    console.error("[tasks] toggle failed:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/my-tasks");
  return { success: true };
}
