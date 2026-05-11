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
            "radial-gradient(circle at top right, rgba(47,128,237,0.05), transparent 32%)",
        }}
      />
      <section
        className={`clinical-dashboard-skeleton relative min-w-0 touch-manipulation ${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}
        aria-busy="true"
        aria-label="Übersicht wird geladen"
      >
        <div className="min-w-0 w-full max-w-full">
          <div
            className="mb-8 overflow-hidden pb-6"
            style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}
          >
            {barDashboard("mb-2 h-8 max-w-[min(100%,20rem)]")}
            {barDashboard("mb-3 h-3.5 w-52 max-w-full")}
            <div className="mb-6 max-w-2xl space-y-2">
              {barDashboard("h-3.5 w-full")}
              {barDashboard("h-3.5 w-[94%]")}
              {barDashboard("h-3.5 w-[68%]")}
            </div>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {barDashboard("h-11 w-11 shrink-0 rounded-lg")}
                <div className="min-w-0 flex-1 space-y-2">
                  {barDashboard("h-4 w-full max-w-[11rem]")}
                  {barDashboard("h-3 w-full max-w-[9rem]")}
                </div>
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {barDashboard("h-11 w-11 shrink-0 rounded-lg")}
                <div className="min-w-0 flex-1 space-y-2">
                  {barDashboard("h-4 w-full max-w-[12rem]")}
                  {barDashboard("h-3 w-full max-w-[8rem]")}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10 grid min-w-0 grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
            <div
              className="col-span-12 flex min-h-[240px] min-w-0 flex-col rounded-2xl border border-[#D6E6FF] p-5 sm:p-6 md:px-8 md:py-7 lg:col-span-7"
              style={{
                background: "linear-gradient(135deg, #F0F7FF 0%, #F4F8FF 100%)",
                boxShadow: "0 2px 12px rgba(15, 23, 42, 0.06)",
              }}
            >
              {barDashboard("mb-4 h-2.5 w-44")}
              <div className="mb-4 space-y-3">
                {barDashboard("h-12 max-w-[5.5rem] rounded-lg")}
                {barDashboard("h-3.5 w-full max-w-md")}
                {barDashboard("h-3.5 w-40")}
              </div>
              {barDashboard("mt-5 h-4 w-36")}
            </div>

            <div className="col-span-12 flex min-h-0 min-w-0 flex-col gap-5 sm:gap-6 lg:col-span-5">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="min-h-[132px] min-w-0 rounded-2xl border border-[#EEF2F6] bg-white p-5 pb-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-6 sm:pb-5"
                >
                  {barDashboard("mb-4 h-3 w-36")}
                  {barDashboard("h-9 w-14 rounded-lg")}
                  {barDashboard("mt-3 h-3 w-40")}
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-[200px] min-w-0 rounded-2xl border border-[#EEF2F6] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-6 md:px-8 md:py-7">
            <div className="mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="min-w-0 space-y-2">
                {barDashboard("h-5 w-44")}
                {barDashboard("h-3 w-full max-w-lg")}
              </div>
              {barDashboard("h-11 w-[8.5rem] shrink-0 rounded-xl")}
            </div>
            <div className="space-y-4">
              {[0, 1].map((row) => (
                <div key={row} className="flex items-start gap-3 py-1 max-lg:py-2.5">
                  {barDashboard("h-11 w-11 shrink-0 rounded-lg")}
                  <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                    {barDashboard("h-3.5 w-full max-w-xl")}
                    {barDashboard("h-2.5 w-32")}
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
