import { loadRelayWorkspaceData } from "@/app/(protected)/my-tasks/relay-server-data";
import { RelayWorkspaceView } from "@/components/my-tasks/relay-workspace-view";
import { WorkspaceMobileShortcutsBar } from "@/components/workspace/workspace-mobile-shortcuts-bar";

interface RelayPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RelayPage({ searchParams }: RelayPageProps) {
  const data = await loadRelayWorkspaceData(searchParams);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <WorkspaceMobileShortcutsBar />
      <RelayWorkspaceView
        basePath="/relay"
        userId={data.userId}
        userEmail={data.userEmail}
        isDoctor={data.isDoctor}
        columns={data.columns}
        counts={data.counts}
        assignableMembers={data.assignableMembers}
        conversations={data.conversations}
      />
    </div>
  );
}
