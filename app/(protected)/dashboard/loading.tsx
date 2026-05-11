import { ClinicalDashboardSkeleton } from "@/components/workspace/clinical-route-skeleton";

/**
 * Route-Loading für `/dashboard`: gleicher Canvas wie die fertige Seite, strukturiertes Skeleton
 * ohne KPI-Ziffern (siehe `ClinicalDashboardSkeleton`). Kein technischer Lade-Text in der UI.
 * Produktgrenzen (MVP, Nice/Future/Non-MVP, Priorität/Freeze): JSDoc in
 * `app/(protected)/dashboard/page.tsx` (Punkte 11–13).
 */
export default function DashboardLoading() {
  return <ClinicalDashboardSkeleton />;
}
