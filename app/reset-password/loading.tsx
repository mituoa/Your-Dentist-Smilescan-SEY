import Link from "next/link";

import { AuthLoadingSpinner } from "@/components/auth/auth-loading-spinner";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import {
  AUTH_CARD_SHELL_CLASS,
  AUTH_LOGO_BLOCK_CLASS,
  AUTH_NARROW_COLUMN_CLASS,
  AUTH_SCREEN_CANVAS_CLASS,
  authCardShellShadowStyle,
  authScreenCanvasStyle,
} from "@/lib/auth/auth-screen-shell";

/** Gleiche Hülle wie `page.tsx` — ruhiger Übergang statt globalem markOnly-Loading, bis die Seite streamt. */
export default function ResetPasswordLoading() {
  return (
    <div className={AUTH_SCREEN_CANVAS_CLASS} style={authScreenCanvasStyle}>
      <div className={`flex min-h-[100dvh] flex-col ${AUTH_NARROW_COLUMN_CLASS}`}>
        <div className={AUTH_LOGO_BLOCK_CLASS}>
          <YourDentistBrandLockup
            size="md"
            tagline="Neutral Practice Platform"
            centered
            priority
          />
        </div>

        <div className={AUTH_CARD_SHELL_CLASS} style={authCardShellShadowStyle}>
          <div className="mb-7 text-center sm:mb-8">
            <h1 className="font-serif text-[1.375rem] font-semibold leading-snug tracking-tight text-gray-900 sm:text-2xl">
              Neues Passwort setzen
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[13px] font-normal leading-relaxed text-slate-600 sm:mt-3.5 sm:text-[14px]">
              Einen Moment bitte.
            </p>
          </div>

          <div
            className="flex flex-col items-center gap-3 py-2 text-center"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="Seite wird geladen"
          >
            <AuthLoadingSpinner />
          </div>

          <p className="mt-8 border-t border-gray-100/90 pt-7 text-center text-[13px] text-slate-600 sm:mt-9 sm:pt-8 sm:text-sm">
            <Link
              prefetch
              href="/login"
              className="inline-flex min-h-[44px] items-center font-medium text-[#0284C7] underline-offset-2 transition-colors hover:text-[#0369A1] hover:underline max-md:py-2 md:min-h-0 md:py-0"
            >
              Zurück zum Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
