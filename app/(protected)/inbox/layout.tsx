import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getInboxSubmissions } from "@/lib/queries/inbox";
import { InboxSearchFigma } from "@/components/inbox/inbox-search-figma";
import { SubmissionListItemFigma } from "@/components/inbox/submission-list-item-figma";
import { HcCard } from "@/components/design/hc-card";
import { InboxTrackerShell } from "@/components/inbox/inbox-tracker-shell";
import { HC } from "@/lib/design/healthcare-dashboard-tokens";

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
 * **Detail** (`/inbox/[id]`): Triage + Entwurf/Kopie + Terminlink nach Klick — s. `page.tsx` Punkt 11.
 *
 * **Punkt 12 — Nice / Future / Non-MVP (Vertrag, Liste + `/inbox/[id]`):** Langfristiger
 * **Produktgrenz-Vertrag** — bei Konflikt mit „größer/intelligenter wirkender Plattform“ gilt immer:
 * **ruhigeres, ehrlicheres MVP** (Punkt 11). Änderungen nur mit Produktauftrag; hier keine Features
 * vorbauen.
 * - **Nice (klein, ohne Architektur):** E2E/Smoke für `/inbox`, `/inbox/[id]` + `q`; echte Geräte-QA
 *   (iOS Keyboard, Safe Area); A11y-/Spacing-Polish; Debounce-/Perf-Feinschliff; Monitoring/Alerts auf
 *   bekannte Fehlercodes; kleine PhotoViewer-/ZIP-Polishs; interne Runbooks (Migrationen, RLS).
 * - **Future (Roadmap/Infra, nicht Pilot):** Pagination / serverseitige Suche; Sidebar = gefilterte Liste
 *   oder RPC-Suche; Multi-Workspace-/Ops-Ansichten; **Detail:** echte Versand-/Audit-Pipeline,
 *   Kommunikations**historie**, strukturierte Patientenakte, erweiterte klinische Einordnung / Priorität,
 *   echte KI-Assistenz (nur wenn klar getrennt vom MVP), robustere Search-Infrastruktur.
 * - **Non-MVP (nicht bauen):** autonome KI-Kommunikation; Auto-SMS/E-Mail aus der Detailseite;
 *   CRM-/Supportdesk-/Chat-Plattform; künstliche Dringlichkeit oder Aktivität; generische AI-/Operations-
 *   Center-Optik; übertriebene Clinical-AI-Sprache; vollwertige Patientenverwaltung; alles, was den
 *   Intake-Vertrag (Triage + kontrollierte Hilfe) verwässert — s. `page.tsx` Punkt 11.
 *
 * **Punkt 13 — Priorität (Produkt + Betrieb, Liste + `/inbox/[id]`):** **`/inbox` inkl. Fall-Detail**
 * ist **ein durchgängiger P0-Pfad** auf dem **klinischen Intake-MVP** — Triage endet nicht an der Liste:
 * geöffneter Fall (Fotos, Notiz, Einordnung, **Hilfsspalte nur Entwurf/Kopie + bewusste Aktionen**)
 * gehört **dasselbe Prioritätsniveau** wie Liste und Navigation. **P0 bleibt gerechtfertigt**, solange
 * Pilot/Demo darauf arbeitet. **Produktkritische Regressionen:** Fremdfall sichtbar oder per ID
 * erreichbar; Schreib-/Lesepfade ohne **Workspace-/RLS-Kohärenz**; UI suggeriert **Auto-Versand oder
 * KI-Autonomie**; **Entwurf wird als versendet** dargestellt; Kernaktionen (Chips, ZIP, Terminlink,
 * Kopie) **still** kaputt; **Listen-Detail-Mismatch** nach `q`/Navigation/Reload; Mobile: Kernpfade
 * (Scroll, Keyboard, Zurück) blockiert. **Reihenfolge bei Änderungen:** (1) **falsche/fremde Daten**
 * + RLS/Session, (2) **Workspace-/Membership**, (3) **klinische Triage-Nutzbarkeit** Liste **und**
 * Detail, (4) Fallnavigation, (5) **`q`/Routing**, (6) **Mobile-Stabilität**, (7) **ruhiger UX-Ton**
 * + **ehrliche Kommunikationsdarstellung** (Hilfe ≠ Kanal), (8) **keine Fake-KI**, **kein CRM-/Ops-
 * Center-Drift**, **keine falsche klinische Autorität** (Einordnung = Praxiswahl). **Konfliktregel:**
 * bei Zielkonflikt **Stabilität, Ruhe und Ehrlichkeit** vor „mehr Plattform“. **Vor Pilot/Demo manuell**
 * (ergänzend): Detail — Fotos/Viewer, leere Notiz, Zeitraum-Chips, Entwurf kopieren, Arzt-Terminlink
 * nur mit Erwartung „Klick löst Aktion“, ZIP, Command nur Hilfe; Hard-Reload auf `/inbox/[id]` ohne
 * Fremdfall; zuvor Layout-Checks (Login, Liste, Suche, Plus Arzt). **Bewusst nicht mehr priorisiert**
 * (Feature-Code): Inbox-Plattform-Ausbau, Pagination/serverseitige Suche, neue Kommunikations-/Tracker-
 * Produkte — s. Punkt 12 **Future**. **QA/Monitoring/Doku statt Ausbau:** Smoke/E2E, Geräte-QA, Log-
 * Alerts auch für **Detail-Actions**, Runbook Migration 030 und RLS (Punkt 10 bis echter Prod-QA **fast final**).
 * **Kein Grund zur aktiven Weiterentwicklung** ohne Produktauftrag — **Route stabil halten**, nur
 * gezielte Fixes/Security. **Nicht versehentlich wieder einführen:** Auto-SMS/E-Mail, autonome KI,
 * künstliche Dringlichkeit, CRM-/Chat-Produkt, generische Ops-/AI-Optik, übertriebene Clinical-AI-
 * Sprache — s. Punkt 12 **Non-MVP** und Punkt 11 **MVP-Grenze**.
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
    <HcCard className="flex h-full min-h-0 flex-col overflow-hidden md:mx-2 md:my-2">
      <div className="shrink-0 px-5 pb-4 pt-5 md:px-6 md:pt-6">
        <div className="mb-5 flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0 flex-1 pr-2">
            <h1
              className="text-[22px] font-bold tracking-tight md:text-[26px]"
              style={{ color: HC.text, marginBottom: "4px" }}
            >
              Einsendungen
            </h1>
            <p className="text-[14px] font-medium" style={{ color: HC.primary }}>
              {listFailed
                ? "Abruf derzeit nicht möglich"
                : `${openCaseCount} offene ${openCaseCount === 1 ? "Fall" : "Fälle"}`}
            </p>
          </div>
          {role === "doctor" ? (
            <Link
              href="/create-case?from=inbox"
              title="Neuer Fall"
              aria-label="Neuer Fall anlegen"
              className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl text-white transition hover:opacity-95 md:h-10 md:w-10"
              style={{
                background: HC.primary,
                boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
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

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-[max(20px,env(safe-area-inset-bottom))] pt-2 [-webkit-overflow-scrolling:touch] md:px-5 md:pb-6 md:pt-2">
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
    </HcCard>
  );

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-x-hidden">
      <InboxTrackerShell list={list} detail={children} />
    </div>
  );
}
