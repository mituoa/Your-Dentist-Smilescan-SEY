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
import { isSafeDocPathSlug } from "@/lib/slug";

function publicProfileUrlLabel(baseUrl: string, path: string): string {
  try {
    return `${new URL(baseUrl).host}${path}`;
  } catch {
    return path;
  }
}

/**
 * **`/profile` — Routen-QA (Punkte 1–10): final** (MVP P2).
 *
 * **`/profile` — Punkt 1 (Zweck) — final:** Ruhige **Verwaltung der Praxisangaben** und des **verknüpften, freigegebenen
 * Patientenbereichs** unter `/doc/{slug}` — **kein** Social-/Creator-Profil, **kein** generisches Account-Center,
 * **keine** Marketing-„Präsenz“-Plattform. Arzt-only (`redirect` zu `/my-tasks` für Team); zwei sachliche
 * Einstiege: **Editor** (Inhalt) und optional **Patientenbereich** (nur wenn `workspaces.slug` gesetzt und validiert).
 *
 * **Semantik — final:** „Profil“ hier = **fachliche Praxisdarstellung + Dokumentfreigabe** für strukturierte Patienteneinsendung,
 * nicht öffentliche Persönlichkeits- oder Follower-Funktion.
 *
 * **Punkt 2 (Status — final):** **Server-first** nach Workspace/Slug (`loading.tsx` während Lesung); **kein**
 * Client-„Live“-Status. Karten: **stabile Mindesthöhe**, gleiche Rasterzeile (`items-stretch`), Slug vorhanden =
 * Link-Karte, fehlend = **ruhige** gestrichelte Fläche (kein toter Link, kein Flackern). Team → `redirect`
 * (`/my-tasks`) vor Datenabfrage — klarer, nicht zweideutiger Zustand.
 *
 * **Punkt 3 (Supabase/Auth) — final:** `(protected)`-Layout verlangt bereits `requireApprovedWorkspace`; diese Seite erneuert
 * den Kontext per `getCurrentWorkspace` (kein Client-Trust). Fehlend → `login?error=workspace_missing`; **Rolle**
 * `doctor` sonst `redirect("/my-tasks")` — **kein** UI-only-Schutz. Slug nur `workspaces.id = workspace.workspace_id`
 * (RLS `current_workspace_id()`, Migration 030 = älteste Mitgliedschaft); **kein** Slug-Scan, **keine** fremden
 * Workspaces. Öffentlicher Link nur bei validiertem Segment (`isSafeDocPathSlug` in `lib/slug.ts`) — fail-closed.
 * Lesefehler: **serverseitig** nur Postgres-/Supabase-Fehlercode loggen, **ohne** Slug/PII. Profil-**Server-Actions**
 * (`profile/editor/actions.ts`) spiegeln dieselbe Rollenlogik und gleiche Slug-Validierung bei `revalidatePath`.
 * `dynamic = "force-dynamic"` mildert Slug-Drift nach Editor-`revalidatePath` vs. CDN-Cache.
 *
 * **Punkt 4 (Aktionen) — final:** Zwei gleich gewichtete **Karten-Links** (kein Hero-CTA, kein Dashboard-„Tile“-Ton):
 * **Editor** (Praxisangaben) und optional **Patientenbereich** nur bei gültiger Kurzadresse — **kein** toter
 * „Ansehen“-Link, **keine** Vorschau- oder Live-Publish-Vortäuschung. Copy **fachlich** (Dokumentation, Einsendung),
 * **kein** Slug- oder URL-Pfad-Jargon in der Einleitung; technische Adresse nur **klein** unter der Patientenkarte.
 * Neuer Tab nur für den **operativen** Weitergabe-Link; Hover **dezent** (`border-brand/25`). **Nicht:** Site-Builder-,
 * CMS-Hub- oder Creator-„Präsenz“-Semantik.
 *
 * **Punkt 5 (Tot/Fake) — final:** **Ehrlicher Datenmoment:** keine Schein-Vorschau, kein Publish-/Go-Live-Ticker,
 * **kein** „Website ist live“. Rechts **entweder** der funktionale Patientenlink (nur bei validiertem Slug) **oder**
 * eine ruhige Fläche mit klarer Erklärung — **keine** halbtote Link-Karte. Bei **Slug-Lesefehler** kein Vortäuschen
 * eines leeren Setup-Zustands: kurzer Hinweis zum erneuten Laden (**ohne** technische Fehlertexte). **Keine**
 * künstliche Aktivität, **keine** CMS-Statistik. H1 **Praxisangaben**-Nähe statt Social-„Profil“-Inszenierung.
 *
 * **Punkt 6 (Loading) — final:** `loading.tsx` — **statisch**, **kein** Puls/Shimmer; gleiche **Außenrahmen** und
 * Karten-**Mindesthöhen** wie die Ziel-UI, Platzhalter über **Border-Opazität** (kein Slate-„Startup“-Skeleton).
 * Team: Redirect **vor** diesem Segment — **kein** Profil-Loading für Team.
 *
 * **Punkt 7 (Empty) — final:** Ohne Slug: **gestrichelte** Karte, **kein** Link, **kein** „Ansehen“, **kein**
 * Onboarding-/„Los geht's“-Motivation, **kein** Publish-Slang. Copy **kurz** und **sachlich** (Kurzadresse im Editor +
 * Speichern); bei **Lesefehler** eigener Hinweis — **kein** Vermischen mit „fehlendem Slug“. Team: **kein** Empty
 * (Redirect). `role="region"` bzw. `status` für Screenreader-Kohärenz.
 *
 * **Punkt 8 (Error) — final:** **Kein** Banner, **kein** Toast, **kein** Alarm-Rot; die einzige sichtbare **Fehlerlage**
 * ist die gestrichelte Patientenkarte mit **kurzer**, **ruhiger** Meldung bei Slug-**Lesefehler** — **keine**
 * Supabase-/Postgres-Rohcodes, **keine** Workspace-IDs oder Slug-Strings in der UI. **Redirects** (`login` bei
 * fehlendem Workspace, `my-tasks` bei Team) **ohne** Zwischen-Drama auf dieser Route. Fehler beim **Speichern** im
 * Editor bleiben **im Editor** (nicht diese Übersicht). Logging nur **serverseitig** mit Fehlercode (s. Punkt 3).
 *
 * **Punkt 9 (Mobile) — final:** Innencontainer **`min-w-0` + `overflow-x-hidden`** gegen lange Adress-/Host-Zeilen;
 * Karten-Links **`touch-manipulation`**, **`min-w-0`**, URL-Zeile **`break-words`** + **`[overflow-wrap:anywhere]`**.
 * Raster auf schmalen Viewports **etwas luftiger** (`gap-5`, ab `md` `gap-4`); Karten **`p-5 sm:p-6`**. **Kein**
 * paralleles Safe-Area-Inventar — `main` im `(protected)`-Layout (`pb` + `env(safe-area-inset-bottom)`).
 *
 * **Punkt 10 (Security) — final:** **Server-only:** Slug ausschließlich aus Supabase nach **Doctor-Gate** und
 * `eq("id", workspace.workspace_id)`; **RLS** als zweite Linie (`current_workspace_id()`, Migration 030). **Kein**
 * UI-only-Schutz. **Public href** nur bei `isSafeDocPathSlug`; Patienten-Tab: **noopener**, **noreferrer**,
 * **referrerPolicy no-referrer** (kein Referer-Leak aus dem geschützten Kontext). **force-dynamic** gegen Slug- und
 * Cache-Drift. Client **keine** Rohfehler; Logs nur Fehlercode (s. Punkt 3). **Kein** Slug-Scan; Team-Redirect **vor**
 * Datenabfrage. Server-Actions im Editor: gleiche Rollen- und Slug-Validierung bei `revalidatePath`.
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
  const patientLinkLoadFailed = Boolean(wsError);

  return (
    <div className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
      <div className="mx-auto w-full min-w-0 max-w-4xl space-y-8 overflow-x-hidden">
        <div className="min-w-0">
          <p className="mb-3 text-xs font-semibold tracking-normal text-text-tertiary">
            Praxis & Dokumentation
          </p>
          <h1 className="mb-4 text-balance font-serif text-4xl font-light tracking-tight text-text-primary md:text-5xl">
            Praxisangaben und Patientendokumentation
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-text-secondary md:text-base">
            Hier bearbeiten Sie die Angaben zu Ihrer Praxis. Der mit dem Editor verknüpfte Bereich für Patientinnen
            dient ausschließlich der strukturierten Einsendung von Unterlagen — nicht einer persönlichen oder
            werblichen Online-Präsenz. Gespeicherte Angaben werden dort für Patientinnen sichtbar; es gibt keine
            getrennte „Vorschau“ vor dem Speichern.
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:items-stretch md:gap-4">
          <Link
            href="/profile/editor"
            className="flex min-h-[200px] min-w-0 touch-manipulation flex-col rounded-lg border border-border bg-surface-card p-5 transition-colors hover:border-brand/25 sm:p-6 md:min-h-[220px]"
          >
            <PencilLine className="mb-3 h-5 w-5 text-brand" strokeWidth={1.75} aria-hidden />
            <h2 className="mb-1 font-serif text-xl text-text-primary">Praxisangaben bearbeiten</h2>
            <p className="text-xs leading-snug text-text-tertiary">
              Stammdaten, Schwerpunkte und Texte im geschützten Editor; nach dem Speichern wirksam für den
              Patientenbereich.
            </p>
          </Link>

          {publicUrl ? (
            <Link
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              aria-label="Patientenbereich für dokumentierte Einsendungen in neuem Fenster öffnen"
              className="flex min-h-[200px] min-w-0 touch-manipulation flex-col rounded-lg border border-border bg-surface-card p-5 transition-colors hover:border-brand/25 sm:p-6 md:min-h-[220px]"
            >
              <ExternalLink className="mb-3 h-5 w-5 text-brand" strokeWidth={1.75} aria-hidden />
              <h2 className="mb-1 font-serif text-xl text-text-primary">Patientenbereich prüfen</h2>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Adresse zum Weitergeben
              </p>
              <p className="break-words [overflow-wrap:anywhere] font-mono text-[11px] leading-snug text-text-tertiary">
                {publicUrlLabel}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                Dient ausschließlich der dokumentierten Einsendung von Unterlagen — nicht einer allgemeinen
                Webpräsenz.
              </p>
            </Link>
          ) : patientLinkLoadFailed ? (
            <div
              className="flex min-h-[200px] min-w-0 flex-col rounded-lg border border-dashed border-border bg-surface-card/60 p-5 sm:p-6 md:min-h-[220px]"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-labelledby="profile-patient-empty-retry"
            >
              <FileText className="mb-3 h-5 w-5 text-text-tertiary" strokeWidth={1.75} aria-hidden />
              <h2 id="profile-patient-empty-retry" className="mb-1 font-serif text-xl text-text-primary">
                Patientenbereich
              </h2>
              <p className="text-xs leading-relaxed text-text-secondary">
                Die Angaben zum Patientenbereich sind gerade nicht verfügbar. Bitte laden Sie die Seite neu oder
                versuchen Sie es in Kürze erneut.
              </p>
            </div>
          ) : (
            <div
              className="flex min-h-[200px] min-w-0 flex-col rounded-lg border border-dashed border-border bg-surface-card/60 p-5 sm:p-6 md:min-h-[220px]"
              role="region"
              aria-labelledby="profile-patient-empty-setup"
            >
              <FileText className="mb-3 h-5 w-5 text-text-tertiary" strokeWidth={1.75} aria-hidden />
              <h2 id="profile-patient-empty-setup" className="mb-1 font-serif text-xl text-text-primary">
                Patientenbereich
              </h2>
              <p className="text-xs leading-relaxed text-text-secondary">
                Die Kurzadresse für den Patientenbereich setzen Sie im Editor und speichern die Praxisangaben. Ohne
                gespeicherte Kurzadresse steht kein Patientenlink bereit.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
