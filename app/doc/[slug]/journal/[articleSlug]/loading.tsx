export default function ArticleLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[680px] mx-auto px-6 py-12 md:py-20">
        <div className="h-4 w-32 animate-pulse rounded bg-ink/5" />

        <header className="mt-16 mb-12">
          <div className="h-3 w-24 animate-pulse rounded bg-ink/5 mb-6" />
          <div className="h-12 w-full animate-pulse rounded bg-ink/5 mb-4" />
          <div className="h-12 w-3/4 animate-pulse rounded bg-ink/5 mb-8" />
          <div className="h-6 w-2/3 animate-pulse rounded bg-ink/5 mb-10" />
          <div className="border-t border-border pt-6">
            <div className="h-3 w-48 animate-pulse rounded bg-ink/5" />
          </div>
        </header>

        <div className="space-y-6">
          <div className="h-5 w-full animate-pulse rounded bg-ink/5" />
          <div className="h-5 w-full animate-pulse rounded bg-ink/5" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-ink/5" />
          <div className="h-5 w-full animate-pulse rounded bg-ink/5" />
          <div className="h-5 w-5/6 animate-pulse rounded bg-ink/5" />
          <div className="h-5 w-full animate-pulse rounded bg-ink/5" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-ink/5" />
        </div>
      </div>
    </div>
  );
}
