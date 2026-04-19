import { Suspense } from "react";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getInboxSubmissions } from "@/lib/queries/inbox";
import { SubmissionListItem } from "@/components/inbox/submission-list-item";
import { InboxSearch } from "@/components/inbox/inbox-search";

interface InboxPageProps {
  searchParams: Promise<{ q?: string }>;
}

function InboxSearchFallback() {
  return (
    <div className="relative mb-6 h-10 rounded border border-border bg-surface-card animate-pulse" />
  );
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const workspace = await getCurrentWorkspace();
  const params = await searchParams;

  if (!workspace) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-text-secondary">Workspace wird geladen…</p>
      </div>
    );
  }

  const submissions = await getInboxSubmissions(
    workspace.workspace_id,
    params.q
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Inbox
        </p>
        <h1 className="font-serif text-5xl font-light tracking-tight text-text-primary">
          Einsendungen
        </h1>
      </div>

      <Suspense fallback={<InboxSearchFallback />}>
        <InboxSearch />
      </Suspense>

      {submissions.length === 0 ? (
        <div className="bg-surface-card border border-border rounded-lg p-12 text-center">
          <p className="text-text-secondary">
            {params.q
              ? "Keine Einsendungen gefunden."
              : "Noch keine Einsendungen."}
          </p>
        </div>
      ) : (
        <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
          {submissions.map((s) => (
            <SubmissionListItem
              key={s.id}
              id={s.id}
              patientName={s.patient_name}
              patientEmail={s.patient_email}
              createdAt={s.created_at}
              seenAt={s.seen_at}
              photoCount={s.photo_count}
            />
          ))}
        </div>
      )}
    </div>
  );
}
