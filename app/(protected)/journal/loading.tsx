import {
  clinicalWorkspaceFrame,
  clinicalWorkspaceVerticalPadding,
} from "@/lib/clinical-ui";

export default function JournalLoading() {
  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col overflow-auto"
      style={{ background: "#F7F9FC" }}
      aria-busy="true"
      aria-label="Journal wird geladen"
    >
      <div className="relative flex-1 overflow-auto">
        <div
          className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding} pb-16 md:pb-24`}
        >
          <div className="mx-auto w-full max-w-[min(760px,100%)]">
            <div className="mb-12">
              <div className="h-9 w-56 rounded bg-slate-200/60" />
              <div className="mt-3 h-4 w-72 rounded bg-slate-100/80" />
            </div>
            <div className="mb-16">
              <div className="inline-flex gap-1 rounded-full bg-slate-100/60 p-1.5">
                <div className="h-9 w-20 rounded-full bg-white/80" />
                <div className="h-9 w-28 rounded-full bg-transparent" />
                <div className="h-9 w-24 rounded-full bg-transparent" />
              </div>
            </div>
            <div className="space-y-5">
              <div className="h-14 rounded-xl bg-slate-100/60" />
              <div className="h-14 rounded-xl bg-slate-100/40" />
              <div className="h-14 rounded-xl bg-slate-100/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
