/** Äußerer Rahmen — identisch zur Einladungsseite, damit Route-Loading nicht zum Auth-Canvas springt. */
export const ACCEPT_INVITE_OUTER_CLASS =
  "relative isolate flex min-h-[100dvh] w-full max-w-[100vw] flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-6 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-[max(6rem,calc(1.25rem+env(safe-area-inset-top,0px)))] sm:py-8 md:min-h-screen md:pt-8";

export const ACCEPT_INVITE_INNER_CLASS = "relative z-10 w-full min-w-0 max-w-[500px]";

export const ACCEPT_INVITE_CARD_CLASS =
  "relative flex w-full min-w-0 max-w-full flex-col gap-5 rounded-[18px] border border-white/30 bg-white/80 p-6 backdrop-blur-xl sm:gap-6 sm:p-8";

export const acceptInviteCardShadow = {
  boxShadow: "0px 24px 64px rgba(15, 23, 42, 0.12)",
} as const;

/** Mindesthöhe nur für segment-`loading.tsx`, um starke Sprünge zur Karte zu mildern. */
export const ACCEPT_INVITE_LOADING_CARD_CLASS = `${ACCEPT_INVITE_CARD_CLASS} min-h-[300px]`;

export function AcceptInviteAmbientBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(148, 163, 184, 0.7) 0%, rgba(59, 130, 246, 0.55) 100%)",
          filter: "blur(150px)",
          transform: "translate(-25%, -25%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(99, 102, 241, 0.45) 100%)",
          filter: "blur(150px)",
          transform: "translate(25%, 25%)",
        }}
      />
    </>
  );
}
