import {
  clinicalWorkspaceFrame,
  clinicalWorkspaceVerticalPadding,
} from "@/lib/clinical-ui";

/**
 * Ladezustand nur für **`/profile/editor`** — getrennt von `profile/loading.tsx` (Übersicht),
 * damit Navigation hier keinen falschen Kontext („Praxisübersicht“) und keinen Layout-Sprung ins Formular zeigt.
 */
export default function ProfileEditorLoading() {
  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col pb-[max(0px,env(safe-area-inset-bottom))]"
      style={{ backgroundColor: "#EDECE8" }}
    >
      <div
        className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding} flex min-h-0 flex-1 flex-col`}
        aria-busy="true"
        aria-labelledby="profile-editor-loading-label"
      >
        <div className="flex min-h-[min(52dvh,520px)] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/70 bg-[#FBFBFB] shadow-sm md:flex-row">
          <div className="flex min-h-[min(36vh,280px)] w-full shrink-0 flex-col border-b border-border/60 p-5 sm:p-8 md:min-h-[min(40vh,320px)] md:w-[min(100%,480px)] md:border-b-0 md:border-r md:p-8">
            <div className="mb-2 h-2 w-20 rounded-sm bg-border/70" aria-hidden />
            <div className="mb-4 h-4 max-w-[14rem] rounded-sm bg-border/50" aria-hidden />
            <div className="mb-2 h-2.5 max-w-full rounded-sm bg-border/35" aria-hidden />
            <div className="mb-6 h-2.5 max-w-[90%] rounded-sm bg-border/30" aria-hidden />
            <p
              id="profile-editor-loading-label"
              role="status"
              aria-live="polite"
              className="text-sm font-normal leading-relaxed text-text-secondary"
            >
              Praxisangaben werden vorbereitet …
            </p>
            <div className="mt-8 flex flex-col gap-3" aria-hidden>
              <div className="h-9 w-full max-w-md rounded-sm border border-border/50 bg-surface-card/50" />
              <div className="h-9 w-full max-w-md rounded-sm border border-border/40 bg-surface-card/40" />
              <div className="h-9 w-full max-w-md rounded-sm border border-border/35 bg-surface-card/35" />
            </div>
          </div>
          {/* Mobil: rechte Spalte — gleicher Hintergrundton wie im Editor, ohne Layout-Sprung */}
          <div
            className="flex min-h-[140px] shrink-0 flex-col border-t border-border/40 bg-[#F2F0EC] p-4 md:hidden"
            aria-hidden
          >
            <div className="mx-auto h-full min-h-[100px] w-full max-w-sm rounded-md border border-border/45 bg-surface-card/30" />
          </div>
          <div className="hidden min-h-[min(40vh,280px)] flex-1 bg-[#F2F0EC] md:flex" aria-hidden>
            <div className="flex h-full w-full items-center justify-center p-6">
              <div className="h-48 w-[min(100%,280px)] rounded-md border border-border/45 bg-surface-card/35" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
