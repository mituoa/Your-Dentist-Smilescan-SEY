import { redirect } from "next/navigation";

/**
 * Root: immer zuerst Login. Eingeloggt → Weiterleitung übernimmt `app/(auth)/login/page.tsx`
 * (ohne extra Supabase/Admin-Logik hier — weniger Fehlerquellen auf Netlify).
 */
export default function HomePage() {
  redirect("/login");
}
