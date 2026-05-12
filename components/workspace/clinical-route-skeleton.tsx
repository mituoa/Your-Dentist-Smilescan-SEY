import { clinicalWorkspaceFrame, clinicalWorkspaceVerticalPadding } from "@/lib/clinical-ui";

/**
 * Subtle blue-gray loading placeholders — aligned with Tracker / Figma (no warm paper blocks).
 */
const pulse = "animate-[clinicalSkeletonPulse_2s_ease-in-out_infinite]";

const pulseDashboard =
  "animate-[clinicalSkeletonPulseDashboard_3.2s_ease-in-out_infinite]";

const bar = (className: string) => (
  <div
    className={`rounded-lg bg-[#E2E8F7]/45 ${pulse} dark:bg-slate-600/25 ${className}`}
    aria-hidden
  />
);

const barDashboard = (className: string) => (
  <div
    className={`rounded-lg bg-[#E2E8F7]/40 ${pulseDashboard} dark:bg-slate-600/25 ${className}`}
    aria-hidden
  />
);

export function ClinicalMinimalSkeleton() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center px-6" style={{ background: "#F7F9FC" }}>
      <div
        className={`h-9 w-44 rounded-lg bg-[#DDE6F8]/50 dark:bg-slate-600/30 ${pulse}`}
        aria-hidden
      />
      <div
        className={`mt-4 h-3 w-56 max-w-full rounded bg-[#E2E8F7]/40 dark:bg-slate-600/20 ${pulse}`}
        aria-hidden
      />
    </div>
  );
}

/**
 * @deprecated Dashboard nutzt wieder das historische `loading.tsx`-Gerüst; Export kann entfernt werden, wenn ungenutzt.
 * Ladegerüst ausschließlich für `/dashboard` — spiegelt **Rahmen und Abstände** der echten Seite
 * (keine KPI-Ziffern, keine Chronik-Inhalte): reduziert Layout-Sprung und wirkt sachlich statt
 * „Analytics-Dashboard-Platzhalter“. **Mobile:** gleiche `min-w-0`/`gap`-Staffel und Karten-Padding wie
 * die fertige Route (enge Viewports, keine horizontalen Überläufe).
 */
export function ClinicalDashboardSkeleton() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#F7F9FC" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(47,128,237,0.035), transparent 34%)",
        }}
      />
      <section
        className={`clinical-dashboard-skeleton relative min-w-0 touch-manipulation ${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}
        aria-busy="true"
        aria-label="Übersicht wird geladen"
      >
        <div className="min-w-0 w-full max-w-full">
          <div
            className="mb-5 overflow-hidden pb-4"
            style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}
          >
            {barDashboard("mb-1.5 h-8 max-w-[min(100%,20rem)]")}
            {barDashboard("mb-4 h-3 w-52 max-w-full")}
            <div className="grid max-w-md grid-cols-2 gap-3 sm:gap-10">
              <div className="min-w-0 space-y-1.5">
                {barDashboard("h-9 w-20 rounded-md")}
                {barDashboard("h-2 w-16")}
              </div>
              <div className="min-w-0 space-y-1.5">
                {barDashboard("h-9 w-20 rounded-md")}
                {barDashboard("h-2 w-20")}
              </div>
            </div>
          </div>

          <div className="mb-6 grid min-w-0 grid-cols-12 gap-3 sm:gap-4 lg:gap-5">
            <div
              className="col-span-12 flex min-h-[180px] min-w-0 flex-col rounded-xl border border-[#D6E6FF] p-4 sm:p-4 md:px-6 md:py-5 lg:col-span-7"
              style={{
                background: "linear-gradient(135deg, #F0F7FF 0%, #F4F8FF 100%)",
                boxShadow: "0 1px 8px rgba(15, 23, 42, 0.05)",
              }}
            >
              {barDashboard("mb-2 h-2 w-28")}
              <div className="flex flex-wrap items-end justify-between gap-2">
                {barDashboard("h-16 max-w-[7rem] rounded-lg")}
                {barDashboard("h-3.5 w-24")}
              </div>
              {barDashboard("mt-2 h-2.5 w-20")}
            </div>

            <div className="col-span-12 flex min-h-0 min-w-0 flex-col gap-3 sm:gap-4 lg:col-span-5">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="min-h-[92px] min-w-0 rounded-xl border border-[#EEF2F6] bg-white p-3.5 shadow-[0_1px_6px_rgba(15,23,42,0.04)] sm:p-4"
                >
                  {barDashboard("mb-1 h-2 w-20")}
                  <div className="flex items-end justify-between gap-2">
                    {barDashboard("h-10 w-16 rounded-md")}
                    {barDashboard("h-3 w-6")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-[140px] min-w-0 rounded-xl border border-[#EEF2F6] bg-white p-3.5 shadow-[0_1px_6px_rgba(15,23,42,0.04)] sm:p-4">
            <div className="mb-2 flex min-w-0 flex-col gap-2 border-b border-[#F1F5F9] pb-2 sm:flex-row sm:items-center sm:justify-between">
              {barDashboard("h-5 w-24")}
              {barDashboard("h-9 w-28 shrink-0 rounded-md")}
            </div>
            <div className="space-y-1 pt-2">
              {[0, 1].map((row) => (
                <div key={row} className="flex items-start gap-2 py-1 sm:gap-2.5">
                  {barDashboard("h-8 w-8 shrink-0 rounded-md sm:h-9 sm:w-9")}
                  <div className="min-w-0 flex-1 space-y-1 pt-0.5">
                    {barDashboard("h-2.5 w-full max-w-xl")}
                    {barDashboard("h-2 w-24")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ClinicalInboxSkeleton() {
  return (
    <div className="flex h-full min-h-[320px] flex-col px-6 py-10" style={{ background: "#F7F9FC" }}>
      {bar("mx-auto h-10 w-48")}
      <div className="mx-auto mt-8 w-full max-w-md space-y-2">
        {bar("h-3.5 w-full")}
        {bar("h-3.5 w-4/5")}
      </div>
    </div>
  );
}

export function ClinicalInboxDetailSkeleton() {
  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden" style={{ background: "#F7F9FC" }}>
      <div className="border-b border-[rgba(15,23,42,0.06)] bg-white/90 px-6 py-8 md:px-10">
        {bar("mb-3 h-8 max-w-lg")}
        {bar("h-3.5 w-44")}
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto bg-white px-6 py-8 md:px-10">
        {bar("h-48 max-w-xl rounded-xl")}
        {bar("h-24 max-w-xl rounded-lg")}
      </div>
    </div>
  );
}

/** Relay board: three slim columns, same radii as real board. */
export function ClinicalTaskDetailSkeleton() {
  return (
    <div className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`} style={{ background: "#F7F9FC" }}>
      <div className="mx-auto w-full max-w-4xl">
      {bar("mb-6 h-4 w-40")}
      <div className="space-y-4 rounded-xl border border-[rgba(15,23,42,0.06)] bg-white/[0.97] p-5 shadow-sm">
        {bar("h-8 max-w-md")}
        {bar("mt-4 h-24 w-full")}
        {bar("mt-6 h-10 w-full rounded-lg")}
      </div>
      </div>
    </div>
  );
}

export function ClinicalRelayBoardSkeleton() {
  return (
    <div className={`min-h-[60vh] ${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`} style={{ background: "#F7F9FC" }}>
      <div className="mb-8 space-y-3">
        {bar("h-9 w-40")}
        {bar("h-3.5 w-64 max-w-full")}
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex min-h-[280px] flex-col rounded-xl border border-[rgba(15,23,42,0.06)] bg-white/[0.85] p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
          >
            {bar("mb-4 h-4 w-24")}
            <div className="space-y-3">
              {bar("h-20 w-full rounded-lg")}
              {bar("h-20 w-full rounded-lg")}
              {bar("h-16 w-full rounded-lg")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
