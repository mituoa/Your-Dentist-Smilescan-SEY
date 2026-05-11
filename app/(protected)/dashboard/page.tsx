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
import { FileText, CheckCircle2, ClipboardList } from "lucide-react";

import {
  clinicalWorkspaceFrame,
  clinicalWorkspaceVerticalPadding,
} from "@/lib/clinical-ui";

/** Workspace- und sessiongebundene Daten — nicht statisch cachen (siehe Punkt 10 Security). */
export const dynamic = "force-dynamic";

/**
 * **Arzt-Home** (`/dashboard`, Rolle `doctor`):
 *
 * **Zweck:** Ruhiger **Tagesüberblick** — was in der Praxis Aufmerksamkeit braucht, ohne zweite
 * Task-Zentrale oder Analytics-Oberfläche zu duplizieren. Fälle und Lesestatus → **Posteingang**
 * (`/inbox`); offene Aufgaben bearbeiten → **Aufgabenliste** (`/my-tasks`). Teammitglieder werden
 * serverseitig nach `/my-tasks` geleitet (kein paralleles „Doctor-Dashboard“ für `team`).
 *
 * **Hierarchie (oben → unten):** Begrüßung → **Zahl-first-Kurzmetriken** (Neu 24h · Posteingang) →
 * **Priorität Posteingang** (große Kennzahl) → Karten **Aufgaben** / **Neu (24h)** + ggf. nächste
 * Aufgaben → **Chronik** (Auszug).
 *
 * **Nicht-Ziele dieser Route:** tiefe Auswertungen, neue KPI-Familien, Marketing-Widgets,
 * freie Navigations-Bausteine — bewusst ruhig und fokussiert gehalten.
 *
 * **Status (Punkt 2):** Nur `workspace.role === "doctor"` nutzt diese Seite; alle anderen Rollen
 * werden nach `/my-tasks` geleitet (kein Redirect-Loop: `/my-tasks` leitet nicht zurück). Query-Ausfälle
 * (`ok: false`) werden als **„nicht verfügbar“** gerendert, nie als echte **0** — Ausnahme: gültige
 * leere Listen (`count === 0` / leere Aktivität) sind echte Nullzustände.
 *
 * **Workspace-Kontext:** Identisch zu Post-Auth und übriger App — `getCurrentWorkspace()` → älteste
 * Mitgliedschaft bei mehreren Workspaces (kein Switching; siehe `getWorkspaceMembershipForUserId`).
 * Ein Arzt mit mehreren Praxen sieht hier dieselben Daten wie in Posteingang/Aufgaben, nicht „ein
 * anderes“ Workspace-Dashboard still nebenbei.
 *
 * **Supabase / Auth (Punkt 3):** Dieselbe Schutzschicht wie `(protected)/layout` — `requireUser()`
 * (bestätigte Session) und `requireApprovedWorkspace()` (Mitgliedschaft + Freigabe-Regeln), danach
 * explizite Rollenprüfung `role === "doctor"`. Datenabfragen nutzen `workspace_id` aus genau dieser
 * Mitgliedschaft und den gleichen RLS-Policies wie Inbox/Aufgaben; Team wird vor jeder Query
 * umgeleitet und erreicht keine Arzt-KPIs auf dieser Route.
 *
 * **Aktionen (Punkt 4):** Primär **Posteingang** und **Aufgabenliste** (kein Relay/Tracker auf dieser
 * Seite — die bleiben in der Shell-Navigation). Karten sind nur dann vollflächig verlinkt, wenn die
 * zugehörige Kennzahl geladen wurde; bei Ladefehlern bleibt die Karte neutral, mit einem einzelnen
 * Textlink zum Ziel. Aktivitätszeilen sind nur klickbar, wenn ein Ziel gesetzt ist.
 *
 * **Ehrlichkeit / kein „Fake“ (Punkt 5):** Keine Erfolgs-Badges oder Riesenzahlen, die „Leerstand“
 * wie Erfolg oder Analytics-Treibstoff verkaufen; echte **0** ist sachlich beschriftet, **Fehler**
 * bleiben getrennt von **Null**. Chronik zeigt nur reale Zeilen aus der DB, keine simulierte Aktivität.
 *
 * **Loading (Punkt 6):** `loading.tsx` nutzt `ClinicalDashboardSkeleton` — gleicher Seitenrahmen wie
 * hier, ohne KPI-Ziffern; ruhigeres Pulsieren und `prefers-reduced-motion`-Abschaltung in `globals.css`.
 *
 * **Empty / Null (Punkt 7):** Echte **0** und leere Listen sind klar beschriftet (nicht „Fehler“);
 * Teil- oder Gesamtleere ohne Dringlichkeit bleibt sachlich, mit **optionalen** Textpfaden zu Posteingang,
 * Aufgaben und Profil — keine Onboarding-Walls, keine Demo-Daten.
 *
 * **Fehler / Recovery (Punkt 8):** Keine technischen Details oder Supabase-Texte in der UI; `ok: false`
 * und Profil-Query-Fehler werden von **echten Nullen** getrennt. Teilfehler: optionaler Hinweis nur bei
 * Profil allein vs. allgemeiner Hinweis bei KPI/Chronik; Recovery immer über **Posteingang** und
 * **Aufgabenliste** — ohne Alarm-Banner, ohne Retry-Theater.
 *
 * **Mobile (Punkt 9):** Enge Viewports: `min-w-0` / `break-words`, **kompaktere Karten**, große
 * Kennziffern mit **fluidem `clamp`**, **≥44px** wo nötig (Links/CTA); Loading-Skeleton an diese Staffel
 * angeglichen.
 *
 * **Security (Punkt 10):** `requireUser` + `requireApprovedWorkspace` + **Rollen-Gate** vor jeder
 * Dashboard-Query; Team erreicht weder KPIs noch Chronik (Redirect). `workspace_id` stammt ausschließlich
 * aus der serverseitig aufgelösten Mitgliedschaft (Pilot: eine Zeile, älteste — konsistent mit Shell).
 * `export const dynamic = "force-dynamic"` vermeidet statisches HTML-Caching für personen-/workspace-
 * gebundene Inhalte. UI zeigt bei DB-/RLS-Problemen keine Rohtexte; `lib/queries/dashboard.ts` loggt nur
 * Ereignis + Code. Aktivitätslinks sind relative Pfade zu Ressourcen aus **derselben** gefilterten Query.
 *
 * **MVP / Pilot (Punkt 11):** Diese Seite ist die **Arzt-Startlage** — Posteingang und Aufgabenliste
 * bleiben die Arbeitsorte; hier nur Orientierung (Eingänge, Lesestatus, offene Aufgaben, Kurz-Chronik).
 * Bewusst **kein** Charting, Benchmarking, Erinnerungs-Engine, Praxisreporting oder Admin-Analytics.
 * Keine künstliche Fülle: leere Zustände und begrenzte Chronik sind produktkonform, nicht „Demo-Lücken“.
 *
 * **Nice / Future / Non-MVP (Punkt 12):** Abgrenzung für spätere Arbeit — **keine stillschweigende
 * Expansion** dieser Route ohne Produktentscheid (dieser Block ist der „Dashboard-Vertrag“).
 *
 * **Nice (klein, optional):** KPI-Mikrocopy oder kurze Hilfetexte; A11y-/Spacing-Polish; Playwright-
 * Smoke für `/dashboard` (Arzt-Session); Monitoring-Alerts auf `[dashboard] event=…`; internes Mini-
 * Runbook bei wiederkehrenden PostgREST-Codes; gezielte Tests für `ok: false` vs. echte Null.
 *
 * **Future (eher app-/infra-weit, nicht „Dashboard first“):** Multi-Workspace-Umschalter und persistenter
 * aktiver Kontext; Analytics-/Warehouse-Pipelines; konfigurierbare Startseiten-Module; erweiterte
 * Team-/Rollenübersichten; Praxisreporting, Trends, Benchmarks, SLA — wenn überhaupt, als **eigene**
 * Flächen oder Reporting-Produkt, nicht durch Aufblähen dieser Startlage.
 *
 * **Non-MVP (bewusst nicht bauen):** KPI-Wände, generisches Executive-/SaaS-Analytics-Dashboard,
 * künstliche Aktivität, Gamification, Widget-Gärten ohne Behandler-Mehrwert, aggressive Growth-CTAs,
 * Chart-Inseln hier. Neue Kennzahlen gehören in **Arbeitskontexte** (Posteingang, Aufgaben, Journal) oder
 * in ein **dediziertes** Analytics-Angebot — nicht auf diese ruhige Übersichtsseite.
 *
 * **Priorität / Freeze (Punkt 13):** Im Gesamtprodukt ist `/dashboard` die **Arzt-Startlage nach Login**
 * — Orientierung und Vertrauen, nicht die primäre klinische Bearbeitungsfläche (das bleiben Posteingang
 * und Aufgabenliste). **Einordnung: P1** für Pilot/Demo: hoher Stellenwert für ersten Eindruck und
 * Datenvertrauen; **P0-Lebensadern** sind Session/Workspace, Posteingang und Aufgaben — dort geht
 * Arbeit inhaltlich voran. **Priorisierungsreihenfolge bei Änderungen:** (1) Rollen- und Workspace-
 * Korrektheit, (2) Vertrauen in angezeigte Praxisdaten — insb. **keine Fake-KPIs** (Fehler ≠ Null),
 * (3) ruhige Fehlerzustände, (4) Mobile-Tauglichkeit, (5) Medical-/Enterprise-Glaubwürdigkeit (Ton,
 * Dichte), (6) Risiko irreführender Zahlen minimieren. **Produktkritische Regressionen:** Team sieht
 * Arzt-KPIs; KPI zeigt `0` obwohl DB fehlgeschlagen; falsche/fehlende Workspace-Isolation; technische
 * Fehlertexte in der UI; Chronik-Links außerhalb des Workspace-Kontexts. **Pilot/Demo manuell
 * prüfen:** Arzt vs. Team (Redirect), Kennzahlen vs. Posteingang (Stichprobe), Aufgabenkarte vs.
 * Aufgabenliste, Chronik-Klicks, schmale Viewports, simulierter Teil-Ausfall (z. B. nur Chronik).
 * **Nicht mehr priorisiert (ohne Produktauftrag):** Dashboard-Redesign, neue Widgets, „mehr Zahlen“.
 * **QA/Monitoring/Doku statt Code:** RLS-Review in Supabase, Log-Alerts auf `[dashboard]`, Release-
 * Notes / Pilot-Runbook. **Ab jetzt:** Route **stabil halten** — nur noch gezielte Bugfixes oder
 * explizite Produktänderungen; keine opportunistische Weiterentwicklung auf dieser Seite.
 */
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
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center sm:h-10 sm:w-10"
        style={{
          background: "#F8FAFC",
          borderRadius: "8px",
        }}
      >
        <Icon className="h-[18px] w-[18px] sm:h-[19px] sm:w-[19px]" style={{ color: "#64748B" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="mb-0.5 break-words text-[13px] leading-snug sm:text-[13.5px]"
          style={{ color: "#0F172A", fontWeight: 600, lineHeight: "1.35" }}
        >
          {event.text}
        </p>
        <p className="text-[10px] tabular-nums" style={{ color: "#94A3B8" }}>
          {formatDeDateTime(event.timestamp)}
        </p>
      </div>
    </>
  );

  if (event.link) {
    return (
      <Link
        href={event.link}
        className="flex min-h-[40px] min-w-0 items-start gap-2.5 rounded-lg py-2 transition-colors hover:bg-[#F8FAFC] sm:min-h-[44px] sm:gap-3 sm:py-2"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="flex min-h-[40px] min-w-0 cursor-default items-start gap-2.5 rounded-lg py-2 sm:min-h-[44px] sm:gap-3 sm:py-2">
      {inner}
    </div>
  );
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

  const overviewQuietEmpty =
    profileLoadedOk &&
    newRes.ok &&
    unseenRes.ok &&
    tasksRes.ok &&
    activityRes.ok &&
    newCount === 0 &&
    unseenCount === 0 &&
    openTaskCount === 0 &&
    activity !== null &&
    activity.length === 0;

  const todayLabel = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#F7F9FC" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(47,128,237,0.035), transparent 34%)",
        }}
      />

      <div className={`relative touch-manipulation ${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
        <div className="min-w-0 w-full max-w-full">
          <div
            className="mb-6 overflow-hidden pb-5"
            style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}
          >
            <h1
              className="mb-1.5 break-words text-[1.65rem] font-semibold sm:text-[28px]"
              style={{
                color: "#1E293B",
                letterSpacing: "-0.01em",
                lineHeight: "1.2",
              }}
            >
              Guten Tag, {displayName}
            </h1>
            <p className="mb-3 text-[13px]" style={{ color: "#64748B" }}>
              {todayLabel}
            </p>
            {profileDisplayNameMissing ? (
              <p className="mb-4 max-w-2xl text-[11px] leading-snug" style={{ color: "#94A3B8" }}>
                <Link
                  href="/profile/editor"
                  className="font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                >
                  Anzeigename im Profil
                </Link>{" "}
                ergänzen.
              </p>
            ) : null}

            {overviewQuietEmpty && !dashboardOverviewIncomplete ? (
              <p
                className="mb-5 max-w-xl break-words rounded-lg border border-slate-200/60 bg-white/80 px-3 py-2 text-[12px] leading-snug text-[#64748B]"
                style={{ boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}
              >
                Keine offenen Punkte in dieser Übersicht.
              </p>
            ) : null}

            {dashboardOverviewIncomplete ? (
              <p
                className="mb-5 max-w-xl break-words rounded-lg border border-slate-200/80 bg-white/85 px-3 py-2 text-[12px] leading-snug text-slate-600 shadow-sm"
                role="status"
                aria-live="polite"
              >
                {onlyProfileQueryFailed ? (
                  <>
                    Profilname nicht geladen — Begrüßung per E-Mail. Kennzahlen wie angezeigt.
                  </>
                ) : (
                  <>
                    Teilweise nicht geladen —{" "}
                    <Link href="/inbox" className="font-medium text-[#2F80ED] underline-offset-2 hover:underline">
                      Posteingang
                    </Link>
                    ,{" "}
                    <Link href="/my-tasks" className="font-medium text-[#2F80ED] underline-offset-2 hover:underline">
                      Aufgaben
                    </Link>
                    .
                  </>
                )}
              </p>
            ) : null}

            <div className="grid max-w-lg grid-cols-2 gap-4 sm:gap-8">
              <div className="min-w-0">
                <p
                  className="tabular-nums text-[clamp(1.85rem,6.5vw,2.5rem)] leading-none tracking-tight"
                  style={{ color: "#0F172A", fontWeight: 650, letterSpacing: "-0.03em" }}
                >
                  {newCount === null ? "—" : newCount}
                </p>
                <p
                  className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]"
                  style={{ lineHeight: 1.35 }}
                >
                  Neu (24h)
                </p>
                {newCount === null ? (
                  <p className="mt-1 text-[11px]" style={{ color: "#94A3B8" }}>
                    n. v.
                  </p>
                ) : null}
              </div>
              <div className="min-w-0">
                <p
                  className="tabular-nums text-[clamp(1.85rem,6.5vw,2.5rem)] leading-none tracking-tight"
                  style={{
                    color: unseenCount !== null && unseenCount > 0 ? "#0B4EA3" : "#0F172A",
                    fontWeight: 650,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {unseenCount === null ? "—" : unseenCount}
                </p>
                <p
                  className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]"
                  style={{ lineHeight: 1.35 }}
                >
                  Posteingang
                </p>
                {unseenCount === null ? (
                  <p className="mt-1 text-[11px]" style={{ color: "#94A3B8" }}>
                    n. v.
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mb-8 grid min-w-0 grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
            <div
              className="col-span-12 min-w-0 rounded-2xl border border-[#D6E6FF] p-5 sm:p-5 md:px-7 md:py-6 lg:col-span-7"
              style={{
                background: "linear-gradient(135deg, #F0F7FF 0%, #F4F8FF 100%)",
                boxShadow:
                  unseenCount !== null && unseenCount > 0
                    ? "0 6px 22px rgba(47, 128, 237, 0.1)"
                    : "0 2px 12px rgba(15, 23, 42, 0.06)",
              }}
            >
              <p
                className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2563EB]"
                style={{ lineHeight: 1.35 }}
              >
                {unseenCount !== null && unseenCount > 0 ? "Noch zu öffnen" : "Posteingang"}
              </p>
              {unseenCount === null ? (
                <p className="break-words text-[14px] leading-snug" style={{ color: "#64748B" }}>
                  Kennzahl nicht geladen.{" "}
                  <Link
                    href="/inbox"
                    className="inline-flex min-h-[44px] items-center font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                  >
                    Posteingang
                  </Link>
                </p>
              ) : unseenCount === 0 ? (
                <>
                  <p
                    className="min-w-0 tabular-nums text-[clamp(2.5rem,11vw,3.5rem)] leading-none tracking-tight lg:text-[56px]"
                    style={{
                      color: "#94A3B8",
                      fontWeight: 650,
                      letterSpacing: "-0.03em",
                      marginBottom: "10px",
                    }}
                  >
                    0
                  </p>
                  <p className="text-[13px] font-medium" style={{ color: "#475569", lineHeight: 1.45 }}>
                    Alles mindestens einmal geöffnet.
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/inbox"
                      className="inline-flex min-h-[44px] items-center text-[13px] font-medium text-[#2F80ED] hover:underline"
                    >
                      Posteingang
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p
                    className="min-w-0 tabular-nums text-[clamp(3rem,14vw,4.5rem)] leading-none tracking-tight lg:text-[72px]"
                    style={{
                      color: "#0B4EA3",
                      fontWeight: 650,
                      letterSpacing: "-0.03em",
                      marginBottom: "12px",
                    }}
                  >
                    {unseenCount}
                  </p>
                  <p className="text-[13px] font-medium" style={{ color: "#475569", lineHeight: 1.45 }}>
                    {unseenCount === 1
                      ? "1 Einsendung noch nicht geöffnet"
                      : `${unseenCount} Einsendungen noch nicht geöffnet`}
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/inbox"
                      className="inline-flex min-h-[44px] items-center text-[13px] font-medium text-[#2F80ED] hover:underline"
                    >
                      Zum Posteingang
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="col-span-12 grid min-w-0 grid-cols-1 gap-4 sm:gap-5 lg:col-span-5">
              {openTasks === null ? (
                <div className="block min-w-0 rounded-2xl">
                  <div className="rounded-2xl border border-[#EEF2F6] bg-white p-4 pb-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-5 sm:pb-4">
                    <div className="mb-2">
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748B]"
                        style={{ fontWeight: 600 }}
                      >
                        Aufgaben
                      </p>
                    </div>
                    <p className="text-[13px]" style={{ color: "#94A3B8" }}>
                      Nicht geladen.
                    </p>
                    <p className="mt-3 text-[12px] font-medium text-[#2F80ED] underline-offset-2">
                      <Link href="/my-tasks" className="hover:underline">
                        Aufgabenliste
                      </Link>
                    </p>
                  </div>
                </div>
              ) : (
                <Link href="/my-tasks" className="block min-w-0 rounded-2xl no-underline">
                  <div className="rounded-2xl border border-[#EEF2F6] bg-white p-4 pb-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-5 sm:pb-4">
                    <div className="mb-2">
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748B]"
                        style={{ fontWeight: 600 }}
                      >
                        Aufgaben
                      </p>
                    </div>
                    {openTaskCount > 0 ? (
                      <>
                        <p
                          className="min-w-0 tabular-nums text-[clamp(2rem,10vw,3rem)] leading-none tracking-tight lg:text-[48px]"
                          style={{ color: "#0F172A", letterSpacing: "-0.03em", fontWeight: 650 }}
                        >
                          {openTaskCount}
                        </p>
                        <p className="mt-2 text-[12px] font-medium text-[#2F80ED] underline-offset-2">
                          <span className="hover:underline">Liste</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p
                          className="min-w-0 tabular-nums text-[clamp(2rem,10vw,2.75rem)] leading-none tracking-tight text-[#94A3B8] lg:text-[44px]"
                          style={{ letterSpacing: "-0.03em", fontWeight: 650 }}
                        >
                          0
                        </p>
                        <p className="mt-1.5 text-[12px] font-medium" style={{ color: "#64748B" }}>
                          Offen · in Prüfung
                        </p>
                        <p className="mt-2 text-[12px] font-medium text-[#2F80ED] underline-offset-2">
                          <span className="hover:underline">Liste</span>
                        </p>
                      </>
                    )}
                  </div>
                </Link>
              )}

              {newCount === null ? (
                <div className="block min-w-0 rounded-2xl">
                  <div className="rounded-2xl border border-[#EEF2F6] bg-white p-4 pb-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-5 sm:pb-4">
                    <div className="mb-2">
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748B]"
                        style={{ fontWeight: 600 }}
                      >
                        Neu (24h)
                      </p>
                    </div>
                    <p className="text-[13px]" style={{ color: "#94A3B8" }}>
                      Nicht geladen.
                    </p>
                    <p className="mt-3 text-[12px] font-medium text-[#2F80ED] underline-offset-2">
                      <Link href="/inbox" className="hover:underline">
                        Posteingang
                      </Link>
                    </p>
                  </div>
                </div>
              ) : (
                <Link href="/inbox" className="block min-w-0 rounded-2xl no-underline">
                  <div className="rounded-2xl border border-[#EEF2F6] bg-white p-4 pb-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-5 sm:pb-4">
                    <div className="mb-2">
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748B]"
                        style={{ fontWeight: 600 }}
                      >
                        Neu (24h)
                      </p>
                    </div>
                    {newCount > 0 ? (
                      <>
                        <p
                          className="min-w-0 tabular-nums text-[clamp(2rem,10vw,3rem)] leading-none tracking-tight lg:text-[48px]"
                          style={{ color: "#0F172A", letterSpacing: "-0.03em", fontWeight: 650 }}
                        >
                          {newCount}
                        </p>
                        <p className="mt-2 text-[12px] font-medium text-[#2F80ED] underline-offset-2">
                          <span className="hover:underline">Posteingang</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p
                          className="min-w-0 tabular-nums text-[clamp(2rem,10vw,2.75rem)] leading-none tracking-tight text-[#94A3B8] lg:text-[44px]"
                          style={{ letterSpacing: "-0.03em", fontWeight: 650 }}
                        >
                          0
                        </p>
                        <p className="mt-1.5 text-[12px] font-medium" style={{ color: "#64748B" }}>
                          Letzte 24h
                        </p>
                        <p className="mt-2 text-[12px] font-medium text-[#2F80ED] underline-offset-2">
                          <span className="hover:underline">Posteingang</span>
                        </p>
                      </>
                    )}
                  </div>
                </Link>
              )}

              {openTasks && topTasks.length > 0 ? (
                <div className="min-w-0 rounded-2xl border border-[#EEF2F6] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-5">
                  <p
                    className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]"
                    style={{ lineHeight: 1.35 }}
                  >
                    Nächste Aufgaben
                  </p>
                  <ul className="space-y-0.5">
                    {topTasks.map((t) => (
                      <li key={t.id} className="min-w-0">
                        <Link
                          href={`/my-tasks/${t.id}`}
                          className="block min-h-[40px] break-words py-2 text-[13px] font-medium leading-snug text-[#1E293B] hover:text-[#2F80ED] sm:min-h-[44px] sm:py-2.5"
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
            className="min-w-0 rounded-2xl border border-[#EEF2F6] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-5 md:px-6 md:py-5"
            role="region"
            aria-label="Chronik"
          >
            <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <h2
                  className="mb-0.5 text-[17px] font-semibold"
                  style={{ color: "#1E293B", letterSpacing: "-0.01em" }}
                >
                  Chronik
                </h2>
                <p className="break-words text-[11px] font-medium uppercase tracking-[0.1em] text-[#94A3B8]">
                  Kurzauszug
                </p>
              </div>
              {activity !== null ? (
                <Link
                  href="/inbox"
                  className="inline-flex min-h-[40px] w-full min-w-0 shrink-0 items-center justify-center rounded-lg px-3 py-2 text-center text-[13px] font-medium transition-colors hover:opacity-90 sm:min-h-[44px] sm:w-auto"
                  style={{ color: "#2F80ED", background: "rgba(47,128,237,0.08)" }}
                >
                  Posteingang
                </Link>
              ) : null}
            </div>

            <div className="space-y-2">
              {activity === null ? (
                <div role="status" aria-live="polite">
                  <p className="text-[12px] leading-snug" style={{ color: "#64748B" }}>
                    Auszug nicht geladen.
                  </p>
                  <p className="mt-2 text-[12px]" style={{ color: "#64748B" }}>
                    <Link
                      href="/inbox"
                      className="font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                    >
                      Posteingang
                    </Link>
                    <span style={{ color: "#94A3B8" }}> · </span>
                    <Link
                      href="/my-tasks"
                      className="font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                    >
                      Aufgaben
                    </Link>
                  </p>
                </div>
              ) : activity.length === 0 ? (
                <div>
                  <p className="text-[12px] leading-snug" style={{ color: "#64748B" }}>
                    Keine Einträge in diesem Ausschnitt.
                  </p>
                  <p className="mt-2 text-[12px]" style={{ color: "#64748B" }}>
                    <Link
                      href="/inbox"
                      className="font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                    >
                      Posteingang
                    </Link>
                    <span style={{ color: "#94A3B8" }}> · </span>
                    <Link
                      href="/my-tasks"
                      className="font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                    >
                      Aufgaben
                    </Link>
                  </p>
                </div>
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
