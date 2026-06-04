import { loadRelayWorkspaceData } from "@/app/(protected)/my-tasks/relay-server-data";
import { RelayWorkspaceView } from "@/components/my-tasks/relay-workspace-view";

interface RelayPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RelayPage({ searchParams }: RelayPageProps) {
  const data = await loadRelayWorkspaceData(searchParams);

  return (
    <RelayWorkspaceView
      basePath="/relay"
      userId={data.userId}
      userEmail={data.userEmail}
      isDoctor={data.isDoctor}
      columns={data.columns}
      counts={data.counts}
      assignableMembers={data.assignableMembers}
      conversations={data.conversations}
      submissionDraftStatus={data.submissionDraftStatus}
    />
  );
}
