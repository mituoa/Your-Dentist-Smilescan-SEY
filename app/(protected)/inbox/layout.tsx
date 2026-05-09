import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

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
      style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
      aria-hidden
    />
  );
}

export default async function InboxLayout({ children }: InboxLayoutProps) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login?error=workspace_missing");

  const role = (workspace.role || "team") as "doctor" | "team";

  const listResult = await getInboxSubmissions(workspace.workspace_id);
  const listFailed = !listResult.ok;
  const submissions = listResult.ok ? listResult.items : [];
  const openCaseCount = submissions.filter((s) => !s.is_draft).length;

  return (
    <div className="relative flex h-full min-h-0 flex-col" style={{ background: "#F7F9FC" }}>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        {/* Linke Fallliste — Figma: ~40 %, max 480, ruhige Fläche */}
        <aside
          className="flex min-h-0 w-full min-w-0 flex-col border-b border-[rgba(15,23,42,0.06)] md:w-[40%] md:max-w-[480px] md:min-w-[280px] md:border-b-0 md:border-r md:border-[rgba(15,23,42,0.06)]"
          style={{ background: "#F8FAFC" }}
        >
          <div style={{ padding: "40px 24px 0" }} className="max-md:pt-8">
            <div
              style={{ marginBottom: "24px" }}
              className="flex items-start justify-between gap-4"
            >
              <div>
                <h1
                  className="text-[17px]"
                  style={{
                    color: "#0F172A",
                    fontWeight: 600,
                    letterSpacing: "-0.015em",
                    marginBottom: "8px",
                  }}
                >
                  Einsendungen
                </h1>
                <p className="text-[14px]" style={{ color: "#2B6FE8", fontWeight: 600 }}>
                  {listFailed
                    ? "Liste momentan nicht verfügbar"
                    : `${openCaseCount} offene ${openCaseCount === 1 ? "Fall" : "Fälle"}`}
                </p>
              </div>
              {role === "doctor" ? (
                <Link
                  href="/create-case"
                  title="Neuer Fall"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-white transition hover:opacity-95"
                  style={{
                    background: "#2B6FE8",
                    boxShadow: "0 2px 4px rgba(43,111,232,0.2)",
                  }}
                >
                  <Plus className="h-5 w-5" strokeWidth={2} />
                </Link>
              ) : null}
            </div>

            <Suspense fallback={<SearchFallback />}>
              <InboxSearchFigma />
            </Suspense>
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
            style={{ padding: "28px 12px 20px" }}
          >
            {listFailed ? (
              <div
                className="mx-1 rounded-xl px-4 py-5 text-[14px] leading-relaxed"
                style={{ color: "#64748B", background: "rgba(255,255,255,0.85)" }}
              >
                Die Einsendungen konnten nicht geladen werden. Bitte die Seite in Kürze erneut
                öffnen.
              </div>
            ) : submissions.length === 0 ? (
              <div
                className="mx-1 rounded-xl px-4 py-8 text-center text-[14px] leading-relaxed"
                style={{ color: "#64748B", background: "rgba(255,255,255,0.85)" }}
              >
                <p className="font-medium" style={{ color: "#0F172A" }}>
                  Noch keine Einsendungen
                </p>
                <p className="mt-2">
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

        {/* Mitte + rechte Spalte: Kind-Routen */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F7F9FC] md:min-h-0">
          {children}
        </section>
      </div>
    </div>
  );
}
