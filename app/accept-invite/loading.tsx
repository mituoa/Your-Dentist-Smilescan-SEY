import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { YdSkeleton } from "@/components/design-system/yd-skeleton";
import {
  ACCEPT_INVITE_INNER_CLASS,
  ACCEPT_INVITE_LOADING_CARD_CLASS,
  ACCEPT_INVITE_OUTER_CLASS,
  AcceptInviteAmbientBackground,
  acceptInviteCardShadow,
} from "./accept-invite-shell";

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
            className="flex min-w-0 w-full flex-1 flex-col gap-4 px-2 py-4"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="Einladung wird geprüft"
          >
            <YdSkeleton className="mx-auto h-4 w-40" variant="calm" />
            <YdSkeleton className="h-11 w-full rounded-xl" variant="calm" />
            <YdSkeleton className="h-11 w-full rounded-xl" variant="calm" />
            <div className="yd-auth-loading-pulse-v2 mx-auto w-full max-w-xs" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
