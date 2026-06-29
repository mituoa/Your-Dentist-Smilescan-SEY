/** Sofort sichtbar beim Klick auf / — kein Workspace-Skeleton. */
export default function MarketingHomeLoading() {
  return (
    <div className="yd-os flex min-h-[100dvh] flex-col" aria-busy="true" aria-label="Startseite wird geladen">
      <div className="yd-os-header yd-os-header--scrolled" style={{ minHeight: 80 }}>
        <div className="yd-os-container yd-os-header-inner">
          <div className="h-7 w-32 animate-pulse rounded-lg bg-[#eef4fc]" />
        </div>
      </div>
      <div className="yd-os-container flex flex-1 flex-col gap-4 py-14">
        <div className="h-12 max-w-xl w-[85%] animate-pulse rounded-xl bg-[#eef4fc]" />
        <div className="h-6 w-full max-w-2xl animate-pulse rounded-lg bg-[#eef4fc]/70" />
        <div className="mt-6 grid flex-1 gap-3 sm:grid-cols-3">
          <div className="min-h-[140px] animate-pulse rounded-2xl bg-white sm:col-span-2" />
          <div className="hidden min-h-[140px] animate-pulse rounded-2xl bg-[#eef4fc] sm:block" />
        </div>
      </div>
    </div>
  );
}
