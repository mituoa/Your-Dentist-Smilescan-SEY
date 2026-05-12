/**
 * **`/profile` — Routen-QA (`loading.tsx`, Punkte 2–13): final** (MVP/Drift: `page.tsx` 11–12; Priorität/Stabilität: `page.tsx` Punkt 13).
 *
 * **Punkt 11 (MVP) — final:** Skeleton spiegelt **nur** die schlanke Übersicht (Kopf + zwei Karten) — **kein**
 * Publishing-Dashboard, **kein** KPI-/Activity-Theater, **kein** Vorschau-Canvas. Team: Redirect vor diesem Segment.
 *
 * **Punkt 12 (Nice / Future / Non-MVP) — final (Kurz):** Kein Skeleton-**Feature-Creep** (keine Extra-Karten,
 * kein Fake-Preview, kein Analytics-/SEO-Platzhalter); nur statisches Layout — Details s. `page.tsx` Punkt 12.
 *
 * **Punkt 13 (Priorität) — final (Kurz):** Skeleton bleibt **statisch und dünn** — keine Aufwertung zu „Produkt-Priorität
 * durch mehr UI“; Route **P2 stabil** halten, s. `page.tsx` Punkt 13.
 *
 * **`/profile` — Punkt 2 (Status — final):** Segment-`loading` während **Workspace/Rolle** und **Slug-Lesung** —
 * **statisch**, kein Puls/Shimmer (kein „Realtime“- oder CMS-Busy-Signal). Gleicher Außenrahmen wie `page.tsx`
 * (`clinicalWorkspaceFrame` + vertikales Padding), **max-w-4xl** wie die Zielseite — milder Übergang ohne
 * Layout-Sprung zur Kartenzeile.
 *
 * **Nicht** dasselbe wie Editor-Speichern (`/profile/editor`) — dort eigenes Pending.
 *
 * **Punkt 3 (Supabase/Auth) — final:** Nur UI-Skeleton; **keine** Slug-/Workspace-Daten. Auth/Workspace wie `(protected)`-Layout
 * und `page.tsx` — keine zusätzliche Exposition sensibler Zustände.
 *
 * **Punkt 4 (Aktionen) — final:** Skeleton spiegelt die **zwei Karten** (Editor + Patientenbereich-Platzhalter); **keine**
 * Schein-Aktionen, **kein** CMS-Busy-Signal.
 *
 * **Punkt 5 (Tot/Fake) — final:** **Statisches** Layout-Skeleton — **kein** Content-Preview, **kein** Fake-Publish-Zustand;
 * Balken **keine** KPI- oder Aktivitäts-Vortäuschung.
 *
 * **Punkt 6 (Loading) — final:** **Statisch**, **kein** Puls/Shimmer, **kein** CMS-„Busy“-Theater. Reihenfolge wie die
 * Zielseite (Kontextzeile → Titel → Fließtext-Platzhalter → ruhiger Status); **min-height** im Kopfbereich und
 * **dieselben** Karten-`min-h` wie `page.tsx` gegen harte Sprünge. Platzhalter über **Border-/Opacity** statt
 * generischem Slate-Gitter; Karten mit **dezenten** Innenlinien (keine Dashboard-Widgets). Team: **kein** Loading
 * dieser Route (Redirect vor dem Segment).
 *
 * **Punkt 7 (Empty) — final:** Rechte Skeleton-Karte (gestrichelt) spiegelt die **Empty**-Fläche ohne Slug — **kein**
 * CTA, **kein** „Jetzt einrichten“-Schein; gleiche **min-h** wie die Zielkarte.
 *
 * **Punkt 8 (Error) — final:** Kein Error-Banner im Skeleton; Fehler nur auf der **Zielseite** in der Patientenkarte (s.
 * `page.tsx`).
 *
 * **Punkt 9 (Mobile) — final:** Gleiche **Raster-/Padding-**Rhythmik wie `page.tsx` (`gap-5` mobil, `md:gap-4`;
 * `p-5 sm:p-6`); **`min-w-0`** auf Container und Raster — **kein** horizontales Scrollen durch Skeleton-Breiten.
 *
 * **Punkt 10 (Security) — final:** Kein Client-Trust im Skeleton; Zielseite: Doctor-Gate, Workspace-Scope, RLS, s.
 * `page.tsx`. MVP-, Drift- und Prioritäts-Grenzen: Punkte 11–13 in `page.tsx`.
 */
import {
  clinicalWorkspaceFrame,
  clinicalWorkspaceVerticalPadding,
} from "@/lib/clinical-ui";

export default function ProfileLoading() {
  return (
    <div
      className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}
      aria-busy="true"
      aria-labelledby="profile-loading-label"
    >
      <div className="mx-auto w-full min-w-0 max-w-4xl space-y-8 overflow-x-hidden">
        <div className="min-h-[10.5rem] md:min-h-[11.5rem]">
          <div className="mb-2 h-2.5 w-24 rounded-sm bg-border/80" aria-hidden />
          <div
            className="mb-3 min-h-[2rem] max-w-md rounded-sm bg-border/55 md:min-h-[2.25rem]"
            aria-hidden
          />
          <div className="mb-2 h-2.5 max-w-xl rounded-sm bg-border/40" aria-hidden />
          <div className="mb-4 h-2.5 max-w-lg rounded-sm bg-border/35" aria-hidden />
          <p
            id="profile-loading-label"
            role="status"
            aria-live="polite"
            className="max-w-xl text-sm font-normal leading-relaxed text-text-secondary"
          >
            Praxisübersicht wird geladen …
          </p>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:items-stretch md:gap-4">
          <div
            className="flex min-h-[200px] min-w-0 flex-col rounded-lg border border-border bg-surface-card p-5 sm:p-6 md:min-h-[220px]"
            aria-hidden
          >
            <div className="mb-3 h-5 w-5 shrink-0 rounded-sm bg-border/30" />
            <div className="mb-2 h-5 max-w-[14rem] rounded-sm bg-border/35" />
            <div className="h-3 max-w-full rounded-sm bg-border/25" />
            <div className="mt-1.5 h-3 max-w-[90%] rounded-sm bg-border/20" />
          </div>
          <div
            className="flex min-h-[200px] min-w-0 flex-col rounded-lg border border-dashed border-border bg-surface-card/60 p-5 sm:p-6 md:min-h-[220px]"
            aria-hidden
          >
            <div className="mb-3 h-5 w-5 shrink-0 rounded-sm bg-border/25" />
            <div className="mb-2 h-5 max-w-[11rem] rounded-sm bg-border/30" />
            <div className="h-3 max-w-[95%] rounded-sm bg-border/20" />
            <div className="mt-1.5 h-3 max-w-[75%] rounded-sm bg-border/15" />
          </div>
        </div>
      </div>
    </div>
  );
}
