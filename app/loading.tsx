import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { YdSkeleton, YdSkeletonPage } from "@/components/design-system/yd-skeleton";
import { YdWorkspaceCanvas } from "@/components/design-system/yd-workspace-canvas";
import { YD } from "@/lib/design/yd-design-tokens";

/** Globaler Übergang — Workspace-Struktur sichtbar, kein isoliertes Ladekästchen. */
export default function RootLoading() {
  return (
    <div
      className="yd-workspace yd-awaken-page relative min-h-[100dvh] w-full overflow-hidden"
      style={{ background: YD.atmosphere.pageGradient }}
    >
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1240px] items-stretch px-3 py-3 md:px-4 md:py-4">
        <div className="yd-app-shell-row flex min-h-0 w-full flex-1 items-stretch gap-0">
          <YdWorkspaceCanvas className="w-full">
            <YdSkeletonPage
              label="Workspace wird geladen"
              className="flex min-h-[min(70dvh,640px)] w-full flex-col gap-6 p-6 md:p-10"
            >
              <div className="flex items-center gap-3">
                <YourDentistBrandLockup size="md" markOnly priority />
                <div className="min-w-0 flex-1 space-y-2">
                  <YdSkeleton className="h-3 w-28" variant="calm" />
                  <YdSkeleton className="h-5 w-40 max-w-full" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-12">
                <YdSkeleton className="min-h-[140px] rounded-2xl md:col-span-7" variant="calm" />
                <div className="flex flex-col gap-4 md:col-span-5">
                  <YdSkeleton className="min-h-[88px] rounded-2xl" variant="calm" />
                  <YdSkeleton className="min-h-[88px] rounded-2xl" variant="calm" />
                </div>
              </div>
              <div className="yd-skeleton-card flex-1 space-y-3">
                <YdSkeleton className="h-4 w-32" />
                <YdSkeleton className="h-3 w-full max-w-lg" variant="calm" />
                <YdSkeleton className="h-3 w-full max-w-md" variant="calm" />
              </div>
              <div className="yd-auth-loading-pulse-v2 mx-auto" aria-hidden />
            </YdSkeletonPage>
          </YdWorkspaceCanvas>
        </div>
      </div>
    </div>
  );
}
