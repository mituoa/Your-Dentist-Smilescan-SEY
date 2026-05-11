import { ClinicalInboxSkeleton } from "@/components/workspace/clinical-route-skeleton";

/** Route-Segment-Fallback für `/inbox` — siehe `ClinicalInboxSkeleton`. */
export default function InboxLoading() {
  return <ClinicalInboxSkeleton />;
}
