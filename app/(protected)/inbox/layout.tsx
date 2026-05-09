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

export default async function InboxLayout({ children }: InboxLayoutProps) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login?error=workspace_missing");

  const listResult = await getInboxSubmissions(workspace.workspace_id);
  const listFailed = !listResult.ok;
  const submissions = listResult.ok ? listResult.items : [];
  const openCaseCount = submissions.filter((s) => !s.is_draft).length;

  return (
    <div className="relative h-full min-h-0" style={{ background: "#FAFBFC" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(47,128,237,0.05), transparent 32%)",
        }}
      />

      <div className="relative z-10 flex min-h-0 max-md:flex-col max-md:overflow-y-auto md:h-full md:overflow-hidden">
        {/* LEFT LIST PANE */}
        <aside
          className="flex min-h-0 w-full min-w-0 flex-col max-md:max-h-[42vh] max-md:border-b max-md:border-slate-200/80 md:w-[38%] md:max-w-[480px] md:min-w-[280px]"
          style={{
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
                {listFailed
                  ? "Liste momentan nicht verfügbar"
                  : `${openCaseCount} offene ${openCaseCount === 1 ? "Fall" : "Fälle"}`}
              </p>
            </div>

            <Suspense fallback={<SearchFallback />}>
              <InboxSearchFigma />
            </Suspense>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: "8px 12px" }}>
            {listFailed ? (
              <div
                className="mx-2 rounded-xl border px-4 py-4 text-[13px]"
                style={{ borderColor: "#E2E8F0", color: "#64748B", background: "#FFFFFF" }}
              >
                Die Einsendungen konnten nicht geladen werden. Bitte die Seite in Kürze erneut
                öffnen.
              </div>
            ) : submissions.length === 0 ? (
              <div
                className="mx-2 rounded-xl border px-4 py-6 text-center text-[13px]"
                style={{ borderColor: "#E2E8F0", color: "#64748B", background: "#FFFFFF" }}
              >
                <p className="font-medium text-[#0F172A]">Noch keine Einsendungen</p>
                <p className="mt-2 leading-relaxed">
                  Sobald Patienten Fotos einreichen, erscheinen die Fälle hier.
                </p>
              </div>
            ) : (
              submissions.map((s) => (
                <SubmissionListItemFigma
                  key={s.id}
                  id={s.id}
                  patientName={s.patient_name}
                  patientNotes={s.patient_notes}
                  createdAt={s.created_at}
                  seenAt={s.seen_at}
                  isDraft={s.is_draft}
                  urgency={s.urgency}
                />
              ))
            )}
          </div>
        </aside>

        {/* RIGHT DETAIL PANE */}
        <section
          className="min-h-0 min-w-0 flex-1 overflow-hidden max-md:min-h-[50vh]"
          style={{ background: "#FFFFFF" }}
        >
          {children}
        </section>
      </div>
    </div>
  );
}
