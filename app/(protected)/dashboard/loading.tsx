/**
 * Route-Loading für `/dashboard` — entspricht der **historischen** Layoutstruktur (max-width,
 * Kopfzeile, KPI-Raster, Aktivitätsblock). Funktionale Seite: `page.tsx`.
 */
export default function DashboardLoading() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#F8FAFC" }}
      aria-busy="true"
      aria-label="Übersicht wird geladen"
    >
      <div className="mx-auto max-w-[1240px] px-4 py-8 md:px-10">
        <div className="mb-8 animate-pulse space-y-3 border-b border-slate-200/60 pb-6">
          <div className="h-8 w-64 rounded-lg bg-slate-200/80" />
          <div className="h-4 w-48 rounded bg-slate-200/60" />
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <div className="h-14 flex-1 rounded-xl bg-slate-200/50" />
            <div className="h-14 flex-1 rounded-xl bg-slate-200/50" />
          </div>
        </div>
        <div className="mb-10 grid grid-cols-12 gap-6">
          <div className="col-span-12 h-48 animate-pulse rounded-2xl bg-slate-200/40 lg:col-span-7" />
          <div className="col-span-12 flex flex-col gap-6 lg:col-span-5">
            <div className="h-36 animate-pulse rounded-2xl bg-slate-200/40" />
            <div className="h-36 animate-pulse rounded-2xl bg-slate-200/40" />
          </div>
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-slate-200/35" />
      </div>
    </div>
  );
}
