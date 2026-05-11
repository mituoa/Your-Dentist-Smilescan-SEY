import { ClinicalInboxDetailSkeleton } from "@/components/workspace/clinical-route-skeleton";

/** Route-Segment-Fallback für `/inbox/[id]` — `ClinicalInboxDetailSkeleton` (Punkt 2: ruhiger Ladezustand bei Navigation/Reload). */
export default function InboxDetailLoading() {
  return <ClinicalInboxDetailSkeleton />;
}
