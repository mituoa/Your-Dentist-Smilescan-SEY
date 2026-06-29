import { Suspense } from "react";

import { InboxDetailLoader } from "@/components/inbox/inbox-detail-loader";
import { InboxMobileBack } from "@/components/inbox/inbox-mobile-back";
import { YdSkeleton } from "@/components/design-system/yd-skeleton";

interface InboxDetailPageProps {
  params: Promise<{ id: string }>;
}

function InboxDetailBodySkeleton() {
  return (
    <div className="space-y-4 py-2" role="status" aria-live="polite" aria-label="Fallinhalt wird geladen">
      <YdSkeleton className="h-40 w-full rounded-xl" variant="calm" />
      <YdSkeleton className="h-28 w-full rounded-xl" variant="calm" />
      <div className="yd-skeleton-card">
        <YdSkeleton className="mb-3 h-4 w-32" />
        <YdSkeleton className="h-20 w-full" variant="calm" />
      </div>
    </div>
  );
}

export default async function InboxDetailPage({ params }: InboxDetailPageProps) {
  const { id } = await params;

  return (
    <div className="yd-tracker-v4-detail yd-tracker-mobile-case-view flex h-full min-h-0 flex-1 flex-col overflow-hidden max-md:overflow-hidden">
      <div className="yd-tracker-v4-detail__bar yd-tracker-mobile-case-view__bar shrink-0 px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))] max-md:sticky max-md:top-0 max-md:z-[6] md:px-6 md:pt-4">
        <Suspense fallback={null}>
          <InboxMobileBack />
        </Suspense>
      </div>

      <div className="yd-tracker-v4-detail__scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-[max(1.25rem,var(--safe-area-bottom))] md:px-6 md:pb-8 md:pt-2">
        <Suspense fallback={<InboxDetailBodySkeleton />}>
          <InboxDetailLoader submissionId={id} />
        </Suspense>
      </div>
    </div>
  );
}
