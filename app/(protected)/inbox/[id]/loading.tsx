import { ClinicalInboxDetailSkeleton } from "@/components/workspace/clinical-route-skeleton";

/** Route-Segment-Fallback für `/inbox/[id]` — `ClinicalInboxDetailSkeleton` (Punkt 6: ruhig, strukturtreu, ohne Puls). */
export default function InboxDetailLoading() {
  return <ClinicalInboxDetailSkeleton />;
}
