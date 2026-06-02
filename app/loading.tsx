import { AuthLoadingSpinner } from "@/components/auth/auth-loading-spinner";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { YdWorkspaceCanvas } from "@/components/design-system/yd-workspace-canvas";
import { YD } from "@/lib/design/yd-design-tokens";

/** Globaler Übergang — gleicher Canvas wie Auth, aber leicht: nur Mark + Spinner (kein Wordmark/Card). */
export default function RootLoading() {
  return (
    <div
      className="yd-workspace yd-awaken-page relative min-h-[100dvh] w-full overflow-hidden"
      style={{ background: YD.atmosphere.pageGradient }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1240px] items-center px-3 py-3 md:px-4 md:py-4">
        <div className="yd-app-shell-row flex min-h-0 w-full flex-1 items-stretch gap-0">
          <YdWorkspaceCanvas className="w-full">
            <div className="flex min-h-[min(60dvh,560px)] w-full flex-col items-center justify-center gap-3 py-10">
              <YourDentistBrandLockup size="md" centered markOnly priority />
              <AuthLoadingSpinner />
            </div>
          </YdWorkspaceCanvas>
        </div>
      </div>
    </div>
  );
}
