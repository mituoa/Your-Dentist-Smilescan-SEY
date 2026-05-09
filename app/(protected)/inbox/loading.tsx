export default function InboxLoading() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-6">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200/70" />
      <div className="mt-6 h-4 w-72 max-w-full animate-pulse rounded bg-slate-200/50" />
      <div className="mt-3 h-4 w-56 max-w-full animate-pulse rounded bg-slate-200/40" />
    </div>
  );
}
