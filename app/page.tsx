import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { resolveAuthenticatedEntryPath } from "@/lib/post-auth-entry";

/** Root: Login zuerst; eingeloggt → gleiche Ziel-Logik wie nach OAuth/Login. */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(await resolveAuthenticatedEntryPath());
  }

  redirect("/login");
}
