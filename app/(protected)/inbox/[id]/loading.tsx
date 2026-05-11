import { ClinicalInboxDetailSkeleton } from "@/components/workspace/clinical-route-skeleton";

/** Route-Segment-Fallback für `/inbox/[id]` — siehe `ClinicalInboxDetailSkeleton`. */
export default function InboxDetailLoading() {
  return <ClinicalInboxDetailSkeleton />;
}
