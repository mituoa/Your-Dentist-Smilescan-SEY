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
 * **Hierarchie (oben → unten):** Begrüßung / Datum → **Zahl-first** (Neu 24h · Posteingang) →
 * **Priorität Posteingang** (dominante Kennzahl, kompakte `rounded-xl`-Karte) → **Aufgaben** / **Neu 24h**
 * (kompakte KPI-Kacheln) → **Chronik** (dichter Auszug).
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
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center sm:h-9 sm:w-9"
        style={{
          background: "#F8FAFC",
          borderRadius: "6px",
        }}
      >
        <Icon className="h-[16px] w-[16px] sm:h-[17px] sm:w-[17px]" style={{ color: "#94A3B8" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="break-words text-[12px] font-semibold leading-tight sm:text-[12.5px]"
          style={{ color: "#0F172A", lineHeight: "1.3" }}
        >
          {event.text}
        </p>
        <p className="mt-0.5 text-[10px] tabular-nums tracking-tight" style={{ color: "#94A3B8" }}>
          {formatDeDateTime(event.timestamp)}
        </p>
      </div>
    </>
  );

  if (event.link) {
    return (
      <Link
        href={event.link}
        className="flex min-h-[40px] min-w-0 items-start gap-2 rounded-md py-1.5 transition-colors hover:bg-[#F8FAFC] sm:min-h-[44px] sm:gap-2.5 sm:py-1.5"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="flex min-h-[40px] min-w-0 cursor-default items-start gap-2 rounded-md py-1.5 sm:min-h-[44px] sm:gap-2.5 sm:py-1.5">
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
            className="mb-5 overflow-hidden pb-4"
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
            <p className="mb-3 text-[12px] tabular-nums" style={{ color: "#64748B" }}>
              {todayLabel}
              {profileDisplayNameMissing ? (
                <>
                  {" "}
                  <span style={{ color: "#CBD5E1" }}>·</span>{" "}
                  <Link
                    href="/profile/editor"
                    className="font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                  >
                    Profil
                  </Link>
                </>
              ) : null}
            </p>

            {overviewQuietEmpty && !dashboardOverviewIncomplete ? (
              <p className="mb-4 text-[11px] font-medium tracking-wide text-[#94A3B8]">
                Alles ruhig.
              </p>
            ) : null}

            {dashboardOverviewIncomplete ? (
              <p
                className="mb-4 max-w-2xl text-[11px] font-medium leading-snug text-slate-500"
                role="status"
                aria-live="polite"
              >
                {onlyProfileQueryFailed ? (
                  <>Profil n. v. — Kennzahlen gültig.</>
                ) : (
                  <>
                    Teilweise n. v. —{" "}
                    <Link href="/inbox" className="text-[#2F80ED] underline-offset-2 hover:underline">
                      Posteingang
                    </Link>{" "}
                    ·{" "}
                    <Link href="/my-tasks" className="text-[#2F80ED] underline-offset-2 hover:underline">
                      Aufgaben
                    </Link>
                  </>
                )}
              </p>
            ) : null}

            <div className="grid max-w-md grid-cols-2 gap-3 sm:gap-10">
              <div className="min-w-0">
                <p
                  className="tabular-nums text-[clamp(2rem,7.5vw,2.85rem)] leading-none tracking-tight"
                  style={{ color: "#0F172A", fontWeight: 650, letterSpacing: "-0.035em" }}
                >
                  {newCount === null ? "—" : newCount}
                </p>
                <p
                  className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]"
                  style={{ lineHeight: 1.3 }}
                >
                  Neu 24h
                </p>
              </div>
              <div className="min-w-0">
                <p
                  className="tabular-nums text-[clamp(2rem,7.5vw,2.85rem)] leading-none tracking-tight"
                  style={{
                    color: unseenCount !== null && unseenCount > 0 ? "#0B4EA3" : "#0F172A",
                    fontWeight: 650,
                    letterSpacing: "-0.035em",
                  }}
                >
                  {unseenCount === null ? "—" : unseenCount}
                </p>
                <p
                  className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]"
                  style={{ lineHeight: 1.3 }}
                >
                  Posteingang
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 grid min-w-0 grid-cols-12 gap-3 sm:gap-4 lg:gap-5">
            <div
              className="col-span-12 min-w-0 rounded-xl border border-[#D6E6FF] p-4 sm:p-4 md:px-6 md:py-5 lg:col-span-7"
              style={{
                background: "linear-gradient(135deg, #F0F7FF 0%, #F4F8FF 100%)",
                boxShadow:
                  unseenCount !== null && unseenCount > 0
                    ? "0 5px 20px rgba(47, 128, 237, 0.09)"
                    : "0 1px 8px rgba(15, 23, 42, 0.05)",
              }}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p
                  className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#2563EB]"
                  style={{ lineHeight: 1.3 }}
                >
                  {unseenCount !== null && unseenCount > 0 ? "Aufmerksamkeit" : "Posteingang"}
                </p>
              </div>
              {unseenCount === null ? (
                <div className="flex min-h-[5.5rem] flex-col justify-center">
                  <p
                    className="tabular-nums text-[clamp(2.25rem,8vw,3rem)] leading-none text-[#CBD5E1]"
                    style={{ fontWeight: 650, letterSpacing: "-0.03em" }}
                  >
                    —
                  </p>
                  <Link
                    href="/inbox"
                    className="mt-2 inline-flex min-h-[44px] max-w-fit items-center text-[12px] font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                  >
                    Posteingang
                  </Link>
                </div>
              ) : unseenCount === 0 ? (
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <p
                      className="min-w-0 tabular-nums text-[clamp(2.75rem,12vw,4rem)] leading-none tracking-tight text-[#CBD5E1] lg:text-[64px]"
                      style={{ letterSpacing: "-0.04em", fontWeight: 650 }}
                    >
                      0
                    </p>
                    <Link
                      href="/inbox"
                      className="mb-1 inline-flex min-h-[44px] shrink-0 items-center text-[12px] font-medium text-[#2F80ED] hover:underline"
                    >
                      Öffnen
                    </Link>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-[#64748B]">Alles geöffnet.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <p
                      className="min-w-0 tabular-nums text-[clamp(3.25rem,15vw,5rem)] leading-none tracking-tight text-[#0B4EA3] lg:text-[80px]"
                      style={{ fontWeight: 650, letterSpacing: "-0.04em" }}
                    >
                      {unseenCount}
                    </p>
                    <Link
                      href="/inbox"
                      className="mb-1.5 inline-flex min-h-[44px] shrink-0 items-center text-[12px] font-medium text-[#2F80ED] hover:underline"
                    >
                      Posteingang
                    </Link>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-[#64748B]">
                    {unseenCount === 1 ? "1 ungeöffnet" : `${unseenCount} ungeöffnet`}
                  </p>
                </div>
              )}
            </div>

            <div className="col-span-12 grid min-w-0 grid-cols-1 gap-3 sm:gap-4 lg:col-span-5">
              {openTasks === null ? (
                <div className="block min-w-0 rounded-xl">
                  <div className="rounded-xl border border-[#EEF2F6] bg-white p-3.5 shadow-[0_1px_6px_rgba(15,23,42,0.04)] sm:p-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                      Aufgaben
                    </p>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      <p
                        className="tabular-nums text-[2rem] leading-none text-[#CBD5E1] sm:text-[2.25rem]"
                        style={{ fontWeight: 650, letterSpacing: "-0.03em" }}
                      >
                        —
                      </p>
                      <Link
                        href="/my-tasks"
                        className="mb-0.5 inline-flex min-h-[44px] items-center text-[12px] font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                      >
                        Liste
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/my-tasks" className="block min-w-0 rounded-xl no-underline">
                  <div className="rounded-xl border border-[#EEF2F6] bg-white p-3.5 shadow-[0_1px_6px_rgba(15,23,42,0.04)] sm:p-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                      Aufgaben
                    </p>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      {openTaskCount > 0 ? (
                        <>
                          <p
                            className="min-w-0 tabular-nums text-[clamp(2.1rem,9.5vw,3.25rem)] leading-none tracking-tight text-[#0F172A] lg:text-[52px]"
                            style={{ letterSpacing: "-0.035em", fontWeight: 650 }}
                          >
                            {openTaskCount}
                          </p>
                          <span className="mb-1 text-[12px] font-medium text-[#2F80ED]" aria-hidden>
                            →
                          </span>
                        </>
                      ) : (
                        <>
                          <p
                            className="min-w-0 tabular-nums text-[clamp(2rem,9vw,2.85rem)] leading-none tracking-tight text-[#CBD5E1] lg:text-[44px]"
                            style={{ letterSpacing: "-0.035em", fontWeight: 650 }}
                          >
                            0
                          </p>
                          <span className="mb-1 text-[12px] font-medium text-[#2F80ED]" aria-hidden>
                            →
                          </span>
                        </>
                      )}
                    </div>
                    {openTaskCount === 0 ? (
                      <p className="mt-0.5 text-[10px] font-medium text-[#64748B]">Offen · Prüfung</p>
                    ) : null}
                  </div>
                </Link>
              )}

              {newCount === null ? (
                <div className="block min-w-0 rounded-xl">
                  <div className="rounded-xl border border-[#EEF2F6] bg-white p-3.5 shadow-[0_1px_6px_rgba(15,23,42,0.04)] sm:p-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                      Neu 24h
                    </p>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      <p
                        className="tabular-nums text-[2rem] leading-none text-[#CBD5E1] sm:text-[2.25rem]"
                        style={{ fontWeight: 650, letterSpacing: "-0.03em" }}
                      >
                        —
                      </p>
                      <Link
                        href="/inbox"
                        className="mb-0.5 inline-flex min-h-[44px] items-center text-[12px] font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                      >
                        Posteingang
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/inbox" className="block min-w-0 rounded-xl no-underline">
                  <div className="rounded-xl border border-[#EEF2F6] bg-white p-3.5 shadow-[0_1px_6px_rgba(15,23,42,0.04)] sm:p-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                      Neu 24h
                    </p>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      {newCount > 0 ? (
                        <>
                          <p
                            className="min-w-0 tabular-nums text-[clamp(2.1rem,9.5vw,3.25rem)] leading-none tracking-tight text-[#0F172A] lg:text-[52px]"
                            style={{ letterSpacing: "-0.035em", fontWeight: 650 }}
                          >
                            {newCount}
                          </p>
                          <span className="mb-1 text-[12px] font-medium text-[#2F80ED]" aria-hidden>
                            →
                          </span>
                        </>
                      ) : (
                        <>
                          <p
                            className="min-w-0 tabular-nums text-[clamp(2rem,9vw,2.85rem)] leading-none tracking-tight text-[#CBD5E1] lg:text-[44px]"
                            style={{ letterSpacing: "-0.035em", fontWeight: 650 }}
                          >
                            0
                          </p>
                          <span className="mb-1 text-[12px] font-medium text-[#2F80ED]" aria-hidden>
                            →
                          </span>
                        </>
                      )}
                    </div>
                    {newCount === 0 ? (
                      <p className="mt-0.5 text-[10px] font-medium text-[#64748B]">Keine Eingänge</p>
                    ) : null}
                  </div>
                </Link>
              )}

              {openTasks && topTasks.length > 0 ? (
                <div className="min-w-0 rounded-xl border border-[#EEF2F6] bg-white p-3.5 shadow-[0_1px_6px_rgba(15,23,42,0.04)] sm:p-4">
                  <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
                    Als Nächstes
                  </p>
                  <ul className="divide-y divide-[#F1F5F9]">
                    {topTasks.map((t) => (
                      <li key={t.id} className="min-w-0">
                        <Link
                          href={`/my-tasks/${t.id}`}
                          className="block min-h-[40px] break-words py-1.5 text-[12px] font-medium leading-snug text-[#1E293B] hover:text-[#2F80ED] sm:min-h-[44px] sm:py-2"
                        >
                          {t.content.length > 56 ? `${t.content.slice(0, 56)}…` : t.content}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div
            className="min-w-0 rounded-xl border border-[#EEF2F6] bg-white p-3.5 shadow-[0_1px_6px_rgba(15,23,42,0.04)] sm:p-4"
            role="region"
            aria-label="Chronik"
          >
            <div className="mb-2 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2
                className="text-[15px] font-semibold tracking-tight"
                style={{ color: "#1E293B", letterSpacing: "-0.02em" }}
              >
                Chronik
              </h2>
              {activity !== null ? (
                <Link
                  href="/inbox"
                  className="inline-flex min-h-[40px] w-full shrink-0 items-center justify-center rounded-md px-2.5 py-1.5 text-center text-[12px] font-medium text-[#2F80ED] transition-colors hover:bg-[#F0F7FF] sm:ml-auto sm:w-auto"
                >
                  Posteingang
                </Link>
              ) : null}
            </div>

            <div className="space-y-0.5 border-t border-[#F1F5F9] pt-2">
              {activity === null ? (
                <div role="status" aria-live="polite" className="py-1 text-[11px] text-[#64748B]">
                  <span className="text-[#CBD5E1]">—</span>{" "}
                  <Link href="/inbox" className="font-medium text-[#2F80ED] underline-offset-2 hover:underline">
                    Posteingang
                  </Link>
                  <span className="text-[#CBD5E1]"> · </span>
                  <Link href="/my-tasks" className="font-medium text-[#2F80ED] underline-offset-2 hover:underline">
                    Aufgaben
                  </Link>
                </div>
              ) : activity.length === 0 ? (
                <div className="py-1 text-[11px] text-[#64748B]">
                  Leer ·{" "}
                  <Link href="/inbox" className="font-medium text-[#2F80ED] underline-offset-2 hover:underline">
                    Posteingang
                  </Link>
                  <span className="text-[#CBD5E1]"> · </span>
                  <Link href="/my-tasks" className="font-medium text-[#2F80ED] underline-offset-2 hover:underline">
                    Aufgaben
                  </Link>
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
