import { AuthLoadingSpinner } from "@/components/auth/auth-loading-spinner";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import {
  ACCEPT_INVITE_INNER_CLASS,
  ACCEPT_INVITE_LOADING_CARD_CLASS,
  ACCEPT_INVITE_OUTER_CLASS,
  AcceptInviteAmbientBackground,
  acceptInviteCardShadow,
} from "./accept-invite-shell";

/** Segment-Loading: gleicher visueller Rahmen wie die Einladungskarte (ruhig, ohne Auth-Canvas-Sprung). */
export default function AcceptInviteLoading() {
  return (
    <div className={ACCEPT_INVITE_OUTER_CLASS}>
      <AcceptInviteAmbientBackground />
      <div className={ACCEPT_INVITE_INNER_CLASS}>
        <div className={ACCEPT_INVITE_LOADING_CARD_CLASS} style={acceptInviteCardShadow}>
          <div className="mb-6 flex min-w-0 w-full justify-center border-b border-slate-200/60 pb-5 sm:mb-7 sm:pb-6">
            <YourDentistBrandLockup size="sm" centered priority />
          </div>
          <div
            className="flex min-w-0 w-full flex-1 flex-col items-center justify-center gap-4 px-1 py-4 text-center"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <AuthLoadingSpinner className="h-6 w-6 shrink-0 text-slate-500/75 motion-reduce:animate-none motion-reduce:opacity-75" />
            <p className="w-full min-w-0 max-w-sm text-pretty text-sm leading-relaxed text-slate-600 [overflow-wrap:anywhere]">
              Einladung wird geprüft&nbsp;…
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
