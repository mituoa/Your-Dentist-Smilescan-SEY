/** Sofort sichtbar beim Klick auf / — kein Workspace-Skeleton. */
export default function MarketingHomeLoading() {
  return (
    <div
      className="yd-bento-page flex min-h-[100dvh] flex-col"
      aria-busy="true"
      aria-label="Startseite wird geladen"
    >
      <div
        className="yd-bento-header yd-bento-header--scrolled"
        style={{ minHeight: "var(--bento-header-h, 4.25rem)" }}
      >
        <div className="yd-bento-header__inner">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-[#dce8f5]/80" />
        </div>
      </div>
      <div className="yd-bento-container flex flex-1 flex-col gap-4 py-10">
        <div className="h-12 max-w-xl w-[85%] animate-pulse rounded-xl bg-[#dce8f5]/70" />
        <div className="h-6 w-full max-w-2xl animate-pulse rounded-lg bg-[#edf5fd]" />
        <div className="mt-4 grid flex-1 gap-3 sm:grid-cols-3">
          <div className="min-h-[120px] animate-pulse rounded-[20px] bg-white/90 sm:col-span-2" />
          <div className="hidden min-h-[120px] animate-pulse rounded-[20px] bg-[#edf5fd] sm:block" />
        </div>
      </div>
    </div>
  );
}
