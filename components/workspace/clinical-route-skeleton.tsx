import { clinicalWorkspaceFrame, clinicalWorkspaceVerticalPadding } from "@/lib/clinical-ui";

/**
 * Subtle blue-gray loading placeholders — aligned with Tracker / Figma (no warm paper blocks).
 */
const pulse = "animate-[clinicalSkeletonPulse_2s_ease-in-out_infinite]";

const bar = (className: string) => (
  <div
    className={`rounded-lg bg-[#E2E8F7]/45 ${pulse} dark:bg-slate-600/25 ${className}`}
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

export function ClinicalDashboardSkeleton() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#F7F9FC" }}>
      <div className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding} space-y-6`}>
        <div className="space-y-3 border-b border-[rgba(15,23,42,0.06)] pb-6">
          {bar("h-8 w-56")}
          {bar("h-3.5 w-40")}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {bar("h-14 flex-1 rounded-xl")}
            {bar("h-14 flex-1 rounded-xl")}
          </div>
        </div>
        <div className="grid grid-cols-12 gap-6">
          {bar("col-span-12 h-48 rounded-2xl lg:col-span-7")}
          <div className="col-span-12 flex flex-col gap-5 lg:col-span-5">
            {bar("h-36 rounded-2xl")}
            {bar("h-36 rounded-2xl")}
          </div>
        </div>
        {bar("h-56 rounded-2xl")}
      </div>
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
