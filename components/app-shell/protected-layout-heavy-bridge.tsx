import { Suspense } from "react";

import { CommandWorkspaceHydration } from "@/components/command-ai/command-workspace-hydration";
import { WorkspaceIntegratedHeaderBridge } from "@/components/app-shell/workspace-integrated-header-bridge";
import { loadProtectedLayoutHeavyData } from "@/lib/app-shell/protected-layout-heavy-data";
import type { ProtectedLayoutHeavyData } from "@/lib/app-shell/protected-layout-heavy-data";
import type { ThemePreference } from "@/lib/theme";

type ProtectedLayoutHeavyBridgeProps = {
  workspaceId: string;
  userId: string;
  role: "doctor" | "team";
  inboxCount?: number;
  tasksOverdue: number;
  practicePhone: string | null;
  appointmentUrl: string | null;
  email: string;
  workspaceName: string;
  initialTheme: ThemePreference;
  displayName: string;
  avatarUrl: string | null;
};

function ProtectedLayoutCommandHydration({
  data,
}: {
  data: Pick<
    ProtectedLayoutHeavyData,
    "commandPatients" | "practicePhone" | "appointmentUrl"
  >;
}) {
  return (
    <CommandWorkspaceHydration
      patients={data.commandPatients}
      practicePhone={data.practicePhone}
      appointmentUrl={data.appointmentUrl}
    />
  );
}

async function ProtectedLayoutHeavyInner(props: ProtectedLayoutHeavyBridgeProps) {
  const data = await loadProtectedLayoutHeavyData({
    workspaceId: props.workspaceId,
    userId: props.userId,
    role: props.role,
    inboxCount: props.inboxCount,
    tasksOverdue: props.tasksOverdue,
    practicePhone: props.practicePhone,
    appointmentUrl: props.appointmentUrl,
  });

  return (
    <>
      <ProtectedLayoutCommandHydration data={data} />
      <WorkspaceIntegratedHeaderBridge
        email={props.email}
        workspaceName={props.workspaceName}
        workspaceId={props.workspaceId}
        role={props.role}
        initialTheme={props.initialTheme}
        displayName={props.displayName}
        avatarUrl={props.avatarUrl}
        inboxCount={props.inboxCount}
        trackerHeaderSummary={data.trackerHeaderSummary}
        dashboardHeaderSummary={data.dashboardHeaderSummary}
        relayHeaderSummary={data.relayHeaderSummary}
      />
    </>
  );
}

export function ProtectedLayoutHeavyBridge(props: ProtectedLayoutHeavyBridgeProps) {
  return (
    <Suspense
      fallback={
        <WorkspaceIntegratedHeaderBridge
          email={props.email}
          workspaceName={props.workspaceName}
          workspaceId={props.workspaceId}
          role={props.role}
          initialTheme={props.initialTheme}
          displayName={props.displayName}
          avatarUrl={props.avatarUrl}
          inboxCount={props.inboxCount}
        />
      }
    >
      <ProtectedLayoutHeavyInner {...props} />
    </Suspense>
  );
}
