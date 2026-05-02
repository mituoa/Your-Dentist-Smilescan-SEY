import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getInboxSubmissions } from "@/lib/queries/inbox";
import { InboxSearchFigma } from "@/components/inbox/inbox-search-figma";
import { SubmissionListItemFigma } from "@/components/inbox/submission-list-item-figma";

interface InboxLayoutProps {
  children: React.ReactNode;
}

function SearchFallback() {
  return (
    <div
      className="h-10 w-full rounded-lg"
      style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
      aria-hidden
    />
  );
}

export default async function InboxLayout({
  children,
}: InboxLayoutProps) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login?error=workspace_missing");

  // Layouts don't receive searchParams in Next.js app router.
  // We fetch without filtering here; the page redirect + detail view are still correct.
  const submissions = await getInboxSubmissions(workspace.workspace_id);
  const openCaseCount = submissions.filter((s) => !s.is_draft).length;

  return (
    <div className="h-full flex relative" style={{ background: "#FAFBFC" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(47,128,237,0.05), transparent 32%)",
        }}
      />

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* LEFT LIST PANE */}
        <aside
          className="flex flex-col"
          style={{
            width: "38%",
            maxWidth: "480px",
            minWidth: "380px",
            background: "#FAFBFC",
          }}
        >
          <div
            style={{
              padding: "24px 20px",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <h1
                className="text-[18px]"
                style={{
                  color: "#0F172A",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  marginBottom: "4px",
                }}
              >
                Einsendungen
              </h1>
              <p className="text-[13px]" style={{ color: "#2F80ED", fontWeight: 500 }}>
                {openCaseCount} offene {openCaseCount === 1 ? "Fall" : "Fälle"}
              </p>
            </div>

            <Suspense fallback={<SearchFallback />}>
              <InboxSearchFigma />
            </Suspense>
          </div>

          <div className="flex-1 overflow-y-auto" style={{ padding: "8px 12px" }}>
            {submissions.map((s) => (
              <SubmissionListItemFigma
                key={s.id}
                id={s.id}
                patientName={s.patient_name}
                patientNotes={s.patient_notes}
                createdAt={s.created_at}
                seenAt={s.seen_at}
                isDraft={s.is_draft}
              />
            ))}
          </div>
        </aside>

        {/* RIGHT DETAIL PANE */}
        <section className="flex-1 overflow-hidden" style={{ background: "#FFFFFF" }}>
          {children}
        </section>
      </div>
    </div>
  );
}

