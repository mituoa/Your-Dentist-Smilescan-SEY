import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import {
  AUTH_NARROW_COLUMN_CLASS,
  AUTH_SCREEN_CANVAS_CLASS,
  authScreenCanvasStyle,
} from "@/lib/auth/auth-screen-shell";

/** Globaler Übergang — gleicher visueller Kontext wie Auth (kein kalter grauer Flash). */
export default function RootLoading() {
  return (
    <div className={AUTH_SCREEN_CANVAS_CLASS} style={authScreenCanvasStyle}>
      <div className={`flex min-h-[100dvh] flex-col items-center ${AUTH_NARROW_COLUMN_CLASS}`}>
        <div className="flex w-full max-w-[min(100%,20rem)] flex-col items-center gap-4 rounded-2xl border border-gray-200/50 bg-white/70 px-8 py-10 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_20px_-6px_rgba(15,23,42,0.06)] sm:gap-5 sm:py-11">
          <YourDentistBrandLockup size="md" centered />
          <svg
            className="h-5 w-5 shrink-0 animate-spin text-[#0284C7]/65 motion-reduce:animate-none motion-reduce:opacity-70"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path
              className="opacity-80"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
