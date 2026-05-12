import { clinicalWorkspaceFrame, clinicalWorkspaceVerticalPadding } from "@/lib/clinical-ui";
import { clinicalCorePanel, clinicalDividerBorder } from "@/lib/pilot-surface";

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

/** Ruhige, statische Balken für Posteingang — kein Puls (Punkt 6: klinisch, keine Schein-Aktivität). */
const inboxBarStatic = (className: string) => (
  <div
    className={`rounded-md bg-[#E2E8F0]/85 dark:bg-slate-600/30 ${className}`}
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

/**
 * Ladezustand für `/inbox` (nur **Seiten-Segment** rechts im Split): ruhige statische Balken,
 * gleiche Tönung wie Tracker — kein Puls, keine „vollen“ Fake-Zeilen (Punkt 6).
 */
export function ClinicalInboxSkeleton() {
  return (
    <section
      className="flex h-full min-h-[280px] flex-1 flex-col items-center justify-center px-6 md:px-10"
      style={{ background: "#F7F9FC", paddingTop: "32px", paddingBottom: "40px" }}
      aria-busy="true"
      aria-label="Inhalt wird geladen"
    >
      <div className="w-full max-w-md space-y-2.5">
        {inboxBarStatic("mx-auto h-2 w-28 md:mx-0")}
        {inboxBarStatic("h-2.5 w-full max-w-lg")}
        {inboxBarStatic("h-2.5 w-[88%] max-w-lg")}
      </div>
    </section>
  );
}

/** Ladezustand `/inbox/[id]`: statische Balken, an **Split-Layout** (Haupt + Hilfsspalte ab `lg`) und Foto-Höhe (~220px) angelehnt — Punkt 6. */
export function ClinicalInboxDetailSkeleton() {
  const padX = "clamp(20px, 4vw, 56px)";
  const headerPad = { padding: `clamp(28px, 5vw, 48px) ${padX} 0` };

  return (
    <div
      className="flex h-full min-h-0 w-full flex-1 touch-manipulation flex-col overflow-x-hidden overflow-y-hidden lg:flex-row"
      style={{ background: "#F7F9FC" }}
      aria-busy="true"
      aria-label="Fall wird geladen"
      role="status"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F7F9FC]">
        <div
          className="z-[6] shrink-0 bg-white max-lg:sticky max-lg:top-0 max-lg:shadow-[0_1px_0_rgba(15,23,42,0.06)] lg:static lg:shadow-none"
          style={headerPad}
        >
          {inboxBarStatic("mb-2 h-6 max-w-[min(100%,20rem)] sm:h-7")}
          {inboxBarStatic("h-2.5 w-44 max-w-[85%]")}
        </div>
        <div
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-white [-webkit-overflow-scrolling:touch] max-lg:scroll-pb-8"
          style={{
            padding: `24px ${padX} clamp(72px, 18vw, 120px)`,
          }}
        >
          <div
            className="max-w-xl rounded-xl bg-[#EEF2F6]"
            style={{ height: "min(220px, 42vh)", minHeight: "160px" }}
            aria-hidden
          />
          <div className="mt-8 max-w-xl space-y-2.5">
            {inboxBarStatic("h-2.5 w-full")}
            {inboxBarStatic("h-2.5 w-[94%]")}
            {inboxBarStatic("h-2.5 w-[72%]")}
          </div>
          <div className="mt-10 max-w-[520px] rounded-xl bg-[#F8FAFC] p-5">
            {inboxBarStatic("mb-1 h-3 w-44")}
            {inboxBarStatic("mb-4 h-2.5 w-full max-w-sm")}
            {inboxBarStatic("mb-3 h-11 w-full max-w-md rounded-[9px]")}
            {inboxBarStatic("mb-3 h-10 w-full max-w-md rounded-[9px]")}
            {inboxBarStatic("h-8 w-[200px] rounded-md")}
          </div>
        </div>
      </div>

      <aside
        className="hidden min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-[#E5E7EB] bg-[#F7F9FC] pb-[max(12px,env(safe-area-inset-bottom))] lg:flex lg:w-[min(100%,380px)] lg:max-w-[400px] lg:border-l lg:border-t-0 lg:pb-0"
        aria-hidden
      >
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-[#E5E7EB] bg-white"
          style={{ margin: "16px 14px 20px", padding: "16px 14px" }}
        >
          {inboxBarStatic("mb-4 h-2 w-28")}
          {inboxBarStatic("mb-4 h-32 w-full rounded-md")}
          {inboxBarStatic("h-11 w-full rounded-[10px]")}
        </div>
      </aside>
    </div>
  );
}

/**
 * Ladegerüst **Aufgabendetail** (`/my-tasks/[id]`) — **Punkt 6 (Loading):** nur `loading.tsx`; **statische**
 * Balken (`inboxBarStatic`), **kein** Puls, **keine** Chat-/Ticket-Skeleton-Animation. Abstände und Panelflächen an
 * `TaskDetailView` (`clinicalCorePanel`, `mb-8` / `mb-10`, Kommentar-`space-y-6`) — ruhige Koordination, kein
 * Realtime-/Ops-Schein. Aktionspanel immer gezeigt: bei Task `done` entfällt es nach dem Laden (kleiner Sprung,
 * selten — s. `page.tsx` Punkt 6). **Punkt 9:** äußerer Rahmen `min-w-0 overflow-x-hidden` wie `TaskDetailView`.
 */
export function ClinicalTaskDetailSkeleton() {
  return (
    <div
      className="min-h-0 min-w-0 flex-1 overflow-x-hidden"
      style={{ background: "#F7F9FC" }}
      aria-busy="true"
      aria-label="Aufgabe wird geladen"
      role="status"
    >
      <div className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
        <div className="mx-auto w-full min-w-0 max-w-4xl">
          <div className="mb-6 inline-flex min-h-10 items-center sm:mb-8" aria-hidden>
            {inboxBarStatic("h-4 w-48 rounded-lg")}
          </div>

          <div className={`mb-8 p-4 sm:p-5 ${clinicalCorePanel}`}>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                {inboxBarStatic("h-8 w-full max-w-2xl sm:h-9")}
              </div>
              {inboxBarStatic("h-8 w-[5.75rem] shrink-0 rounded-full")}
            </div>
            {inboxBarStatic("mb-4 h-[4.5rem] w-full max-w-3xl rounded-md")}
            <div
              className={`grid grid-cols-1 gap-2 border-t pt-4 sm:grid-cols-2 xl:grid-cols-3 ${clinicalDividerBorder}`}
              aria-hidden
            >
              {inboxBarStatic("h-3.5 w-full max-w-xs")}
              {inboxBarStatic("h-3.5 w-full max-w-[220px]")}
              {inboxBarStatic("h-3.5 w-full max-w-[200px]")}
            </div>
            {inboxBarStatic("mt-3 h-2.5 w-full max-w-xl")}
          </div>

          <div className={`mb-10 p-4 sm:p-5 ${clinicalCorePanel}`} aria-hidden>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {inboxBarStatic("h-10 w-[min(100%,11rem)] rounded-lg")}
              {inboxBarStatic("h-10 w-[min(100%,10rem)] rounded-lg")}
            </div>
          </div>

          <section className={`space-y-6 p-4 sm:p-5 ${clinicalCorePanel}`} aria-hidden>
            <div className="space-y-1.5">
              {inboxBarStatic("h-4 w-32")}
              {inboxBarStatic("h-3 w-full max-w-lg")}
            </div>
            <div className="flex min-h-[3rem] flex-col justify-center">
              {inboxBarStatic("h-2.5 w-[min(100%,28rem)]")}
            </div>
            <div className={`border-t pt-4 ${clinicalDividerBorder}`}>
              {inboxBarStatic("h-10 w-full max-w-2xl rounded-lg")}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Relay / „Meine Aufgaben“-Board: **statische** Platzhalter (Punkt 6 — kein Puls), Layout an `RelayWorkspaceView` + `CardBoard` (`min-w-[980px]`). **Punkt 9:** horizontaler Streifen wie Board (`overscroll-x-contain`, Safe-Area). */
export function ClinicalRelayBoardSkeleton() {
  return (
    <div
      className="min-h-0 flex-1"
      style={{ background: "#F7F9FC" }}
      aria-busy="true"
      aria-label="Aufgaben werden geladen"
      role="status"
    >
      <div className={`min-h-[56vh] ${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            {inboxBarStatic("h-8 w-36 rounded-lg sm:h-9 sm:w-40")}
            {inboxBarStatic("h-3.5 w-full max-w-[640px]")}
            {inboxBarStatic("h-3.5 w-[min(100%,520px)]")}
          </div>
          <div className="inline-flex shrink-0 gap-1 self-start rounded-[10px] p-1 ring-1 ring-[#E2E8F0]" aria-hidden>
            {inboxBarStatic("h-8 w-[7.5rem] rounded-md")}
            {inboxBarStatic("h-8 w-[9rem] rounded-md")}
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[980px] grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  {inboxBarStatic("h-3.5 w-28 rounded")}
                  {inboxBarStatic("h-5 w-7 shrink-0 !rounded-full")}
                </div>
                <div className="space-y-3">
                  {inboxBarStatic("h-20 w-full rounded-lg")}
                  {inboxBarStatic("h-20 w-full rounded-lg")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
