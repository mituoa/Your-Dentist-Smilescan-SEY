export default function SettingsLoading() {
  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col overflow-auto"
      style={{ background: "#F7F9FC" }}
      aria-busy="true"
      aria-label="Einstellungen werden geladen"
    >
      <div className="mx-auto w-full max-w-[640px] px-4 sm:px-6 md:px-10 py-6 md:py-8 pb-24">
        <div style={{ paddingTop: 96, marginBottom: 72 }}>
          <div className="h-10 w-48 rounded bg-slate-100/70" />
          <div className="mt-3 h-4 w-64 rounded bg-slate-100/50" />
        </div>

        {/* Ihre Praxis */}
        <div style={{ marginBottom: 96 }}>
          <div className="h-5 w-28 rounded bg-slate-100/60 mb-6" />
          <div className="space-y-6">
            <div className="h-11 w-full rounded-[10px] bg-slate-100/40" />
            <div className="h-[120px] w-full rounded-[10px] bg-slate-100/30" />
            <div className="flex gap-2">
              <div className="h-11 w-11 rounded-[10px] bg-slate-100/40" />
              <div className="h-11 w-11 rounded-[10px] bg-slate-100/30" />
              <div className="h-11 w-11 rounded-[10px] bg-slate-100/30" />
              <div className="h-11 w-11 rounded-[10px] bg-slate-100/30" />
            </div>
          </div>
        </div>

        {/* Team */}
        <div style={{ marginBottom: 96 }}>
          <div className="h-5 w-32 rounded bg-slate-100/60 mb-6" />
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded bg-slate-100/50" />
                <div className="h-3 w-44 rounded bg-slate-100/30" />
              </div>
              <div className="h-3 w-20 rounded bg-slate-100/30" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-4 w-28 rounded bg-slate-100/40" />
                <div className="h-3 w-40 rounded bg-slate-100/25" />
              </div>
              <div className="h-3 w-16 rounded bg-slate-100/25" />
            </div>
          </div>
        </div>

        {/* Integrationen */}
        <div style={{ marginBottom: 96 }}>
          <div className="h-5 w-28 rounded bg-slate-100/60 mb-6" />
          <div className="h-11 w-full rounded-[10px] bg-slate-100/40" />
        </div>

        {/* Konto */}
        <div style={{ marginBottom: 96 }}>
          <div className="h-5 w-16 rounded bg-slate-100/60 mb-6" />
          <div className="h-11 w-full rounded-[10px] bg-slate-100/40 mb-4" />
          <div className="h-4 w-24 rounded bg-slate-100/30" />
        </div>
      </div>
    </div>
  );
}
