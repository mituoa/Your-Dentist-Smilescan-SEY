import { cn } from "@/lib/utils";

type YdSkeletonProps = {
  className?: string;
  variant?: "shimmer" | "pulse" | "calm";
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
  style?: React.CSSProperties;
};

export function YdSkeleton({
  className,
  variant = "shimmer",
  rounded = "md",
  style,
}: YdSkeletonProps) {
  const roundedClass =
    rounded === "sm"
      ? "yd-skeleton--rounded-sm"
      : rounded === "lg"
        ? "yd-skeleton--rounded-lg"
        : rounded === "xl"
          ? "yd-skeleton--rounded-xl"
          : rounded === "full"
            ? "yd-skeleton--rounded-full"
            : "";

  const variantClass =
    variant === "pulse"
      ? "yd-skeleton--pulse"
      : variant === "calm"
        ? "yd-skeleton--calm"
        : "";

  return (
    <div
      className={cn("yd-skeleton", variantClass, roundedClass, className)}
      style={style}
      aria-hidden
    />
  );
}

type YdSkeletonPageProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function YdSkeletonPage({ label, children, className, style }: YdSkeletonPageProps) {
  return (
    <div
      className={cn("yd-skeleton-page", className)}
      style={style}
      aria-busy="true"
      aria-label={label}
      role="status"
    >
      {children}
    </div>
  );
}

type YdSkeletonTableRowsProps = {
  rows?: number;
  showAvatar?: boolean;
  className?: string;
};

export function YdSkeletonTableRows({
  rows = 6,
  showAvatar = true,
  className,
}: YdSkeletonTableRowsProps) {
  return (
    <div className={cn("yd-skeleton-table__body", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="yd-skeleton-table__row">
          {showAvatar ? <YdSkeleton className="h-9 w-9 shrink-0" rounded="lg" /> : null}
          <div className="yd-skeleton-table__row-main">
            <YdSkeleton className="h-4 w-[min(100%,14rem)]" />
            <YdSkeleton className="h-3 w-[min(100%,20rem)]" variant="calm" />
            <div className="yd-skeleton-table__row-meta">
              <YdSkeleton className="h-5 w-16" rounded="full" variant="calm" />
              <YdSkeleton className="h-5 w-20" rounded="full" variant="calm" />
              <YdSkeleton className="h-3 w-12" variant="calm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function YdSkeletonTableShell({
  label,
  rows = 6,
  chipCount = 4,
  className,
}: {
  label: string;
  rows?: number;
  chipCount?: number;
  className?: string;
}) {
  return (
    <YdSkeletonPage label={label} className={className}>
      <div className="yd-skeleton-table">
        <div className="yd-skeleton-table__head">
          <YdSkeleton className="mb-2 h-6 w-36" />
          <YdSkeleton className="h-3 w-48" variant="calm" />
          <div className="yd-skeleton-table__toolbar">
            <YdSkeleton className="h-10 w-full max-w-md rounded-xl" variant="calm" />
            <div className="yd-skeleton-table__chips">
              {Array.from({ length: chipCount }).map((_, i) => (
                <YdSkeleton key={i} className="h-9 w-[4.5rem]" rounded="full" variant="calm" />
              ))}
            </div>
          </div>
        </div>
        <YdSkeletonTableRows rows={rows} />
      </div>
    </YdSkeletonPage>
  );
}

export function YdSkeletonRelayWorkspace({ label = "Relay wird geladen" }: { label?: string }) {
  return (
    <YdSkeletonPage
      label={label}
      className="yd-relay flex min-h-[50vh] flex-1 flex-col py-2 md:py-3"
      style={{ background: "#F7F9FC" }}
    >
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-[rgba(176,192,208,0.22)] pb-2.5">
        <YdSkeleton className="h-7 w-28" />
        <YdSkeleton className="h-9 w-36 rounded-lg" variant="calm" />
      </div>
      <div className="mb-2 flex gap-2">
        {[0, 1, 2].map((i) => (
          <YdSkeleton key={i} className="h-9 w-24" rounded="full" variant="calm" />
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-[24px] border border-[rgba(160,178,198,0.38)] bg-white shadow-sm">
        <YdSkeleton className="h-10 w-full rounded-none" variant="calm" />
        <div className="divide-y divide-[rgba(180,198,218,0.22)]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="min-w-0 flex-1 space-y-1.5">
                <YdSkeleton className="h-3.5 w-full max-w-md" />
                <YdSkeleton className="h-3 w-32" variant="calm" />
              </div>
              <YdSkeleton className="h-5 w-16" rounded="full" variant="calm" />
            </div>
          ))}
        </div>
      </div>
    </YdSkeletonPage>
  );
}

export function YdSkeletonProfileEditor() {
  return (
    <YdSkeletonPage
      label="Profil wird geladen"
      className="flex h-full min-h-0 flex-1 flex-col"
      style={{ backgroundColor: "#EDECE8" }}
    >
      <div className="yd-skeleton-profile-split min-h-[min(56dvh,560px)] flex-1">
        <div className="yd-skeleton-profile-split__preview">
          <YdSkeleton className="yd-skeleton-profile-split__portrait" rounded="xl" />
          <div className="mx-auto mt-6 w-full max-w-sm space-y-2.5 md:mx-0">
            <YdSkeleton className="mx-auto h-2.5 w-24 md:mx-0" variant="calm" />
            <YdSkeleton className="mx-auto h-8 w-48 md:mx-0" />
            <YdSkeleton className="mx-auto h-2.5 w-56 md:mx-0" variant="calm" />
          </div>
        </div>
        <div className="yd-skeleton-profile-split__editor">
          <YdSkeleton className="mb-4 h-3 w-32" variant="calm" />
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="yd-skeleton-accordion-item">
                <YdSkeleton className="h-3.5 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </YdSkeletonPage>
  );
}

export function YdSkeletonThreadList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="yd-skeleton-thread-list" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="yd-skeleton-thread">
          <YdSkeleton className="h-3.5 w-[min(100%,12rem)]" />
          <YdSkeleton className="h-3 w-full max-w-sm" variant="calm" />
        </div>
      ))}
    </div>
  );
}

/** Subtiler Button-Fortschritt — kein Spinner. */
export function YdInlineBusy({
  className,
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) {
  return (
    <span
      className={cn("yd-inline-busy", inverse && "yd-inline-busy--inverse", className)}
      aria-hidden
    >
      <span className="yd-inline-busy__bar" />
    </span>
  );
}
