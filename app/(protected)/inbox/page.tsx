import { redirect } from "next/navigation";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getInboxSubmissions } from "@/lib/queries/inbox";
import { InboxDesktopAutoSelect } from "@/components/inbox/inbox-desktop-auto-select";

interface InboxPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const workspace = await getCurrentWorkspace();
  const params = await searchParams;

  if (!workspace) {
    redirect("/login?error=workspace_missing");
  }

  const listResult = await getInboxSubmissions(workspace.workspace_id, params.q);

  if (!listResult.ok) {
    return (
      <div
        className="flex h-full min-h-[280px] flex-col items-center justify-center px-6"
        style={{ padding: "32px 40px 40px" }}
      >
        <p className="max-w-md text-center text-[15px] font-medium" style={{ color: "#0F172A" }}>
          Posteingang kann nicht geladen werden
        </p>
        <p
          className="mt-3 max-w-md text-center text-[14px] leading-relaxed"
          style={{ color: "#64748B" }}
        >
          Bitte versuchen Sie es in einem Moment erneut. Wenn das Problem bleibt, laden Sie die Seite
          neu.
        </p>
      </div>
    );
  }

  const submissions = listResult.items;

  if (submissions.length > 0) {
    const desktopHref = params.q?.trim()
      ? `/inbox/${submissions[0].id}?q=${encodeURIComponent(params.q)}`
      : `/inbox/${submissions[0].id}`;

    return <InboxDesktopAutoSelect href={desktopHref} />;
  }

  return (
    <div
      className="flex h-full min-h-[280px] flex-col items-center justify-center"
      style={{ padding: "32px 40px 40px" }}
    >
      <p className="text-center text-[15px] font-medium" style={{ color: "#0F172A" }}>
        Noch keine Einsendungen
      </p>
      <p className="mt-3 max-w-md text-center text-[14px] leading-relaxed" style={{ color: "#64748B" }}>
        Ihr Posteingang ist leer. Neue Fälle erscheinen automatisch, sobald Einsendungen eintreffen.
      </p>
    </div>
  );
}
