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
import { InboxDesktopAutoSelect } from "@/components/inbox/inbox-desktop-auto-select";

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
      <div
        className="flex h-full min-h-[280px] flex-col items-center justify-center px-6"
        style={{ padding: "32px 40px 40px" }}
        role="status"
        aria-live="polite"
      >
        <p className="max-w-md text-center text-[15px] font-medium" style={{ color: "#0F172A" }}>
          Einsendungen können momentan nicht geladen werden
        </p>
        <p
          className="mt-3 max-w-md text-center text-[14px] leading-relaxed"
          style={{ color: "#64748B" }}
        >
          Bitte versuchen Sie es in einem Moment erneut. Wenn das Problem bleibt, laden Sie die Seite
          neu.
        </p>
      </div>
    );
  }

  const submissions = listResult.items;

  if (submissions.length > 0) {
    const desktopHref = qTrimmed
      ? `/inbox/${submissions[0].id}?q=${encodeURIComponent(qTrimmed)}`
      : `/inbox/${submissions[0].id}`;

    return <InboxDesktopAutoSelect href={desktopHref} />;
  }

  if (qTrimmed) {
    return (
      <div
        className="flex h-full min-h-[280px] flex-col items-center justify-center"
        style={{ padding: "32px 40px 40px" }}
      >
        <p className="text-center text-[15px] font-medium" style={{ color: "#0F172A" }}>
          Keine Treffer für diese Suche
        </p>
        <p className="mt-3 max-w-md text-center text-[14px] leading-relaxed" style={{ color: "#64748B" }}>
          Bitte einen anderen Suchbegriff versuchen oder die Suche leeren. Die Übersicht links zeigt
          weiterhin alle Einsendungen; diese Meldung betrifft nur die aktuelle Suche.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-[280px] flex-col items-center justify-center"
      style={{ padding: "32px 40px 40px" }}
    >
      <p className="text-center text-[15px] font-medium" style={{ color: "#0F172A" }}>
        Keine Eingänge
      </p>
      <p className="mt-3 max-w-md text-center text-[14px] leading-relaxed" style={{ color: "#64748B" }}>
        Hier erscheint die Bearbeitungsansicht, sobald Einsendungen vorliegen.
      </p>
    </div>
  );
}
