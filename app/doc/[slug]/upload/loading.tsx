export default function UploadLoading() {
  return (
    <div className="mx-auto max-w-xl px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-12">
      <div className="mb-6 h-5 w-32 animate-pulse rounded bg-surface-sunken sm:mb-8" />

      <div className="mb-8 sm:mb-10">
        <div className="mb-2 h-3 w-20 animate-pulse rounded bg-surface-sunken sm:mb-3" />
        <div className="mb-3 h-9 w-3/4 animate-pulse rounded bg-surface-sunken" />
        <div className="h-5 w-full animate-pulse rounded bg-surface-sunken" />
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-1.5 h-4 w-16 animate-pulse rounded bg-surface-sunken" />
          <div className="h-10 w-full animate-pulse rounded bg-surface-sunken" />
        </div>
        <div>
          <div className="mb-1.5 h-4 w-16 animate-pulse rounded bg-surface-sunken" />
          <div className="h-10 w-full animate-pulse rounded bg-surface-sunken" />
        </div>
        <div>
          <div className="mb-1.5 h-4 w-24 animate-pulse rounded bg-surface-sunken" />
          <div className="h-10 w-full animate-pulse rounded bg-surface-sunken" />
        </div>
        <div>
          <div className="mb-1.5 h-4 w-28 animate-pulse rounded bg-surface-sunken" />
          <div className="h-24 w-full animate-pulse rounded bg-surface-sunken" />
        </div>
        <div>
          <div className="mb-1.5 h-4 w-14 animate-pulse rounded bg-surface-sunken" />
          <div className="h-32 w-full animate-pulse rounded-lg border-2 border-dashed border-border" />
        </div>
      </div>
    </div>
  );
}
