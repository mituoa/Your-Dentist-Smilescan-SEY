export default function InboxLoading() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-6">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-surface-sunken/75" />
      <div className="mt-6 h-4 w-72 max-w-full animate-pulse rounded bg-surface-sunken/55" />
      <div className="mt-3 h-4 w-56 max-w-full animate-pulse rounded bg-surface-sunken/45" />
    </div>
  );
}
