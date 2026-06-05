import {
  ClinicalDashboardDesktopSkeleton,
  ClinicalDashboardSkeleton,
} from "@/components/workspace/clinical-route-skeleton";

export default function DashboardLoading() {
  return (
    <>
      <ClinicalDashboardSkeleton />
      <ClinicalDashboardDesktopSkeleton />
    </>
  );
}
