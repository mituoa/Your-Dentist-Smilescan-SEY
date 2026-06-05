import { WorkspaceMobileQuickActions } from "@/components/app-shell/workspace-mobile-quick-actions";
import { cn } from "@/lib/utils";

type DashboardMobileActionsProps = {
  className?: string;
};

/** Dashboard-Leiste — nutzt globale Mobile-Quick-Actions. */
export function DashboardMobileActions({ className }: DashboardMobileActionsProps) {
  return <WorkspaceMobileQuickActions className={className} variant="bar" />;
}
