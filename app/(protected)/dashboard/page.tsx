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
 * **Hierarchie (oben → unten):** Begrüßung + Kurzmetriken → **Priorität unbearbeitete Fälle**
 * (Posteingang) → Karten **Aufgaben** / **Neueingänge 24h** + ggf. Top-3-Aufgaben → **Kurze Chronik**
 * (Auszug, keine vollständige Historie).
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
 * **Mobile (Punkt 9):** Enge Viewports: `min-w-0` / `break-words`, etwas **engeres Karten-Padding**,
 * **≥44px** für primäre Tippflächen (KPI-Icons, Chronik-CTA, Aktivitätszeilen, Aufgabenlinks), große
 * Kennziffern mit **fluidem `clamp`** statt Overflow; Loading-Skeleton nutzt dieselben Padding-Stufen.
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
          className="mb-1 break-words text-[14px]"
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
        className="flex min-h-[44px] min-w-0 items-start gap-3 rounded-lg py-2.5 transition-colors hover:bg-[#F8FAFC] max-lg:py-3"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="flex min-h-[44px] min-w-0 cursor-default items-start gap-3 rounded-lg py-2.5 max-lg:py-3">
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
            className="mb-8 overflow-hidden pb-6"
            style={{ borderBottom: "1px solid rgba(226,232,240,0.6)" }}
          >
            <h1
              className="mb-2 break-words text-[1.65rem] font-semibold sm:text-[28px]"
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
              <p className="mb-3 max-w-2xl text-[12px] leading-relaxed" style={{ color: "#94A3B8" }}>
                Anzeigename noch nicht gesetzt — optional unter{" "}
                <Link
                  href="/profile/editor"
                  className="font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                >
                  Profil bearbeiten
                </Link>
                .
              </p>
            ) : null}
            <p
              className={`max-w-2xl break-words text-[14px] leading-relaxed ${
                overviewQuietEmpty && !dashboardOverviewIncomplete ? "mb-4" : "mb-6"
              }`}
              style={{ color: "#64748B" }}
            >
              Orientierung für den Arbeitsalltag: was im Posteingang ansteht, welche Aufgaben offen sind
              und was zuletzt passiert ist. Bearbeiten und Entscheiden erfolgen im Posteingang und in der
              Aufgabenliste — dort arbeitet auch Ihr Team.
            </p>

            {overviewQuietEmpty && !dashboardOverviewIncomplete ? (
              <p
                className="mb-6 max-w-2xl break-words rounded-lg border border-slate-200/70 bg-white/70 px-3 py-2.5 text-[13px] leading-relaxed text-[#64748B]"
                style={{ boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}
              >
                Für diese Startlage liegt gerade nichts Dringendes vor. Posteingang und Aufgabenliste
                bleiben die festen Einstiege — dort arbeiten Sie wie gewohnt weiter.
              </p>
            ) : null}

            {dashboardOverviewIncomplete ? (
              <p
                className="mb-6 max-w-2xl break-words rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 text-[13px] leading-relaxed text-slate-600 shadow-sm"
                role="status"
                aria-live="polite"
              >
                {onlyProfileQueryFailed ? (
                  <>
                    Der Anzeigename aus dem Praxisprofil konnte nicht geladen werden — die Begrüßung
                    nutzt vorerst Ihre E-Mail-Adresse. Die Kennzahlen unten gelten, soweit sie
                    angezeigt werden.
                  </>
                ) : (
                  <>
                    Einige Angaben auf dieser Übersicht konnten nicht vollständig geladen werden. Für
                    verlässliche Fall- und Aufgabendetails nutzen Sie bitte den{" "}
                    <Link href="/inbox" className="font-medium text-[#2F80ED] underline-offset-2 hover:underline">
                      Posteingang
                    </Link>{" "}
                    und die{" "}
                    <Link href="/my-tasks" className="font-medium text-[#2F80ED] underline-offset-2 hover:underline">
                      Aufgabenliste
                    </Link>
                    .
                  </>
                )}
              </p>
            ) : null}

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "rgba(47,128,237,0.08)" }}
                >
                  <Clock className="h-[18px] w-[18px]" style={{ color: "#2F80ED" }} />
                </div>
                <div className="min-w-0">
                  {newCount === null ? (
                    <p className="text-[13px] leading-relaxed" style={{ color: "#64748B" }}>
                      <span className="mb-0.5 block font-semibold text-[#1E293B]">Neue Einsendungen (24h)</span>
                      <span style={{ color: "#94A3B8" }}>Vorübergehend nicht verfügbar.</span>
                    </p>
                  ) : newCount === 0 ? (
                    <>
                      <p className="text-[15px] font-semibold" style={{ color: "#1E293B" }}>
                        Keine neuen Einsendungen
                      </p>
                      <p className="text-[13px]" style={{ color: "#64748B" }}>
                        in den letzten 24 Stunden
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[15px] font-semibold" style={{ color: "#1E293B" }}>
                        {newCount} neue Einsendungen
                      </p>
                      <p className="text-[13px]" style={{ color: "#64748B" }}>
                        in den letzten 24 Stunden
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "rgba(47,128,237,0.08)" }}
                >
                  <AlertCircle className="h-[18px] w-[18px]" style={{ color: "#2F80ED" }} />
                </div>
                <div className="min-w-0">
                  {unseenCount === null ? (
                    <p className="text-[13px] leading-relaxed" style={{ color: "#64748B" }}>
                      <span className="mb-0.5 block font-semibold text-[#1E293B]">
                        Posteingang (Lesestatus)
                      </span>
                      <span style={{ color: "#94A3B8" }}>Vorübergehend nicht verfügbar.</span>
                    </p>
                  ) : unseenCount === 0 ? (
                    <>
                      <p className="text-[15px] font-semibold" style={{ color: "#1E293B" }}>
                        Keine unbearbeiteten Fälle
                      </p>
                      <p className="text-[13px]" style={{ color: "#64748B" }}>
                        Alle eingegangenen Fälle sind mindestens einmal geöffnet.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[15px] font-semibold" style={{ color: "#1E293B" }}>
                        {unseenCount} {unseenCount === 1 ? "Fall" : "Fälle"} im Posteingang
                      </p>
                      <p className="text-[13px]" style={{ color: "#64748B" }}>
                        noch nicht geöffnet
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10 grid min-w-0 grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
            <div
              className="col-span-12 min-w-0 rounded-2xl border border-[#D6E6FF] p-5 sm:p-6 md:px-8 md:py-7 lg:col-span-7"
              style={{
                background: "linear-gradient(135deg, #F0F7FF 0%, #F4F8FF 100%)",
                boxShadow:
                  unseenCount !== null && unseenCount > 0
                    ? "0 4px 18px rgba(15, 23, 42, 0.09)"
                    : "0 2px 12px rgba(15, 23, 42, 0.06)",
              }}
            >
              <p
                className="mb-4 text-[11px] font-medium tracking-normal text-[#475569]"
                style={{ lineHeight: 1.4 }}
              >
                Posteingang — zuerst prüfen
              </p>
              {unseenCount === null ? (
                <p className="break-words text-[15px] leading-relaxed" style={{ color: "#64748B" }}>
                  Diese Kennzahl lässt sich gerade nicht laden. Den Posteingang können Sie trotzdem öffnen:{" "}
                  <Link
                    href="/inbox"
                    className="inline-flex min-h-[44px] items-center font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                  >
                    Posteingang
                  </Link>
                  .
                </p>
              ) : unseenCount === 0 ? (
                <>
                  <p
                    className="mb-3 text-[20px] font-semibold leading-snug tracking-tight"
                    style={{ color: "#0B4EA3", letterSpacing: "-0.02em" }}
                  >
                    Keine unbearbeiteten Fälle
                  </p>
                  <p
                    className="text-[13px]"
                    style={{
                      color: "#475569",
                      lineHeight: "1.55",
                      fontWeight: 500,
                    }}
                  >
                    Alle Einsendungen wurden mindestens einmal geöffnet — es liegt nichts Ungelesenes
                    vor.
                  </p>
                  <div className="mt-5">
                    <Link
                      href="/inbox"
                      className="inline-flex min-h-[44px] items-center text-[14px] font-medium text-[#2F80ED] hover:underline"
                    >
                      Posteingang anzeigen
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p
                    className="min-w-0 tabular-nums text-[clamp(2.75rem,12vw,4rem)] leading-none tracking-tight lg:text-[64px]"
                    style={{
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
                      : `${unseenCount} Fälle sind noch nicht geöffnet`}
                  </p>
                  <div className="mt-5">
                    <Link
                      href="/inbox"
                      className="inline-flex min-h-[44px] items-center text-[14px] font-medium text-[#2F80ED] hover:underline"
                    >
                      Zum Posteingang
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="col-span-12 grid min-w-0 grid-cols-1 gap-5 sm:gap-6 lg:col-span-5">
              {openTasks === null ? (
                <div className="block min-w-0 rounded-2xl">
                  <div
                    className="bg-white rounded-2xl border border-[#EEF2F6] p-5 pb-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-6 sm:pb-5"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <p className="text-[12px]" style={{ color: "#64748B", fontWeight: 500 }}>
                        Offene Aufgaben
                      </p>
                    </div>
                    <p className="text-[13px] leading-relaxed" style={{ color: "#94A3B8" }}>
                      Aufgabenliste vorübergehend nicht erreichbar.
                    </p>
                    <p className="mt-4 text-[12px]" style={{ color: "#64748B" }}>
                      <Link
                        href="/my-tasks"
                        className="font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                      >
                        Zur Aufgabenliste
                      </Link>{" "}
                      <span className="text-[#94A3B8]">— dort arbeiten Sie unabhängig von dieser Übersicht.</span>
                    </p>
                  </div>
                </div>
              ) : (
                <Link href="/my-tasks" className="block min-w-0 rounded-2xl no-underline">
                  <div
                    className="bg-white rounded-2xl border border-[#EEF2F6] p-5 pb-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-6 sm:pb-5"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <p className="text-[12px]" style={{ color: "#64748B", fontWeight: 500 }}>
                        Offene Aufgaben
                      </p>
                    </div>
                    {openTaskCount > 0 ? (
                      <>
                        <p
                          className="min-w-0 tabular-nums text-[clamp(1.75rem,9vw,2.5rem)] leading-none tracking-tight lg:text-[40px]"
                          style={{ color: "#0F172A", letterSpacing: "-0.03em", fontWeight: 600 }}
                        >
                          {openTaskCount}
                        </p>
                        <p className="mt-3 text-[12px] font-medium text-[#2F80ED] underline-offset-2">
                          <span className="hover:underline">Zur Aufgabenliste</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p
                          className="text-[17px] font-semibold leading-snug"
                          style={{ color: "#1E293B", letterSpacing: "-0.02em" }}
                        >
                          Keine offenen Aufgaben
                        </p>
                        <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "#64748B" }}>
                          Gezählt werden Aufgaben mit Status „offen“ oder „in Prüfung“; die vollständige Liste
                          steht in der Aufgabenliste.
                        </p>
                        <p className="mt-3 text-[12px] font-medium text-[#2F80ED] underline-offset-2">
                          <span className="hover:underline">Zur Aufgabenliste</span>
                        </p>
                      </>
                    )}
                  </div>
                </Link>
              )}

              {newCount === null ? (
                <div className="block min-w-0 rounded-2xl">
                  <div
                    className="bg-white rounded-2xl border border-[#EEF2F6] p-5 pb-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-6 sm:pb-5"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <p className="text-[12px]" style={{ color: "#64748B", fontWeight: 500 }}>
                        Neue Einsendungen (24h)
                      </p>
                    </div>
                    <p className="text-[13px] leading-relaxed" style={{ color: "#94A3B8" }}>
                      Kennzahl vorübergehend nicht verfügbar.
                    </p>
                    <p className="mt-4 text-[12px]" style={{ color: "#64748B" }}>
                      <Link
                        href="/inbox"
                        className="font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                      >
                        Zum Posteingang
                      </Link>{" "}
                      <span className="text-[#94A3B8]">— Einsendungen dort sind weiterhin verfügbar.</span>
                    </p>
                  </div>
                </div>
              ) : (
                <Link href="/inbox" className="block min-w-0 rounded-2xl no-underline">
                  <div
                    className="bg-white rounded-2xl border border-[#EEF2F6] p-5 pb-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-6 sm:pb-5"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <p className="text-[12px]" style={{ color: "#64748B", fontWeight: 500 }}>
                        Neue Einsendungen (24h)
                      </p>
                    </div>
                    {newCount > 0 ? (
                      <>
                        <p
                          className="min-w-0 tabular-nums text-[clamp(1.75rem,9vw,2.5rem)] leading-none tracking-tight lg:text-[40px]"
                          style={{ color: "#0F172A", letterSpacing: "-0.03em", fontWeight: 600 }}
                        >
                          {newCount}
                        </p>
                        <p className="mt-3 text-[12px] font-medium text-[#2F80ED] underline-offset-2">
                          <span className="hover:underline">Zum Posteingang</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p
                          className="text-[17px] font-semibold leading-snug"
                          style={{ color: "#1E293B", letterSpacing: "-0.02em" }}
                        >
                          Keine neuen Einsendungen
                        </p>
                        <p className="mt-2 text-[12px] leading-relaxed" style={{ color: "#64748B" }}>
                          In den letzten 24 Stunden ist nichts eingegangen.
                        </p>
                        <p className="mt-3 text-[12px] font-medium text-[#2F80ED] underline-offset-2">
                          <span className="hover:underline">Zum Posteingang</span>
                        </p>
                      </>
                    )}
                  </div>
                </Link>
              )}

              {openTasks && topTasks.length > 0 ? (
                <div className="min-w-0 rounded-2xl border border-[#EEF2F6] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-6">
                  <p
                    className="mb-3 text-[11px] font-medium tracking-normal text-[#64748B]"
                    style={{ lineHeight: 1.4 }}
                  >
                    Auszug aus der Aufgabenliste
                  </p>
                  <ul className="space-y-1 sm:space-y-2">
                    {topTasks.map((t) => (
                      <li key={t.id} className="min-w-0">
                        <Link
                          href={`/my-tasks/${t.id}`}
                          className="block min-h-[44px] break-words py-2.5 text-[14px] font-medium leading-snug text-[#1E293B] hover:text-[#2F80ED] sm:py-3"
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
            className="min-w-0 rounded-2xl border border-[#EEF2F6] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:p-6 md:px-8 md:py-7"
            role="region"
            aria-label="Kurze Chronik"
          >
            <div className="mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="min-w-0">
                <h2
                  className="mb-1 text-[18px] font-semibold"
                  style={{ color: "#1E293B", letterSpacing: "-0.01em" }}
                >
                  Kurze Chronik
                </h2>
                <p className="break-words text-[13px]" style={{ color: "#64748B" }}>
                  Letzte Einsendungen und Aufgaben — Kurzauszug, kein Archiv.
                </p>
              </div>
              {activity !== null ? (
                <Link
                  href="/inbox"
                  className="inline-flex min-h-[44px] w-full min-w-0 shrink-0 items-center justify-center rounded-xl px-4 py-2 text-center text-[14px] font-medium transition-colors hover:opacity-90 sm:w-auto"
                  style={{ color: "#2F80ED", background: "rgba(47,128,237,0.08)" }}
                >
                  Zum Posteingang
                </Link>
              ) : null}
            </div>

            <div className="space-y-4">
              {activity === null ? (
                <div role="status" aria-live="polite">
                  <p className="text-[13px] leading-relaxed" style={{ color: "#64748B" }}>
                    Der Chronik-Auszug lässt sich gerade nicht laden. Posteingang und Aufgabenliste sind
                    davon unabhängig erreichbar.
                  </p>
                  <p className="mt-3 text-[13px]" style={{ color: "#64748B" }}>
                    <Link
                      href="/inbox"
                      className="font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                    >
                      Zum Posteingang
                    </Link>
                    <span style={{ color: "#94A3B8" }}> — Einsendungen sind dort unabhängig von dieser Ansicht.</span>
                  </p>
                </div>
              ) : activity.length === 0 ? (
                <div>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#64748B" }}>
                    In diesem Ausschnitt gibt es gerade keine Einträge — üblich bei wenig Volumen oder wenn
                    die letzten Vorgänge außerhalb dieses Kurzauszugs liegen.
                  </p>
                  <p className="mt-3 text-[13px]" style={{ color: "#64748B" }}>
                    <Link
                      href="/inbox"
                      className="font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                    >
                      Zum Posteingang
                    </Link>
                    <span style={{ color: "#94A3B8" }}> für den vollständigen Posteingang.</span>{" "}
                    <Link
                      href="/my-tasks"
                      className="font-medium text-[#2F80ED] underline-offset-2 hover:underline"
                    >
                      Zur Aufgabenliste
                    </Link>
                    <span style={{ color: "#94A3B8" }}> für Aufgaben.</span>
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
