import { redirect } from "next/navigation";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getInboxSubmissions } from "@/lib/queries/inbox";

interface InboxPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const workspace = await getCurrentWorkspace();
  const params = await searchParams;

  if (!workspace) {
    redirect("/login?error=workspace_missing");
  }

  const submissions = await getInboxSubmissions(
    workspace.workspace_id,
    params.q
  );

  // Default to first submission in split view.
  if (submissions.length > 0) {
    const next = params.q?.trim()
      ? `/inbox/${submissions[0].id}?q=${encodeURIComponent(params.q)}`
      : `/inbox/${submissions[0].id}`;
    redirect(next);
  }

  return (
    <div
      className="h-full flex items-center justify-center"
      style={{ padding: "32px 40px 40px" }}
    >
      <p className="text-[14px]" style={{ color: "#64748B" }}>
        Noch keine Einsendungen.
      </p>
    </div>
  );
}
