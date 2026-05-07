import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import {
  getNewSubmissionsCount,
  getTotalUnseenSubmissions,
  getOpenTasks,
  getRecentActivity,
} from "@/lib/queries/dashboard";
import { AlertCircle, Clock, FileText, CheckCircle2, ClipboardList } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();

  if (!user || !workspace) {
    redirect("/login?error=workspace_missing");
  }

  if (workspace.role === "team") {
    redirect("/my-tasks");
  }

  const workspaceId = workspace.workspace_id;

  const supabase = await createClient();
  const { data: profileData } = await supabase
    .from("profile_data")
    .select("display_name")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const displayName =
    profileData?.display_name || user.email?.split("@")[0] || "";

  const [newCount, totalUnseen, tasks, activity] = await Promise.all([
    getNewSubmissionsCount(workspaceId),
    getTotalUnseenSubmissions(workspaceId),
    getOpenTasks(workspaceId),
    getRecentActivity(workspaceId),
  ]);

  const todayLabel = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen relative" style={{ background: "#F8FAFC" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(47,128,237,0.05), transparent 32%)",
        }}
      />

      <div className="relative">
        <div className="mx-auto max-w-[1240px] px-10 py-8">
          <div
            className="mb-8 overflow-hidden pb-6"
            style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}
          >
            <h1
              className="mb-2 text-[28px] font-semibold"
              style={{
                color: "#1E293B",
                letterSpacing: "-0.01em",
                lineHeight: "1.2",
              }}
            >
              Willkommen zurück, {displayName}
            </h1>
            <p className="mb-6 text-[13px]" style={{ color: "#64748B" }}>
              {todayLabel}
            </p>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: "rgba(47,128,237,0.08)" }}
                >
                  <Clock className="h-[18px] w-[18px]" style={{ color: "#2F80ED" }} />
                </div>
                <div>
                  <p className="text-[15px] font-semibold" style={{ color: "#1E293B" }}>
                    {newCount} neue Fälle
                  </p>
                  <p className="text-[13px]" style={{ color: "#64748B" }}>
                    in den letzten 24h
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: "rgba(47,128,237,0.08)" }}
                >
                  <AlertCircle className="h-[18px] w-[18px]" style={{ color: "#2F80ED" }} />
                </div>
                <div>
                  <p className="text-[15px] font-semibold" style={{ color: "#1E293B" }}>
                    {totalUnseen} offen
                  </p>
                  <p className="text-[13px]" style={{ color: "#64748B" }}>
                    benötigen Aufmerksamkeit
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10 grid grid-cols-12 gap-6">
            <div
              className="col-span-12 lg:col-span-7"
              style={{
                background: "linear-gradient(135deg, #F0F7FF 0%, #F4F8FF 100%)",
                border: "1px solid #D6E6FF",
                borderRadius: "16px",
                padding: "28px 32px",
                boxShadow: "0 8px 24px rgba(47, 128, 237, 0.12)",
              }}
            >
              <p
                className="mb-4 text-[10px] uppercase"
                style={{
                  color: "#2F80ED",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  opacity: 0.9,
                }}
              >
                Erfordert Aufmerksamkeit
              </p>
              <p
                className="leading-none"
                style={{
                  fontSize: "64px",
                  color: "#0B4EA3",
                  fontWeight: 650,
                  letterSpacing: "-0.03em",
                  marginBottom: "18px",
                }}
              >
                {totalUnseen}
              </p>
              <p
                className="text-[13px]"
                style={{
                  color: "#475569",
                  lineHeight: "1.5",
                  fontWeight: 500,
                }}
              >
                {totalUnseen === 1
                  ? "1 Fall benötigt sofortige Bearbeitung"
                  : `${totalUnseen} Fälle benötigen sofortige Bearbeitung`}
              </p>
            </div>

            <div className="col-span-12 lg:col-span-5 grid grid-cols-1 gap-6">
              <div
                className="bg-white"
                style={{
                  border: "1px solid #EEF2F6",
                  borderRadius: "16px",
                  padding: "28px 24px 20px 24px",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                }}
              >
                <div className="mb-4 flex items-start justify-between">
                  <p className="text-[12px]" style={{ color: "#64748B", fontWeight: 500 }}>
                    Offene Aufgaben
                  </p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px]"
                    style={{
                      color: "#16A34A",
                      background: "#EAFBF1",
                      fontWeight: 600,
                    }}
                  >
                    {tasks.length}
                  </span>
                </div>
                <p
                  className="text-[40px] leading-none"
                  style={{ color: "#0F172A", letterSpacing: "-0.03em", fontWeight: 600 }}
                >
                  {tasks.length}
                </p>
              </div>

              <div
                className="bg-white"
                style={{
                  border: "1px solid #EEF2F6",
                  borderRadius: "16px",
                  padding: "28px 24px 20px 24px",
                  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                }}
              >
                <div className="mb-4 flex items-start justify-between">
                  <p className="text-[12px]" style={{ color: "#64748B", fontWeight: 500 }}>
                    Neue Einsendungen
                  </p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px]"
                    style={{
                      color: "#16A34A",
                      background: "#EAFBF1",
                      fontWeight: 600,
                    }}
                  >
                    +{newCount}
                  </span>
                </div>
                <p
                  className="text-[40px] leading-none"
                  style={{ color: "#0F172A", letterSpacing: "-0.03em", fontWeight: 600 }}
                >
                  {newCount}
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-white"
            style={{
              padding: "28px 32px",
              borderRadius: "16px",
              border: "1px solid #EEF2F6",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  className="mb-1 text-[18px] font-semibold"
                  style={{ color: "#1E293B", letterSpacing: "-0.01em" }}
                >
                  Letzte Aktivitäten
                </h2>
                <p className="text-[13px]" style={{ color: "#64748B" }}>
                  Medizinisches Aktivitätsprotokoll
                </p>
              </div>
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-[14px] font-medium transition-colors"
                style={{ color: "#2F80ED", background: "rgba(47,128,237,0.08)" }}
              >
                Alle anzeigen
              </button>
            </div>

            <div className="space-y-6">
              {(activity || []).map((event) => {
                const Icon =
                  event.type === "submission_received"
                    ? FileText
                    : event.type === "task_done"
                      ? CheckCircle2
                      : ClipboardList;

                return (
                  <div key={event.id} className="flex items-start gap-3">
                    <div
                      className="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center"
                      style={{
                        background: "#F8FAFC",
                        borderRadius: "8px",
                      }}
                    >
                      <Icon className="h-[20px] w-[20px]" style={{ color: "#64748B" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="mb-1 text-[14px]"
                        style={{ color: "#0F172A", fontWeight: 600, lineHeight: "1.4" }}
                      >
                        {event.text}
                      </p>
                      <p className="text-[11px]" style={{ color: "#94A3B8" }}>
                        {new Date(event.timestamp).toLocaleString("de-DE")}
                      </p>
                    </div>
                  </div>
                );
              })}
              {activity.length === 0 ? (
                <p className="text-[13px]" style={{ color: "#64748B" }}>
                  Noch keine Aktivität.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
