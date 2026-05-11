import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, requireApprovedWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import {
  getNewSubmissionsCount,
  getTotalUnseenSubmissions,
  getOpenTasks,
  getRecentActivity,
  logDashboardDbFailure,
  type ActivityEvent,
} from "@/lib/queries/dashboard";
import { AlertCircle, Clock, FileText, CheckCircle2, ClipboardList } from "lucide-react";

/** Session-/workspacegebunden — nicht statisch cachen (Security-Audit). */
export const dynamic = "force-dynamic";

function formatDeDateTime(iso: string) {
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  const Icon =
    event.type === "submission_received"
      ? FileText
      : event.type === "task_done"
        ? CheckCircle2
        : ClipboardList;

  const inner = (
    <>
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
          {formatDeDateTime(event.timestamp)}
        </p>
      </div>
    </>
  );

  if (event.link) {
    return (
      <Link
        href={event.link}
        className="flex min-w-0 items-start gap-3 rounded-lg py-1 transition-colors hover:bg-[#F8FAFC]"
      >
        {inner}
      </Link>
    );
  }

  return <div className="flex min-w-0 items-start gap-3">{inner}</div>;
}

export default async function DashboardPage() {
  const user = await requireUser();
  const workspace = await requireApprovedWorkspace();

  if (!workspace) {
    redirect("/login?error=workspace_missing");
  }

  if (workspace.role !== "doctor") {
    redirect("/my-tasks");
  }

  const workspaceId = workspace.workspace_id;

  const supabase = await createClient();
  const { data: profileData, error: profileError } = await supabase
    .from("profile_data")
    .select("display_name")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (profileError) {
    logDashboardDbFailure("profile_data_select_failed", profileError);
  }

  const profileLoadedOk = !profileError;
  const displayName =
    profileData?.display_name || user.email?.split("@")[0] || "";

  const profileDisplayNameMissing =
    profileLoadedOk && !(profileData?.display_name ?? "").trim();

  const [newRes, unseenRes, tasksRes, activityRes] = await Promise.all([
    getNewSubmissionsCount(workspaceId),
    getTotalUnseenSubmissions(workspaceId),
    getOpenTasks(workspaceId),
    getRecentActivity(workspaceId),
  ]);

  const dashboardOverviewIncomplete =
    !profileLoadedOk ||
    !newRes.ok ||
    !unseenRes.ok ||
    !tasksRes.ok ||
    !activityRes.ok;

  const onlyProfileQueryFailed =
    !profileLoadedOk && newRes.ok && unseenRes.ok && tasksRes.ok && activityRes.ok;

  const newCount = newRes.ok ? newRes.count : null;
  const unseenCount = unseenRes.ok ? unseenRes.count : null;
  const openTasks = tasksRes.ok ? tasksRes.tasks : null;
  const openTaskCount = openTasks?.length ?? 0;
  const topTasks = (openTasks || []).slice(0, 3);
  const activity = activityRes.ok ? activityRes.events : null;

  const todayLabel = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#F8FAFC" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(47,128,237,0.05), transparent 32%)",
        }}
      />

      <div className="relative">
        <div className="mx-auto max-w-[1240px] px-4 py-8 md:px-10">
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
            <p className="mb-2 text-[13px]" style={{ color: "#64748B" }}>
              {todayLabel}
            </p>
            {profileDisplayNameMissing ? (
              <p className="mb-4 text-[12px]" style={{ color: "#94A3B8" }}>
                <Link
                  href="/profile/editor"
                  className="font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                >
                  Profil bearbeiten
                </Link>
              </p>
            ) : null}
            {dashboardOverviewIncomplete ? (
              <p
                className="mb-4 max-w-2xl text-[12px] leading-snug text-slate-600"
                role="status"
                aria-live="polite"
              >
                {onlyProfileQueryFailed ? (
                  <>Profilname nicht geladen — Kennzahlen wie angezeigt.</>
                ) : (
                  <>
                    Teilweise nicht geladen —{" "}
                    <Link href="/inbox" className="font-medium text-[#2F80ED] hover:underline">
                      Posteingang
                    </Link>
                    {" · "}
                    <Link href="/my-tasks" className="font-medium text-[#2F80ED] hover:underline">
                      Aufgaben
                    </Link>
                  </>
                )}
              </p>
            ) : null}

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "rgba(47,128,237,0.08)" }}
                >
                  <Clock className="h-[18px] w-[18px]" style={{ color: "#2F80ED" }} />
                </div>
                <div className="min-w-0">
                  {newCount === null ? (
                    <p className="text-[13px]" style={{ color: "#94A3B8" }}>
                      Neue Fälle (24h) momentan nicht verfügbar.
                    </p>
                  ) : newCount === 0 ? (
                    <>
                      <p className="text-[15px] font-semibold" style={{ color: "#1E293B" }}>
                        Keine neuen Fälle
                      </p>
                      <p className="text-[13px]" style={{ color: "#64748B" }}>
                        in den letzten 24 Stunden
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[15px] font-semibold" style={{ color: "#1E293B" }}>
                        {newCount} neue Fälle
                      </p>
                      <p className="text-[13px]" style={{ color: "#64748B" }}>
                        in den letzten 24h
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "rgba(47,128,237,0.08)" }}
                >
                  <AlertCircle className="h-[18px] w-[18px]" style={{ color: "#2F80ED" }} />
                </div>
                <div className="min-w-0">
                  {unseenCount === null ? (
                    <p className="text-[13px]" style={{ color: "#94A3B8" }}>
                      Ungelesene Fälle momentan nicht verfügbar.
                    </p>
                  ) : unseenCount === 0 ? (
                    <>
                      <p className="text-[15px] font-semibold" style={{ color: "#1E293B" }}>
                        Keine unbearbeiteten Fälle
                      </p>
                      <p className="text-[13px]" style={{ color: "#64748B" }}>
                        Posteingang ist auf dem neuesten Stand
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[15px] font-semibold" style={{ color: "#1E293B" }}>
                        {unseenCount} ungelesen
                      </p>
                      <p className="text-[13px]" style={{ color: "#64748B" }}>
                        benötigen Aufmerksamkeit
                      </p>
                    </>
                  )}
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
              {unseenCount === null ? (
                <p className="text-[14px] leading-snug" style={{ color: "#64748B" }}>
                  Nicht verfügbar —{" "}
                  <Link href="/inbox" className="font-medium text-[#2F80ED] hover:underline">
                    Posteingang
                  </Link>
                </p>
              ) : (
                <>
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
                    {unseenCount}
                  </p>
                  <p
                    className="text-[13px]"
                    style={{
                      color: "#475569",
                      lineHeight: "1.5",
                      fontWeight: 500,
                    }}
                  >
                    {unseenCount === 1
                      ? "1 Fall wartet auf erste Bearbeitung"
                      : unseenCount === 0
                        ? "Alle Einsendungen sind mindestens einmal geöffnet."
                        : `${unseenCount} Fälle sind noch nicht geöffnet`}
                  </p>
                  {unseenCount > 0 ? (
                    <div className="mt-5">
                      <Link
                        href="/inbox"
                        className="inline-flex min-h-[44px] items-center text-[14px] font-medium text-[#2F80ED] hover:underline"
                      >
                        Zum Posteingang
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-5">
                      <Link
                        href="/inbox"
                        className="inline-flex min-h-[44px] items-center text-[14px] font-medium text-[#2F80ED] hover:underline"
                      >
                        Posteingang anzeigen
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="col-span-12 grid grid-cols-1 gap-6 lg:col-span-5">
              <Link href="/my-tasks" className="block min-w-0 rounded-[16px] no-underline">
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
                    {openTasks === null ? null : (
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px]"
                        style={{
                          color: "#16A34A",
                          background: "#EAFBF1",
                          fontWeight: 600,
                        }}
                      >
                        {openTaskCount}
                      </span>
                    )}
                  </div>
                  {openTasks === null ? (
                    <p className="text-[13px]" style={{ color: "#94A3B8" }}>
                      Aufgaben momentan nicht verfügbar.
                    </p>
                  ) : (
                    <p
                      className="text-[40px] leading-none"
                      style={{ color: "#0F172A", letterSpacing: "-0.03em", fontWeight: 600 }}
                    >
                      {openTaskCount}
                    </p>
                  )}
                  <p className="mt-3 text-[12px]" style={{ color: "#2F80ED" }}>
                    Zur Aufgabenliste →
                  </p>
                </div>
              </Link>

              <Link href="/inbox" className="block min-w-0 rounded-[16px] no-underline">
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
                      Neue Einsendungen (24h)
                    </p>
                    {newCount === null ? null : (
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px]"
                        style={{
                          color: "#16A34A",
                          background: "#EAFBF1",
                          fontWeight: 600,
                        }}
                      >
                        {newCount}
                      </span>
                    )}
                  </div>
                  {newCount === null ? (
                    <p className="text-[13px]" style={{ color: "#94A3B8" }}>
                      Zahlen momentan nicht verfügbar.
                    </p>
                  ) : (
                    <p
                      className="text-[40px] leading-none"
                      style={{ color: "#0F172A", letterSpacing: "-0.03em", fontWeight: 600 }}
                    >
                      {newCount}
                    </p>
                  )}
                  <p className="mt-3 text-[12px]" style={{ color: "#2F80ED" }}>
                    Zum Posteingang →
                  </p>
                </div>
              </Link>

              {openTasks && topTasks.length > 0 ? (
                <div
                  className="bg-white"
                  style={{
                    border: "1px solid #EEF2F6",
                    borderRadius: "16px",
                    padding: "20px 24px",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                    Aktuelle Aufgaben
                  </p>
                  <ul className="space-y-2">
                    {topTasks.map((t) => (
                      <li key={t.id} className="min-w-0">
                        <Link
                          href={`/my-tasks/${t.id}`}
                          className="block min-h-[44px] truncate text-[14px] font-medium text-[#1E293B] hover:text-[#2F80ED]"
                        >
                          {t.content.length > 72 ? `${t.content.slice(0, 72)}…` : t.content}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
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
            role="region"
            aria-label="Letzte Aktivitäten"
          >
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              <Link
                href="/inbox"
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl px-4 py-2 text-center text-[14px] font-medium transition-colors hover:opacity-90"
                style={{ color: "#2F80ED", background: "rgba(47,128,237,0.08)" }}
              >
                Alle anzeigen
              </Link>
            </div>

            <div className="space-y-4">
              {activity === null ? (
                <p className="text-[13px]" style={{ color: "#64748B" }}>
                  Nicht verfügbar —{" "}
                  <Link href="/inbox" className="font-medium text-[#2F80ED] hover:underline">
                    Posteingang
                  </Link>
                  {" · "}
                  <Link href="/my-tasks" className="font-medium text-[#2F80ED] hover:underline">
                    Aufgaben
                  </Link>
                </p>
              ) : activity.length === 0 ? (
                <p className="text-[13px]" style={{ color: "#64748B" }}>
                  Keine Einträge in diesem Ausschnitt.
                </p>
              ) : (
                activity.map((event) => <ActivityRow key={event.id} event={event} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
