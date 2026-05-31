/**
 * Route-Loading für `/dashboard` — ruhige Skeletons (Cockpit, keine KPI-Charts).
 */
export default function DashboardLoading() {
  return (
    <div
      className="yd-dashboard yd-dashboard--atlas mx-auto w-full min-w-0 pb-10"
      aria-busy="true"
      aria-label="Praxisüberblick wird geladen"
    >
      <div className="yd-cockpit-header mb-6 animate-pulse space-y-3">
        <div className="h-8 w-72 max-w-full rounded-lg bg-slate-200/70" />
        <div className="h-4 w-56 max-w-full rounded bg-slate-200/50" />
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="h-24 rounded-xl bg-slate-200/45" />
          <div className="h-24 rounded-xl bg-slate-200/45" />
          <div className="h-24 rounded-xl bg-slate-200/45" />
        </div>
        <div className="h-40 rounded-xl bg-slate-200/40" />
        <div className="h-32 rounded-xl bg-slate-200/35" />
      </div>
    </div>
  );
}
