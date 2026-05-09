export default function InboxDetailLoading() {
  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden" style={{ background: "#FFFFFF" }}>
      <div className="animate-pulse border-b border-slate-200/80 px-8 py-8">
        <div className="mb-3 h-8 w-full max-w-lg rounded-lg bg-slate-200/70" />
        <div className="h-4 w-48 rounded bg-slate-200/50" />
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-8 py-8">
        <div className="h-48 w-full max-w-xl animate-pulse rounded-xl bg-slate-200/40" />
        <div className="h-24 w-full max-w-xl animate-pulse rounded-lg bg-slate-200/35" />
      </div>
    </div>
  );
}
