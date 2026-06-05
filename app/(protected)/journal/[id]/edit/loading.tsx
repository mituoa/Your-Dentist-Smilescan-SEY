import { YdSkeleton, YdSkeletonPage } from "@/components/design-system/yd-skeleton";

export default function EditArticleLoading() {
  return (
    <YdSkeletonPage
      label="Editor wird geladen"
      className="min-h-screen"
      style={{ background: "#F7F9FC" }}
    >
      <header className="fixed top-0 left-0 right-0 z-30 border-b border-slate-800 bg-slate-900/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-4">
            <YdSkeleton className="h-5 w-16 opacity-40" variant="calm" />
            <YdSkeleton className="h-5 w-14 opacity-30" variant="calm" />
          </div>
          <YdSkeleton className="h-8 w-28 rounded-lg opacity-35" variant="calm" />
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 pt-20 pb-12 md:px-6">
        <div className="yd-skeleton-card mb-6">
          <YdSkeleton className="h-5 w-32" />
          <div className="mt-4 flex gap-2">
            <YdSkeleton className="h-8 w-24 rounded-lg" variant="calm" />
            <YdSkeleton className="h-8 w-28 rounded-lg" variant="calm" />
            <YdSkeleton className="h-8 w-20 rounded-lg" variant="calm" />
          </div>
        </div>
        <YdSkeleton className="mb-3 h-12 w-3/4 max-w-xl" />
        <YdSkeleton className="mb-12 h-4 w-16" variant="calm" />
        <div className="space-y-4 pt-4">
          {[100, 83, 80, 100, 75].map((w, i) => (
            <YdSkeleton key={i} className="h-5" style={{ width: `${w}%` }} variant="calm" />
          ))}
        </div>
      </div>
    </YdSkeletonPage>
  );
}
