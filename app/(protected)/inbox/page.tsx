/**
 * **`/inbox` (Index, Punkt 1 — Zweck):** Einstieg in den **Posteingang** als **Fall-/Intake-Liste**
 * (`submissions`). Kein CRM, kein Chat, kein Dashboard — nur Auswahl und Weiterleitung zum Fall.
 * **Desktop:** Bei vorhandenen Einsendungen öffnet `InboxDesktopAutoSelect` den **ersten** Fall in
 * der Split-Ansicht (`/inbox/[id]`), damit die Arbeitsfläche sofort nutzbar ist. **Mobil:** Liste
 * als Hauptfläche; bei **aktiver Suche (`q`)** wird der rechte Bereich unter der Liste eingeblendet
 * (leere Suchergebnisse). Suche über `q` wird an die Ziel-URL durchgereicht.
 * **Leerzustände (Index):** Echter Leer-Posteingang vs. „keine Treffer“ bei aktivem `q` — getrennte
 * Kurzmeldungen; sachliche Formulierungen ohne „automatisch“-Marketing (Punkt 5). Fehler nur bei
 * fehlgeschlagener Abfrage. Bedeutungslose `q`-Werte (leer / nur Whitespace) werden serverseitig
 * auf `/inbox` normalisiert.
 * **Punkt 7 — Empty:** Rechte Spalte bei leerem Workspace („Keine Eingänge“) vs. Suchtreffer vs.
 * Fehler; mobil bei aktivem `q` zeigt `InboxTrackerShell` den Detail-Slot unter der Liste.
 * **Punkt 8 — Error:** Index-Abfragefehler mit gleicher Tonalität wie die Listen-Fehlermeldung;
 * keine technischen Supabase-Strings in der UI.
 * **Punkt 9 — Mobile:** Shell/Listen-Verhalten s. `InboxTrackerShell` und Layout; Index nutzt
 * dieselbe Tracker-Logik wie Desktop (Auto-Weiterleitung nur ab `md`).
 * **Punkt 11 — MVP/Pilot:** vollständiger Scope s. `inbox/layout.tsx` (Intake, ein Workspace, kein
 * Feature-Überbau).
 * **Punkt 12 — Nice/Future/Non-MVP:** Klassifizierung und langfristiger Inbox-„Vertrag“ s.
 * `inbox/layout.tsx` (Punkt 12).
 * **Punkt 13 — Priorität (P0, Stabilisierung, Liste + `/inbox/[id]`):** vollständig s.
 * `inbox/layout.tsx` (Punkt 13).
 */
import { redirect } from "next/navigation";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import {
  inboxSearchQueryFromParam,
  shouldStripInboxSearchParamFromUrl,
} from "@/lib/inbox-search-q";
import { getInboxSubmissions } from "@/lib/queries/inbox";
import { sortTrackerInboxItems } from "@/lib/inbox/tracker-inbox-logic";
import type { EnrichedSubmissionListItem } from "@/lib/inbox/tracker-inbox-logic";

interface InboxPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const workspace = await getCurrentWorkspace();
  const params = await searchParams;

  if (!workspace) {
    redirect("/login?error=workspace_missing");
  }

  if (shouldStripInboxSearchParamFromUrl(params.q)) {
    redirect("/inbox");
  }

  const qTrimmed = inboxSearchQueryFromParam(params.q);
  const listResult = await getInboxSubmissions(
    workspace.workspace_id,
    qTrimmed || undefined
  );

  if (!listResult.ok) {
    return (
      <div className="yd-triage-placeholder" role="status" aria-live="polite">
        <p className="yd-triage-placeholder__title">
          Einsendungen können momentan nicht geladen werden
        </p>
        <p className="yd-triage-placeholder__lead">
          Bitte später erneut versuchen oder die Seite neu laden.
        </p>
      </div>
    );
  }

  const submissions = listResult.items;

  if (submissions.length > 0 && !qTrimmed) {
    const sorted = sortTrackerInboxItems(submissions as EnrichedSubmissionListItem[]);
    redirect(`/inbox/${sorted[0]!.id}`);
  }

  if (qTrimmed) {
    return (
      <div className="yd-triage-placeholder">
        <p className="yd-triage-placeholder__title">Keine Treffer für diese Suche</p>
        <p className="yd-triage-placeholder__lead">
          Anderen Begriff versuchen oder Suche leeren.
        </p>
      </div>
    );
  }

  return (
    <div className="yd-triage-placeholder">
      <p className="yd-triage-placeholder__title">Keine Eingänge</p>
      <p className="yd-triage-placeholder__lead">
        Sobald Einsendungen vorliegen, erscheinen sie in der Liste links.
      </p>
    </div>
  );
}
