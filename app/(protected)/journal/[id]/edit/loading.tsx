export default function EditArticleLoading() {
  return (
    <div
      className="min-h-screen bg-slate-50"
      aria-busy="true"
      aria-label="Editor wird geladen"
    >
      <header className="fixed top-0 left-0 right-0 z-30 border-b border-slate-800 bg-slate-900/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-4">
            <div className="h-5 w-16 rounded bg-slate-700/60" />
            <div className="h-5 w-14 rounded bg-slate-700/40" />
          </div>
          <div className="h-8 w-28 rounded-lg bg-slate-700/50" />
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 pt-20 pb-12 md:px-6">
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="h-5 w-32 rounded bg-slate-100/80" />
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-24 rounded-lg bg-slate-100/60" />
            <div className="h-8 w-28 rounded-lg bg-slate-100/40" />
            <div className="h-8 w-20 rounded-lg bg-slate-100/40" />
          </div>
        </div>
        <div className="mb-6">
          <div className="h-12 w-3/4 rounded bg-slate-100/50" />
          <div className="mt-3 h-4 w-16 rounded bg-slate-100/40" />
        </div>
        <div className="mb-12">
          <div className="h-5 w-2/3 rounded bg-slate-100/40" />
        </div>
        <div className="space-y-4 pt-8">
          <div className="h-5 w-full rounded bg-slate-100/30" />
          <div className="h-5 w-5/6 rounded bg-slate-100/25" />
          <div className="h-5 w-4/5 rounded bg-slate-100/20" />
          <div className="h-5 w-full rounded bg-slate-100/20" />
          <div className="h-5 w-3/4 rounded bg-slate-100/15" />
        </div>
      </div>
    </div>
  );
}
