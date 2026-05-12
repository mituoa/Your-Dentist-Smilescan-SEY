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
 * **`/profile` — Routen-QA (Punkte 1–13): final** (MVP-Hub Punkt 11; Nice/Future/Non-MVP Punkt 12; Priorität/Stabilität Punkt 13).
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
 * Neuer Tab nur für den **operativen** Weitergabe-Link; Hover **dezent** (leichte Randbetonung). **Nicht:** Site-Builder-,
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
 *
 * **Punkt 11 (MVP) — final:** Diese Route ist **bewusst klein**: zwei Einstiege (Editor + optionaler Patientenbereich
 * unter `/doc/{slug}`) — **kein** Profil-Netzwerk, **kein** CMS-Hub, **kein** Website-Builder, **kein** Publishing-Dashboard.
 * **Ausreichend** für den Pilot: Praxisangaben pflegen und den freigegebenen Einsendepfad sachlich erreichbar halten.
 * **Bewusst nicht Teil dieses MVP-Hubs** (keine UI-Vortäuschung auf `/profile`): eingebettete Live-Vorschau,
 * Analytics, SEO-/Go-Live-Steuerung, Social-/Creator-Funktionen, Mehrfach-Öffentlichkeitsprofile, komplexe
 * „Präsenz“-Verwaltung. Bei Zielkonflikt gilt: **ruhigere**, fokussiertere Praxis-/Dokumentverwaltung vor
 * plattformartiger Breite — Details und P2-Ideen **Punkt 12**; Prioritäts-Disziplin und „nicht mehr ausbauen“ **Punkt 13**.
 *
 * **Punkt 12 (Nice / Future / Non-MVP) — final (Doku/Strategie):** Abgrenzung zum Schutz vor **Scope-Creep** und
 * **CMS-/Creator-/Publishing-/Marketing-Drift**. Diese Route bleibt ein **Wegeiser**, nicht ein Bedienfeld für die
 * öffentliche Fläche oder für Wachstum/KPIs.
 *
 * **Nice (klein; P2/P3; ohne neue Produktlogik auf `/profile`):** feine Spacing-/Typo-/Karten-Rhythmus-Polish;
 * echte Geräte-QA (z. B. sehr lange Host-Zeilen, Touch-Ziele); kleine **Accessibility**-Verbesserungen (Landmarks,
 * konsistente `aria-*` bei Copy-Änderungen); diskrete Loading-/Slug-Edge-Copy — **ohne** zusätzliche Karten,
 * **ohne** iframe/Vorschau, **ohne** Dashboard-Kacheln.
 *
 * **Future (eigene Epics; nicht durch Erweiterung dieser Übersicht „lösen“):** optionaler **Vorschau-Embed** oder
 * strukturierte **Sandbox-/Staged-Preview** von `/doc`-Inhalten (technisch und juristisch separat zu klären);
 * komfortablere **Kurzlink-/Slug-Verwaltung** (Konflikte, Sperrlisten, Reservierung) **serverseitig** mit klarer Policy;
 * **Audit-/Änderungsverlauf** für Praxisangaben; ggf. **Freigabe-/Vier-Augen-Workflows** — alles **nicht** als
 * Feature-Sammlung auf `/profile` starten (sonst Hub-Inflation und CMS-Anmutung).
 *
 * **Non-MVP (bewusst nicht bauen / nicht als leichtes „Nice“ verkaufen):** Social-/Follower-**Profilplattform**,
 * öffentliche **Multi-Presence** jenseits des einen Einsendepfads, **Analytics-/SEO-/Traffic-Dashboards**, KPI- und
 * **Aktivitäts-Theater**, Branding-/Campaign-Editoren, **CMS-/Website-Builder-Logik** (Seitenmodule, Template-Märkte),
 * **Realtime-/Publishing-Showcases** („Live“, Schein-Publish), **AI-/Automation-Showcases** als Produktlayer auf
 * dieser Shell, Growth-/A/B-Experimente **auf `/profile`**, personalisierte Marketing-Landing statt sachlicher Hub.
 *
 * **Drift-Risiken (explizit vermeiden):** alles, was `/profile` **plattformartig**, **startupig** oder
 * **marketingzentriert** wirken lässt; künstliche „Aktivität“ ohne fachlichen Mehrwert; SEO-Scores oder
 * Einbindung von Drittanalytics **auf dieser Route**; jede öffentliche Profillogik, die über **einen** validierten
 * `workspaces.slug` + `/doc/*` hinausgeht.
 *
 * **Nicht erweitern:** `/profile` zu einem **Navigations-CMS**, **Creator-Home**, **Go-Live-Kontrollzentrum** oder
 * **Marketing-Automation-Hub** — öffentlicher Inhalt bleibt unter **`/doc/{slug}`**, Bearbeitung im **Editor**,
 * diese Seite nur der **ruhige, kontrollierte Einstieg**.
 *
 * **Punkt 13 (Priorität) — final (Doku/Strategie):** **Realistische Einordnung:** `/profile` ist ein **randständiger,
 * verlässlicher Hub** zwischen geschütztem **Editor** und dem **öffentlichen Einsendepfad** `/doc/{slug}` — nicht
 * Teil des klinischen Kern-Workflows (Inbox, Relay, Case). **P2 bleibt korrekt:** unterhalb von P0/P1-Kritikalität;
 * hier lohnen **Bugfixes**, **Sicherheitskorrekturen**, kleine **A11y-/Copy-/Layout-Fixes**, **kein** Feature-Ausbau
 * als Ziel an sich.
 *
 * **Prioritätsregel:** Kollidieren **„mächtigere“ Profil-/Public-Inszenierung** mit **ruhiger, glaubwürdiger** medizinischer
 * Dokumentverwaltung → **Stabilität, Ruhe, Fokus** bevorzugen; diese Route **absichtlich stabil** halten.
 *
 * **Produktkritische Regressionen (relativ zu dieser Route sofort eskalieren):** Team sieht die Seite; falscher oder
 * fremder Workspace-Kontext im Slug-Link; **öffentlicher href** ohne `isSafeDocPathSlug`; täuschender oder toter
 * Patienten-Link; Slug/Workspace-IDs in Nutzer-Copy; Doctor-Gate nur clientseitig; Referer-Leak aus dem geschützten
 * Tab; sichtbare Rohfehler statt ruhiger Meldungen.
 *
 * **Vor Demo/Pilot/Praxisbetrieb manuell prüfen:** Arzt vs. Team-Redirect; rechte Karte in allen drei Zuständen
 * (gültiger Slug / kein Slug / Lesefehler); lange Host-Zeilen mobil; neuer Tab + `noopener`/`noreferrer`; nach Editor-
 * Speichern konsistenter Slug (`revalidatePath`).
 *
 * **Bewusst nicht mehr „feature-anfassen“:** Zwei-Karten-Hub, Doctor-Gate, Slug-Leselogik, fail-closed Public-Link —
 * nur bei **Bug**, **Security**, **A11y** oder **klar sachlicher** Copy-Korrektur ändern, **nicht** als Einstieg in
 * CMS-/Dashboard-Erweiterungen.
 *
 * **QA / Link-Hygiene / Monitoring / reale Nutzung (Betrieb, keine Produkt-Roadmap):** Support-Fälle zur Kurzadresse,
 * 404/410 auf `/doc`, Log-Codes serverseitig — **keine** Begründung, auf `/profile` KPI-Kacheln oder Analytics zu
 * setzen.
 *
 * **Funktional weiter ausbauen?** **Nein** als Default — Hub ist **fertig im MVP-Sinn**; sinnvolle Arbeit liegt in
 * **Editor** und **`/doc/*`**, nicht in zusätzlichen Aktionen auf dieser Übersicht.
 *
 * **Sofort CMS-/Creator-/Marketing-/Startup-Anmutung:** weitere Karten/„Module“, eingebettete Vorschau, Traffic- oder
 * SEO-Zahlen, künstliche Status-Badges, „Boost“-/Growth-Sprache, Realtime-„Live“-Labels, Creator-Landing-Stil.
 *
 * **Besonders geschützte Grenzen:** genau **ein** validierter `workspaces.slug` → `/doc/*`; keine zweite öffentliche
 * Profil-Logik hier; keine Analytics-/SEO-Schicht; keine AI-/Automation-Showcase-Fläche — vgl. **Punkt 12**.
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
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#64748B]">
            Praxis · Patientenunterlagen
          </p>
          <h1 className="mb-3 text-balance text-[1.625rem] font-semibold leading-snug tracking-[-0.02em] text-[#0F172A] md:text-[1.875rem]">
            Praxisangaben und freigegebener Patientenbereich
          </h1>
          <p className="max-w-xl text-[14px] leading-relaxed text-[#475569] md:text-[15px]">
            Bearbeiten Sie Praxisangaben im geschützten Editor. Der öffentliche Bereich unter Ihrer Kurzadresse dient
            ausschließlich der dokumentierten Einsendung von Unterlagen — nicht einer allgemeinen Webpräsenz. Nach dem
            Speichern sind die Angaben dort sichtbar; eine getrennte Vorschau gibt es in diesem MVP nicht.
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:items-stretch md:gap-4">
          <Link
            href="/profile/editor"
            className="flex min-h-[200px] min-w-0 touch-manipulation flex-col rounded-lg border border-[rgba(15,23,42,0.08)] bg-white p-5 transition-colors hover:border-[rgba(15,23,42,0.12)] sm:p-6 md:min-h-[220px]"
          >
            <PencilLine className="mb-3 h-5 w-5 text-[#2F80ED]" strokeWidth={1.75} aria-hidden />
            <h2 className="mb-1 text-[17px] font-semibold tracking-[-0.01em] text-[#0F172A]">
              Praxisangaben bearbeiten
            </h2>
            <p className="text-[12px] leading-snug text-[#64748B]">
              Geschützter Editor für Stammdaten und Texte. Änderungen gelten für den Patientenbereich erst nach dem
              Speichern.
            </p>
          </Link>

          {publicUrl ? (
            <Link
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              aria-label="Patientenbereich für dokumentierte Einsendungen in neuem Fenster öffnen"
              className="flex min-h-[200px] min-w-0 touch-manipulation flex-col rounded-lg border border-[rgba(15,23,42,0.08)] bg-white p-5 transition-colors hover:border-[rgba(15,23,42,0.12)] sm:p-6 md:min-h-[220px]"
            >
              <ExternalLink className="mb-3 h-5 w-5 text-[#2F80ED]" strokeWidth={1.75} aria-hidden />
              <h2 className="mb-1 text-[17px] font-semibold tracking-[-0.01em] text-[#0F172A]">
                Patientenbereich öffnen
              </h2>
              <p className="mb-1.5 text-[12px] font-medium text-[#64748B]">Öffentliche Adresse (Weitergabe an Patientinnen)</p>
              <p className="break-words [overflow-wrap:anywhere] font-mono text-[11px] leading-snug text-[#94A3B8]">
                {publicUrlLabel}
              </p>
              <p className="mt-3 text-[12px] leading-relaxed text-[#475569]">
                Nur für die strukturierte Einsendung vorgesehen — keine allgemeine Präsenz- oder Marketingseite.
              </p>
            </Link>
          ) : patientLinkLoadFailed ? (
            <div
              className="flex min-h-[200px] min-w-0 flex-col rounded-lg border border-dashed border-[rgba(15,23,42,0.1)] bg-[#FAFBFC] p-5 sm:p-6 md:min-h-[220px]"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-labelledby="profile-patient-empty-retry"
            >
              <FileText className="mb-3 h-5 w-5 text-[#94A3B8]" strokeWidth={1.75} aria-hidden />
              <h2 id="profile-patient-empty-retry" className="mb-1 text-[17px] font-semibold text-[#0F172A]">
                Patientenbereich
              </h2>
              <p className="text-[12px] leading-relaxed text-[#475569]">
                Die Verknüpfung ist gerade nicht erreichbar. Bitte Seite neu laden oder es später erneut versuchen.
              </p>
            </div>
          ) : (
            <div
              className="flex min-h-[200px] min-w-0 flex-col rounded-lg border border-dashed border-[rgba(15,23,42,0.1)] bg-[#FAFBFC] p-5 sm:p-6 md:min-h-[220px]"
              role="region"
              aria-labelledby="profile-patient-empty-setup"
            >
              <FileText className="mb-3 h-5 w-5 text-[#94A3B8]" strokeWidth={1.75} aria-hidden />
              <h2 id="profile-patient-empty-setup" className="mb-1 text-[17px] font-semibold text-[#0F172A]">
                Patientenbereich
              </h2>
              <p className="text-[12px] leading-relaxed text-[#475569]">
                Legen Sie die Kurzadresse im Editor fest und speichern Sie die Praxisangaben. Ohne gültige, gespeicherte
                Kurzadresse gibt es hier keinen Link — bewusst kein Platzhalter-Link.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
