export default function InboxDetailLoading() {
  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden bg-surface-card">
      <div className="animate-pulse border-b border-border/80 px-8 py-8">
        <div className="mb-3 h-8 w-full max-w-lg rounded-lg bg-surface-sunken/75" />
        <div className="h-4 w-48 rounded bg-surface-sunken/55" />
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-8 py-8">
        <div className="h-48 w-full max-w-xl animate-pulse rounded-xl bg-surface-sunken/50" />
        <div className="h-24 w-full max-w-xl animate-pulse rounded-lg bg-surface-sunken/40" />
      </div>
    </div>
  );
}
