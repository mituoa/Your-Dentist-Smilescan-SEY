/**
 * **`/profile` — Punkt 2 (Status — final):** Segment-`loading` während **Workspace/Rolle** und **Slug-Lesung** —
 * **statisch**, kein Puls/Shimmer (kein „Realtime“- oder CMS-Busy-Signal). Gleicher Außenrahmen wie `page.tsx`
 * (`clinicalWorkspaceFrame` + vertikales Padding), **max-w-4xl** wie die Zielseite — milder Übergang ohne
 * Layout-Sprung zur Kartenzeile.
 *
 * **Nicht** dasselbe wie Editor-Speichern (`/profile/editor`) — dort eigenes Pending.
 *
 * **Punkt 3 (Supabase/Auth):** Nur UI-Skeleton; **keine** Slug-/Workspace-Daten. Auth/Workspace wie `(protected)`-Layout
 * und `page.tsx` — keine zusätzliche Exposition sensibler Zustände.
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
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div className="space-y-4">
          <div className="h-3 w-24 rounded bg-border" aria-hidden />
          <div className="h-10 max-w-md rounded-md bg-slate-200/70" aria-hidden />
          <p
            id="profile-loading-label"
            role="status"
            className="text-sm font-normal leading-relaxed text-text-secondary"
          >
            Profilübersicht wird geladen …
          </p>
          <div className="h-4 max-w-xl rounded bg-slate-100" aria-hidden />
          <div className="h-4 max-w-lg rounded bg-slate-100" aria-hidden />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch">
          <div
            className="min-h-[200px] rounded-lg border border-border bg-surface-card p-6 md:min-h-[220px]"
            aria-hidden
          />
          <div
            className="min-h-[200px] rounded-lg border border-dashed border-border bg-surface-card/60 p-6 md:min-h-[220px]"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
