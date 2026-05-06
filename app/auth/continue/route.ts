import { redirect } from "next/navigation";

import { resolveAuthenticatedEntryPath } from "@/lib/post-auth-entry";

/**
 * Nach OAuth (Google): Session ist gesetzt — gleiche Ziel-Logik wie nach Passwort-Login.
 */
export async function GET() {
  const path = await resolveAuthenticatedEntryPath();
  redirect(path);
}
