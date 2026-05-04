import { redirect } from "next/navigation";

/** Figma-Pfad `/admin` → Einstellungen. */
export default function AdminSettingsAliasPage() {
  redirect("/settings");
}
