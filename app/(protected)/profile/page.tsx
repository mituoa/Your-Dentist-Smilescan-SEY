import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, FileText, PencilLine } from "lucide-react";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import {
  clinicalWorkspaceFrame,
  clinicalWorkspaceVerticalPadding,
} from "@/lib/clinical-ui";
import { getAppBaseUrl } from "@/lib/env";

/** Defense in depth: nur erlaubte `doc`-Pfadsegmente (kein `/`, `..`, Leerzeichen). DB liefert i. d. R. `[a-z0-9-]+`. */
function isSafeDocPathSlug(slug: string): boolean {
  const s = slug.trim();
  if (s.length === 0 || s.length > 128) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
}

function publicProfileUrlLabel(baseUrl: string, path: string): string {
  try {
    return `${new URL(baseUrl).host}${path}`;
  } catch {
    return path;
  }
}

/**
 * **`/profile` — Punkt 1 (Zweck):** Ruhige **Verwaltung der Praxisangaben** und des **verknüpften, freigegebenen
 * Patientenbereichs** unter `/doc/{slug}` — **kein** Social-/Creator-Profil, **kein** generisches Account-Center,
 * **keine** Marketing-„Präsenz“-Plattform. Arzt-only (`redirect` zu `/my-tasks` für Team); zwei sachliche
 * Einstiege: **Editor** (Inhalt) und optional **Patientenansicht** (nur wenn `workspaces.slug` gesetzt).
 *
 * **Semantik:** „Profil“ hier = **fachliche Praxisdarstellung + Dokumentfreigabe** für strukturierte Patienteneinsendung,
 * nicht öffentliche Persönlichkeits- oder Follower-Funktion.
 *
 * **Punkt 2 (Status — final):** **Server-first** nach Workspace/Slug (`loading.tsx` während Lesung); **kein**
 * Client-„Live“-Status. Karten: **stabile Mindesthöhe**, gleiche Rasterzeile (`items-stretch`), Slug vorhanden =
 * Link-Karte, fehlend = **ruhige** gestrichelte Fläche (kein toter Link, kein Flackern). Team → `redirect`
 * (`/my-tasks`) vor Datenabfrage — klarer, nicht zweideutiger Zustand.
 *
 * **Punkt 3 (Supabase/Auth):** **Serverseitig** `getCurrentWorkspace` → fehlend → Login; **Rolle** `doctor` sonst
 * `redirect("/my-tasks")` (kein UI-only-Schutz). Slug nur per `workspaces.id = workspace.workspace_id` (RLS:
 * `current_workspace_id()` — mit Migration 030 deckungsgleich zur ältesten Mitgliedschaft); **kein** breiter Slug-Scan,
 * **keine** fremden Workspaces. Öffentlicher Link nur bei **validiertem** Slug-Segment (`isSafeDocPathSlug`) — bei
 * DB-Anomalie **fail-closed** (kein Link, kein Leak in URL). Lesefehler: **serverseitig** nur Postgres-/Supabase-`code`
 * loggen, **ohne** Slug/PII. `dynamic = "force-dynamic"` mildert Slug-Drift nach Editor-`revalidatePath` vs. CDN-Cache.
 */
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    redirect("/login?error=workspace_missing");
  }

  if (workspace.role !== "doctor") {
    redirect("/my-tasks");
  }

  const supabase = await createClient();
  const { data: ws, error: wsError } = await supabase
    .from("workspaces")
    .select("slug")
    .eq("id", workspace.workspace_id)
    .maybeSingle();

  if (wsError) {
    console.error(
      "[profile/page] workspaces slug read",
      (wsError as { code?: string }).code ?? "unknown",
    );
  }

  const rawSlug = typeof ws?.slug === "string" ? ws.slug.trim() : "";
  const publicUrl =
    rawSlug.length > 0 && isSafeDocPathSlug(rawSlug) ? `/doc/${rawSlug}` : null;
  const publicUrlLabel = publicUrl ? publicProfileUrlLabel(getAppBaseUrl(), publicUrl) : null;

  return (
    <div className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div>
          <p className="mb-3 text-xs font-semibold tracking-normal text-text-tertiary">
            Praxis & Dokumentation
          </p>
          <h1 className="mb-4 font-serif text-4xl font-light tracking-tight text-text-primary md:text-5xl">
            Praxisprofil & Patientendokumentation
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-text-secondary md:text-base">
            Hier bearbeiten Sie die Angaben zu Ihrer Praxis. Der verknüpfte Bereich unter{" "}
            <span className="whitespace-nowrap font-medium text-text-primary">/doc/…</span> dient Patientinnen
            ausschließlich der strukturierten Einsendung von Unterlagen — nicht einer persönlichen oder
            werblichen Online-Präsenz. Inhalte aus dem Editor erscheinen dort nach dem Speichern.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch">
          <Link
            href="/profile/editor"
            className="flex min-h-[200px] min-w-0 flex-col rounded-lg border border-border bg-surface-card p-6 transition-colors hover:border-brand/40 md:min-h-[220px]"
          >
            <PencilLine className="mb-3 h-5 w-5 text-brand" strokeWidth={1.75} aria-hidden />
            <h2 className="mb-1 font-serif text-xl text-text-primary">Praxisangaben bearbeiten</h2>
            <p className="text-xs leading-snug text-text-tertiary">
              Stammdaten, Leistungsschwerpunkte und Praxisangaben — zentral im Editor.
            </p>
          </Link>

          {publicUrl ? (
            <Link
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Freigegebene Patientenansicht in neuem Tab öffnen"
              className="flex min-h-[200px] min-w-0 flex-col rounded-lg border border-border bg-surface-card p-6 transition-colors hover:border-brand/40 md:min-h-[220px]"
            >
              <ExternalLink className="mb-3 h-5 w-5 text-brand" strokeWidth={1.75} aria-hidden />
              <h2 className="mb-1 font-serif text-xl text-text-primary">Freigegebene Patientenansicht</h2>
              <p className="break-words text-xs leading-snug text-text-tertiary">{publicUrlLabel}</p>
              <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                Nur für die dokumentierte Einsendung durch Patientinnen — kein allgemeines Webprofil.
              </p>
            </Link>
          ) : (
            <div className="flex min-h-[200px] min-w-0 flex-col rounded-lg border border-dashed border-border bg-surface-card/60 p-6 md:min-h-[220px]">
              <FileText className="mb-3 h-5 w-5 text-text-tertiary" strokeWidth={1.75} aria-hidden />
              <h2 className="mb-1 font-serif text-xl text-text-primary">Patientenansicht</h2>
              <p className="text-xs leading-relaxed text-text-secondary">
                Sobald für Ihre Praxis ein kurzer Link (Slug) hinterlegt ist, erscheint hier der Zugang zur
                strukturierten Dokumentation für Patientinnen.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
