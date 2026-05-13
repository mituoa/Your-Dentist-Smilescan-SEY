export default function JournalIndexLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="h-4 w-32 animate-pulse rounded bg-ink/5" />

        <header className="mt-16 mb-20 pb-10 border-b-2 border-ink/10 text-center">
          <div className="mx-auto h-3 w-16 animate-pulse rounded bg-ink/5 mb-3" />
          <div className="mx-auto h-4 w-40 animate-pulse rounded bg-ink/5" />
        </header>

        <div className="space-y-16">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-3 w-28 animate-pulse rounded bg-ink/5 mb-4" />
              <div className="h-10 w-4/5 animate-pulse rounded bg-ink/5 mb-4" />
              <div className="h-5 w-3/5 animate-pulse rounded bg-ink/5 mb-4" />
              <div className="h-3 w-36 animate-pulse rounded bg-ink/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
