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
        <div className="flex min-h-[min(56dvh,560px)] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/60 bg-[#EEEBE6] shadow-sm md:flex-row">
          <div className="flex min-h-[min(32vh,260px)] flex-1 flex-col justify-end border-b border-border/35 p-6 sm:p-8 md:min-h-0 md:border-b-0 md:border-r md:pb-10 md:pt-12">
            <div className="mx-auto w-full max-w-[240px] md:max-w-[280px]" aria-hidden>
              <div className="aspect-[3/4] w-full rounded-xl bg-white/25" />
            </div>
            <div className="mx-auto mt-8 max-w-md space-y-3 text-center md:mt-10 md:text-left" aria-hidden>
              <div className="mx-auto h-2 w-24 rounded-sm bg-border/50 md:mx-0" />
              <div className="mx-auto h-7 max-w-[14ch] rounded-sm bg-border/40 md:mx-0" />
              <div className="mx-auto h-2 max-w-[20ch] rounded-sm bg-border/30 md:mx-0" />
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col border-t border-border/35 bg-[#F4F3F0] p-5 sm:p-6 md:w-[min(100%,340px)] md:border-l md:border-t-0">
            <p
              id="profile-editor-loading-label"
              role="status"
              aria-live="polite"
              className="text-[13px] font-normal leading-relaxed text-text-secondary"
            >
              Profil wird geladen …
            </p>
            <div className="mt-6 flex flex-col gap-2.5 border-t border-border/30 pt-6" aria-hidden>
              <div className="h-px w-full bg-border/25" />
              <div className="h-8 w-full border-b border-border/40" />
              <div className="h-8 w-full border-b border-border/35" />
              <div className="h-8 w-full border-b border-border/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
