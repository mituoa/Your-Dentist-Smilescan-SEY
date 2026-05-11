import { AuthLoadingSpinner } from "@/components/auth/auth-loading-spinner";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import {
  AUTH_NARROW_COLUMN_CLASS,
  AUTH_SCREEN_CANVAS_CLASS,
  authScreenCanvasStyle,
} from "@/lib/auth/auth-screen-shell";

/** Globaler Übergang — gleicher Canvas wie Auth, aber leicht: nur Mark + Spinner (kein Wordmark/Card). */
export default function RootLoading() {
  return (
    <div className={AUTH_SCREEN_CANVAS_CLASS} style={authScreenCanvasStyle}>
      <div
        className={`flex min-h-[100dvh] flex-col items-center justify-center ${AUTH_NARROW_COLUMN_CLASS}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-3 py-10">
          <YourDentistBrandLockup size="md" centered markOnly priority />
          <AuthLoadingSpinner />
        </div>
      </div>
    </div>
  );
}
