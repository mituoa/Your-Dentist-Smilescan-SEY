import { loadRelayWorkspaceData } from "@/app/(protected)/my-tasks/relay-server-data";
import { RelayWorkspaceView } from "@/components/my-tasks/relay-workspace-view";

interface MyTasksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MyTasksPage({ searchParams }: MyTasksPageProps) {
  const data = await loadRelayWorkspaceData(searchParams);

  return (
    <RelayWorkspaceView
      basePath="/my-tasks"
      userId={data.userId}
      userEmail={data.userEmail}
      isDoctor={data.isDoctor}
      columns={data.columns}
      counts={data.counts}
      assignableMembers={data.assignableMembers}
      conversations={data.conversations}
      journalDrafts={data.journalDrafts}
      submissionDraftStatus={data.submissionDraftStatus}
    />
  );
}
