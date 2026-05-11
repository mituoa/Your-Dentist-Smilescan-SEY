import { AuthLoadingSpinner } from "@/components/auth/auth-loading-spinner";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import {
  AUTH_NARROW_COLUMN_CLASS,
  AUTH_SCREEN_CANVAS_CLASS,
  authScreenCanvasStyle,
} from "@/lib/auth/auth-screen-shell";

/** Route-Wechsel im Auth-Bereich — gleicher Canvas wie Login/Forgot (ruhig, kein Farbsprung). */
export default function AuthLoading() {
  return (
    <div className={AUTH_SCREEN_CANVAS_CLASS} style={authScreenCanvasStyle}>
      <div className={`flex min-h-[100dvh] flex-col items-center ${AUTH_NARROW_COLUMN_CLASS}`}>
        <div className="flex w-full max-w-[min(100%,20rem)] flex-col items-center gap-4 rounded-2xl border border-gray-200/50 bg-white/70 px-8 py-10 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_20px_-6px_rgba(15,23,42,0.06)] sm:gap-5 sm:py-11">
          <YourDentistBrandLockup size="md" centered />
          <AuthLoadingSpinner />
        </div>
      </div>
    </div>
  );
}
