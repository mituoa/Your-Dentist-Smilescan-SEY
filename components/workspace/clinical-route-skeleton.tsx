import { clinicalWorkspaceFrame, clinicalWorkspaceVerticalPadding } from "@/lib/clinical-ui";
import {
  YdSkeleton,
  YdSkeletonPage,
  YdSkeletonProfileEditor,
  YdSkeletonRelayWorkspace,
  YdSkeletonTableRows,
  YdSkeletonTableShell,
} from "@/components/design-system/yd-skeleton";

export function ClinicalMinimalSkeleton() {
  return (
    <YdSkeletonPage
      label="Inhalt wird geladen"
      className="flex min-h-[280px] flex-col gap-4 px-6 py-10"
      style={{ background: "#F7F9FC" }}
    >
      <YdSkeleton className="h-9 w-44" />
      <YdSkeleton className="h-3 w-56 max-w-full" variant="calm" />
      <YdSkeleton className="h-24 w-full max-w-md rounded-xl" variant="calm" />
    </YdSkeletonPage>
  );
}

export function ClinicalDashboardSkeleton() {
  return (
    <div className="relative min-h-screen overflow-x-hidden md:hidden" style={{ background: "#F7F9FC" }}>
      <YdSkeletonPage
        label="Übersicht wird geladen"
        className={`clinical-dashboard-skeleton relative min-w-0 touch-manipulation ${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}
      >
        <div className="min-w-0 w-full max-w-full space-y-4">
          <div className="space-y-2 border-b border-[rgba(226,232,240,0.6)] pb-4">
            <YdSkeleton className="h-3 w-24" variant="calm" />
            <YdSkeleton className="h-7 w-48 max-w-full" />
            <YdSkeleton className="h-3.5 w-56 max-w-full" variant="calm" />
          </div>
          <YdSkeleton className="h-[4.5rem] w-full rounded-2xl" variant="calm" />
          <div className="grid grid-cols-2 gap-3">
            <YdSkeleton className="h-24 rounded-2xl" variant="calm" />
            <YdSkeleton className="h-24 rounded-2xl" variant="calm" />
          </div>
          <YdSkeletonCardRows rows={3} />
        </div>
      </YdSkeletonPage>
    </div>
  );
}

function YdSkeletonCardRows({ rows }: { rows: number }) {
  return (
    <div className="yd-skeleton-card space-y-3">
      <div className="flex items-center justify-between gap-2">
        <YdSkeleton className="h-5 w-28" />
        <YdSkeleton className="h-3 w-16" variant="calm" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-start gap-2.5 py-1">
            <YdSkeleton className="h-9 w-9 shrink-0 rounded-lg" variant="calm" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <YdSkeleton className="h-3 w-full max-w-xs" />
              <YdSkeleton className="h-2.5 w-20" variant="calm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ClinicalDashboardDesktopSkeleton() {
  return (
    <div className="relative hidden min-h-screen overflow-x-hidden md:block" style={{ background: "#F7F9FC" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at top right, rgba(47,128,237,0.035), transparent 34%)",
        }}
      />
      <YdSkeletonPage
        label="Übersicht wird geladen"
        className={`clinical-dashboard-skeleton relative min-w-0 touch-manipulation ${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}
      >
        <div className="min-w-0 w-full max-w-full">
          <div className="mb-5 overflow-hidden border-b border-[rgba(226,232,240,0.6)] pb-4">
            <YdSkeleton className="mb-1.5 h-8 max-w-[min(100%,20rem)]" variant="calm" />
            <YdSkeleton className="mb-4 h-3 w-52 max-w-full" variant="calm" />
            <div className="grid max-w-md grid-cols-2 gap-3 sm:gap-10">
              <div className="min-w-0 space-y-1.5">
                <YdSkeleton className="h-9 w-20" variant="calm" />
                <YdSkeleton className="h-2 w-16" variant="calm" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <YdSkeleton className="h-9 w-20" variant="calm" />
                <YdSkeleton className="h-2 w-20" variant="calm" />
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
              <YdSkeleton className="mb-2 h-2 w-28" variant="calm" />
              <div className="flex flex-wrap items-end justify-between gap-2">
                <YdSkeleton className="h-16 max-w-[7rem] rounded-lg" variant="calm" />
                <YdSkeleton className="h-3.5 w-24" variant="calm" />
              </div>
              <YdSkeleton className="mt-2 h-2.5 w-20" variant="calm" />
            </div>

            <div className="col-span-12 flex min-h-0 min-w-0 flex-col gap-3 sm:gap-4 lg:col-span-5">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="min-h-[92px] min-w-0 rounded-xl border border-[#EEF2F6] bg-white p-3.5 shadow-[0_1px_6px_rgba(15,23,42,0.04)] sm:p-4"
                >
                  <YdSkeleton className="mb-1 h-2 w-20" variant="calm" />
                  <div className="flex items-end justify-between gap-2">
                    <YdSkeleton className="h-10 w-16" variant="calm" />
                    <YdSkeleton className="h-3 w-6" variant="calm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <YdSkeletonCardRows rows={2} />
        </div>
      </YdSkeletonPage>
    </div>
  );
}

export function ClinicalInboxSkeleton() {
  return (
    <div className="flex h-full min-h-[320px] flex-col px-3 py-3 md:px-0 md:py-0" style={{ background: "#F7F9FC" }}>
      <YdSkeletonTableShell label="Praxis-Inbox wird geladen" rows={7} chipCount={5} />
    </div>
  );
}

export function ClinicalInboxDetailSkeleton() {
  return (
    <div
      className="yd-inbox-detail-root flex h-full min-h-0 flex-col overflow-hidden"
      style={{ background: "#F7F9FC" }}
    >
      <YdSkeletonPage label="Patientenfall wird geladen" className="flex h-full min-h-0 flex-col">
        <div className="border-b border-[rgba(15,23,42,0.06)] bg-white/90 px-5 py-6 md:px-10 md:py-8">
          <YdSkeleton className="mb-3 h-8 max-w-lg" />
          <YdSkeleton className="h-3.5 w-44" variant="calm" />
          <div className="mt-4 flex flex-wrap gap-2">
            {[0, 1, 2].map((i) => (
              <YdSkeleton key={i} className="h-8 w-24" rounded="full" variant="calm" />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto bg-white px-5 py-6 md:px-10 md:py-8">
          <YdSkeleton className="h-40 max-w-xl rounded-xl" variant="calm" />
          <YdSkeleton className="h-28 max-w-xl rounded-xl" variant="calm" />
          <div className="yd-skeleton-card max-w-xl">
            <YdSkeleton className="mb-3 h-4 w-32" />
            <YdSkeleton className="h-20 w-full" variant="calm" />
          </div>
        </div>
      </YdSkeletonPage>
    </div>
  );
}

export function ClinicalTaskDetailSkeleton() {
  return (
    <YdSkeletonPage
      label="Aufgabe wird geladen"
      className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}
      style={{ background: "#F7F9FC" }}
    >
      <div className="mx-auto w-full max-w-4xl">
        <YdSkeleton className="mb-6 h-4 w-40" variant="calm" />
        <div className="space-y-4 rounded-xl border border-[rgba(15,23,42,0.06)] bg-white/[0.97] p-5 shadow-sm">
          <YdSkeleton className="h-8 max-w-md" />
          <YdSkeleton className="h-24 w-full" variant="calm" />
          <YdSkeleton className="h-10 w-full rounded-lg" variant="calm" />
        </div>
      </div>
    </YdSkeletonPage>
  );
}

export function ClinicalRelayBoardSkeleton() {
  return <YdSkeletonRelayWorkspace />;
}

export function ClinicalProfileHubSkeleton() {
  return (
    <YdSkeletonPage
      label="Praxisübersicht wird geladen"
      className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}
    >
      <div className="mx-auto w-full min-w-0 max-w-4xl space-y-8 overflow-x-hidden">
        <div className="min-h-[10.5rem] space-y-3 md:min-h-[11.5rem]">
          <YdSkeleton className="h-2.5 w-24" variant="calm" />
          <YdSkeleton className="min-h-[2rem] max-w-md md:min-h-[2.25rem]" />
          <YdSkeleton className="h-2.5 max-w-xl" variant="calm" />
          <YdSkeleton className="h-2.5 max-w-lg" variant="calm" />
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 md:items-stretch md:gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`flex min-h-[200px] min-w-0 flex-col rounded-lg border bg-surface-card p-5 sm:p-6 md:min-h-[220px] ${
                i === 1 ? "border-dashed border-border" : "border-border"
              }`}
            >
              <YdSkeleton className="mb-3 h-5 w-5 shrink-0" variant="calm" />
              <YdSkeleton className="mb-2 h-5 max-w-[14rem]" />
              <YdSkeleton className="h-3 max-w-full" variant="calm" />
              <YdSkeleton className="mt-1.5 h-3 max-w-[90%]" variant="calm" />
            </div>
          ))}
        </div>
      </div>
    </YdSkeletonPage>
  );
}

export function ClinicalProfileEditorSkeleton() {
  return <YdSkeletonProfileEditor />;
}

export function ClinicalSettingsSkeleton() {
  return (
    <YdSkeletonPage
      label="Einstellungen werden geladen"
      className="yd-settings-v2 yd-clinical-brand relative flex min-h-0 flex-1 flex-col overflow-auto"
    >
      <div className="yd-settings-v2__frame pb-12">
        <div className="yd-settings-v2__layout">
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <YdSkeleton key={i} className="h-10 w-full max-w-[200px] rounded-xl" variant="calm" />
            ))}
          </div>
          <YdSkeleton className="h-[26rem] w-full rounded-[18px]" variant="calm" />
        </div>
      </div>
    </YdSkeletonPage>
  );
}

export function ClinicalJournalSkeleton() {
  return (
    <YdSkeletonPage
      label="Journal wird geladen"
      className="yd-journal-v6 yd-clinical-brand relative flex min-h-0 flex-1 flex-col overflow-auto"
    >
      <div className={`yd-journal-v6__frame ${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
        <div className="mb-10 space-y-3 border-b border-[rgba(26,43,74,0.06)] pb-10">
          <YdSkeleton className="h-3 w-24" variant="calm" />
          <YdSkeleton className="h-12 w-40" />
          <YdSkeleton className="h-5 w-56" />
          <YdSkeleton className="h-4 w-full max-w-sm" variant="calm" />
          <YdSkeleton className="h-3 w-64" variant="calm" />
        </div>
        <YdSkeleton className="mb-8 h-12 w-full rounded-[14px]" variant="calm" />
        <div className="space-y-4">
          <YdSkeleton className="h-8 w-48" />
          {[0, 1, 2].map((i) => (
            <YdSkeleton key={i} className="h-16 w-full" variant="calm" />
          ))}
        </div>
      </div>
    </YdSkeletonPage>
  );
}

export function ClinicalCreateCaseSkeleton() {
  return (
    <YdSkeletonPage
      label="Formular wird geladen"
      className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding} py-10`}
      style={{ background: "#F7F9FC" }}
    >
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <YdSkeleton className="h-8 w-56" />
        <YdSkeleton className="h-4 w-72" variant="calm" />
        <div className="yd-skeleton-card space-y-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <YdSkeleton className="h-3 w-24" variant="calm" />
              <YdSkeleton className="h-11 w-full rounded-[10px]" variant="calm" />
            </div>
          ))}
          <YdSkeleton className="h-11 w-36 rounded-lg" />
        </div>
      </div>
    </YdSkeletonPage>
  );
}

export { YdSkeletonTableRows };
