import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getInboxSubmissions } from "@/lib/queries/inbox";
import { InboxSearchFigma } from "@/components/inbox/inbox-search-figma";
import { SubmissionListItemFigma } from "@/components/inbox/submission-list-item-figma";
import { InboxTrackerShell } from "@/components/inbox/inbox-tracker-shell";

interface InboxLayoutProps {
  children: React.ReactNode;
}

/** Workspace-abhängige Daten — keine statische Zwischenspeicherung öffentlicher CDN-Kanten. */
export const dynamic = "force-dynamic";

function SearchFallback() {
  return (
    <div
      className="h-11 w-full rounded-lg"
      style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
      role="status"
      aria-live="polite"
      aria-label="Suchfeld wird geladen"
    />
  );
}

/**
 * **Posteingang — Layout (Punkt 1 Zweck):** Rahmen für die **Einsendungs-/Fall-Liste** links und
 * **Fall-Detail** rechts (Desktop). „Tracker“ bezeichnet hier nur das **UI-Muster** (Liste ↔ Detail),
 * nicht ein separates CRM-/Analytics-Produkt. Mobil: eine Spalte — Liste oder Vollbild-Fall.
 *
 * **Pilot (Punkt 2 — Status):** Die linke **Sidebar** lädt die **volle** Einsendungsliste (ohne `q`),
 * damit Zähler und schneller Zugriff auf jeden Fall stabil bleiben. **Filter `q`** steuert auf der
 * **Index-Route** die gefilterte Abfrage (Desktop: erster Treffer, Leerzustände). Das ist eine
 * bewusste Scope-Entscheidung — keine technische Regression; ein späteres „Liste = Filter“ wäre
 * ein eigenes Produkt-/Architekturthema.
 *
 * **Punkt 4 — Aktionen:** Suche (`InboxSearchFigma`), Fallzeilen (`SubmissionListItemFigma` →
 * `/inbox/[id]`), mobil „Zurück zur Liste“ im Detail (`InboxMobileBack`), Arzt: Plus → `/create-case`.
 * **Punkt 5 — Tot/Fake:** Keine künstliche Listen-„Lebendigkeit“; Zeilen nutzen echte Felder,
 * neutrale Fallbacks („Ohne Kurztext“), keine Abblendung gelesener Fälle als Schein-Hierarchie.
 *
 * **Punkt 6 — Loading:** Listen-Segment lädt im Layout; `loading.tsx` zeigt nur den rechten
 * Seitenbereich — `ClinicalInboxSkeleton` ist bewusst reduziert (kein Puls, keine Chat-/CRM-Gerüste).
 *
 * **Punkt 7 — Empty:** Listen-Leerzustand und Fehler im linken Segment; Index-/Such-Leerzustände
 * im rechten Segment (Desktop). Mobil: bei aktivem `q` unter der Liste sichtbar (`InboxTrackerShell`).
 *
 * **Punkt 8 — Error:** Listen-Abfragefehler = ruhige Statusmeldung (kein technisches Detail, kein
 * Raw-DB-Text); Überschrift „Abruf derzeit nicht möglich“ statt alarmierender Formulierungen.
 *
 * **Punkt 9 — Mobile:** Shell `overflow-x-hidden` / `min-w-0`; Liste mit Touch-Scroll + Safe-Area;
 * **Detail** (`/inbox/[id]`): Sticky-Kopf, `break-words`, moderates Scroll-Padding, Hilfsspalte
 * `overscroll-y-contain` — s. `page.tsx` / `InboxTrackerShell`.
 *
 * **Punkt 10 — Security:** RLS + Session-Client; `dynamic = "force-dynamic"`; Such-Härtung in
 * `getInboxSubmissions` (s. `lib/queries/inbox.ts`). Migration **030** für `current_workspace_id()`.
 * **Detail** (`/inbox/[id]`): `getSubmissionById(id, workspace_id)`, Actions in `[id]/actions.ts`,
 * Fotos an den Client ohne Storage-Pfad — s. `page.tsx` Punkt 10.
 *
 * **Punkt 11 — MVP/Pilot:** Fokus **Intake-Liste + Fallöffnung** (Desktop Auto-Select erster Fall),
 * **einfache Suche** (`q`, Name/E-Mail), **ein Workspace** ohne Switch, **keine Pagination** auf
 * der Liste, **kein** Analytics-/Priorisierungs-/Chat-Produkt. Sidebar = volle Liste bei Suche =
 * bewusster Pilot (Punkt 2); für Praxis-Pilot **reif**, nicht als Plattform-Inbox positioniert.
 *
 * **Punkt 12 — Nice / Future / Non-MVP (Vertrag):**
 * - **Nice:** E2E/Smoke für `/inbox` + `q`, Debounce-/Perf-Feinschliff, A11y-/Spacing-Polish, Runbooks
 *   zu Migrationen/Logs, Monitoring auf `[inbox]`-Fehlercodes.
 * - **Future:** Pagination bei großen Postfächern, Sidebar = gefilterte Liste (oder RPC-Suche),
 *   Multi-Workspace-Wechsel, erweiterte Filter, Priorisierung/Analytics, Team-/Ops-Ansichten,
 *   robustere Search-Infrastruktur (Index, serverseitiges `q` im Layout).
 * - **Non-MVP (nicht bauen):** Chat/Messaging, CRM/Kanban, künstliche Aktivität, generische SaaS-Inbox-
 *   Features, Operations-/Growth-Center-Optik, aggressive CTAs — würden den Intake-Vertrag verwässern.
 *
 * **Punkt 13 — Priorität (Produkt + Betrieb):** `/inbox` ist **P0** auf dem **klinischen Intake-Pfad**
 * (Liste sichtbar, Fall öffnen, **keine falschen/fremden Falldaten**). **P0 bleibt gerechtfertigt**,
 * solange Praxis-Pilot/Demo darauf zugreift: Tenant-/RLS-Fehler oder Listen-/Detail-Mismatch wären
 * **produktkritisch**. Reihenfolge bei Änderungen: (1) **Risiko falscher/fremder Daten** + RLS/
 * Session-Kohärenz, (2) **Workspace-/Membership-Korrektheit** (Migration **030**, `getCurrentWorkspace`),
 * (3) **Intake-Liste** (`getInboxSubmissions`), (4) **Fallnavigation** (Links, Auto-Select Desktop),
 * (5) **Such-/Routing-Stabilität** (`q`, Normalisierung), (6) **Mobile-Nutzbarkeit** (`InboxTrackerShell`),
 * (7) **ruhiger professioneller UX**-Ton (Fehler/Empty). **Vor Pilot/Demo manuell:** Login mit
 * echtem Workspace, Liste lädt, Fall öffnet (Desktop + Mobil), Suche mit Treffer/Leer/Fehler,
 * kein Fremdfall nach Hard-Reload; Arzt: Plus → `/create-case` falls relevant. **Bewusst nicht mehr
 * priorisiert:** neue Inbox-Features, Search-Plattform, Pagination/Filter (s. Punkt 12 Future).
 * **QA/Monitoring/Doku statt Code:** Smoke/E2E, Log-Alerts auf Listen-/Index-Fehler, Runbook 030.
 * **Route stabil halten** — nur gezielte Fixes/Security; kein aktives „Weiterbauen“ ohne Produktauftrag.
 */
export default async function InboxLayout({ children }: InboxLayoutProps) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login?error=workspace_missing");

  const role = (workspace.role || "team") as "doctor" | "team";

  const listResult = await getInboxSubmissions(workspace.workspace_id);
  const listFailed = !listResult.ok;
  const submissions = listResult.ok ? listResult.items : [];
  const openCaseCount = submissions.filter((s) => !s.is_draft).length;

  const list = (
    <>
      <div className="px-4 pt-6 pb-0 sm:px-6 md:px-10 md:pt-12">
        <div
          style={{ marginBottom: "24px" }}
          className="flex min-w-0 items-start justify-between gap-4"
        >
          <div className="min-w-0 flex-1 pr-2">
            <h1
              className="text-[18px] md:text-[17px]"
              style={{
                color: "#0F172A",
                fontWeight: 600,
                letterSpacing: "-0.015em",
                marginBottom: "8px",
              }}
            >
              Einsendungen
            </h1>
            <p className="text-[15px] md:text-[14px]" style={{ color: "#2B6FE8", fontWeight: 600 }}>
              {listFailed
                ? "Abruf derzeit nicht möglich"
                : `${openCaseCount} offene ${openCaseCount === 1 ? "Fall" : "Fälle"}`}
            </p>
          </div>
          {role === "doctor" ? (
            <Link
              href="/create-case"
              title="Neuer Fall"
              aria-label="Neuer Fall anlegen"
              className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-[10px] text-white transition hover:opacity-95 md:h-10 md:w-10"
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
          <div className="min-w-0">
            <InboxSearchFigma listUnavailable={listFailed} />
          </div>
        </Suspense>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 [-webkit-overflow-scrolling:touch] md:px-3 md:pb-4 md:pt-8">
        {listFailed ? (
          <div
            className="mx-1 rounded-xl px-4 py-5 text-[14px] leading-relaxed"
            style={{ color: "#64748B", background: "rgba(255,255,255,0.85)" }}
            role="status"
            aria-live="polite"
          >
            <p className="font-medium" style={{ color: "#0F172A" }}>
              Einsendungen können momentan nicht geladen werden
            </p>
            <p className="mt-2">
              Bitte die Seite in Kürze erneut öffnen. Wenn das Problem bleibt, die Seite neu laden.
            </p>
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
              Neue Eingänge erscheinen in dieser Übersicht.
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
    </>
  );

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-x-hidden">
      <InboxTrackerShell list={list} detail={children} />
    </div>
  );
}
