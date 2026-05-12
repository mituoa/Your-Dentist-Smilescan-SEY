import type { Metadata } from "next";
import { Suspense } from "react";

import { InboxPreviewView } from "./inbox-preview-view";

/**
 * `/inbox-preview` — MVP-Scope (Sales/Demo, P2, optional)
 *
 * **Zweck:** Ruhige, hochwertige **UI-Vorschau** der Oberfläche „Einsendungen“ mit **festen Beispieldaten**
 * (lokales Asset unter `public/inbox-preview/`), **ohne** Praxisdaten, **ohne** Backend/Supabase in dieser Route.
 *
 * **Im MVP:** Navigation + Suche im Mock, Detaildarstellung, Banner-Hinweis, Link `/login`, responsives Layout,
 * Leer-/Fehlertexte, `noindex` + `X-Robots-Tag` (next.config), Suspense wegen `useSearchParams`.
 *
 * **Bewusst nicht im MVP:** Echte Inbox-/Workspace-Logik, Persistenz, Auth hier, Live-/Echtzeit-Daten,
 * ZIP-Export, KI-/Triage-Produktanspruch, Sales-Theatralik, produktionsgleiche Mobile-Parität.
 *
 * **Punkt 12 — Nice / Future / Non-MVP (Schutz vor Scope-Creep und „Fake-Produkt“):**
 * - **Nice (klein, ohne neue Features):** Typo-/Spacing-Rhythmus an vorhandener UI; echte Geräte-QA (Safari, kurze
 *   Viewports, langsames Netz); kleine A11y-/Fokus-/aria-Feinschliffe; Mock-Copy konsistent und nicht „busy“ halten;
 *   **interne** Demo-/Sales-Runbooks außerhalb des Codes — **kein** Layout-Redesign, **keine** „cooleren“ Effekte.
 * - **Future (eigene Initiativen, nicht diese Route aufblasen):** echte Produktdaten; Zugangsbeschränkte oder
 *   interne Vorschau; erweiterte Demo-Szenarien; echte Kommunikations-/Termin-Vorschau; strukturierte
 *   Mock-Daten-Pipelines; Staging- oder demo-nähere Umgebungen — jeweils **explizit** geplant, nicht schleichend in
 *   `/inbox-preview`.
 * - **Non-MVP (nicht bauen):** Fake-Live- oder Echtzeit-Listen, Fake-KI/Autonomie, künstliche KPIs/Aktivität,
 *   CRM-/Operations-Center-Wirkung, aggressive Sales-Theatralik, KI-Showcase-UI, komplexe Demo-Mechanik,
 *   **separate Demo-Plattform**. Konflikt **Ruhe vs. Beeindrucken** → **Ruhe und Ehrlichkeit** (Enterprise Medical SaaS).
 * - **Scope-Creep-Warnung:** Geteilte Inbox-Komponenten **nicht** mit Preview-Sonderlogik überfrachten; keine zweite
 *   Produkt-Wahrheit. Öffentliche Route bleibt **UI-only und klar begrenzt**, damit sie nicht wie ein **getarntes Live-Produkt** wirkt.
 *
 * **Punkt 13 — Priorität (P2: Stabilität, Ehrlichkeit, Ruhe vor „coole Demo“):**
 * - **Rang im Gesamtprodukt:** optional begleitend für Orientierung an der Einsendungen-Oberfläche; **nie** Blocker für
 *   Intake, Auth, Workspace oder die echte Inbox — **nachgelagert** zu P0 und P1.
 * - **P2 bleibt korrekt**, solange die Route öffentlich begrenzt, ohne Backend und abschaltbar per Flag bleibt.
 * - **Kritische Regressionen (trotz P2):** Kill-Switch und 404-Verhalten; `noindex` plus HTTP-Robots-Header; kein
 *   Datenabruf und keine Session-Pflicht hier; Banner und Begrenzungstexte dürfen kein Live-Produkt vortäuschen;
 *   Änderungen an geteilten Inbox-Komponenten dürfen die **produktive** Inbox nicht verschlechtern.
 * - **Vor echten Sales-, Partner- oder Investoren-Demos manuell prüfen:** Env-Flag; Anmeldelink; Mobile-Scroll und
 *   kurze Viewports; langsames Netz; Beispielbild-Pfad unter `public/inbox-preview/`; Gesprächsführung als UI-Vorschau
 *   mit fiktiven Daten (keine Zusage zum Daten- oder Funktionsumfang des Produkts).
 * - **Bewusst nicht mehr anfassen ohne klaren Auftrag:** funktionaler Ausbau, mehr Demo-Szenarien, Sales-Theatralik,
 *   KI-, Ops- oder CRM-Anmutung, „beeindruckendere“ Effekte — **Stabilität** schützt Glaubwürdigkeit.
 * - **QA, Monitoring, Runbooks** gehören zu Betrieb und GTM, nicht zur Produkt-Roadmap dieser Route: Geräte-QA;
 *   Zugriffs- oder Fehlerbeobachtung auf Infra-Ebene wenn nötig; internes Demo-Runbook (Freigabe, Story, Tabus).
 * - **Kein Grund für aktiven funktionalen Ausbau** — Route **eher stabil halten**; Änderungen nur bei Bugfix,
 *   Sicherheit, Regressionsfix in Shared Components oder minimalem Copy-Tuning laut Punkt 12 Nice.
 * - **Sofort billiger oder startupiger:** Badge-Flut, Echtzeit-Sprache, KPIs, KI-Narrative, laute Farben, neue
 *   Sonderfälle, „Show“-Animationen — unterlassen.
 * - **Besonders schützen:** keine Fake-Live-Daten; keine KI-, CRM- oder Ops-Center-Vortäuschung; keine endlose
 *   Mobile-Perfektionierung als Parallelprodukt — P2 heißt nicht „zweite Inbox“.
 *
 * **Finalisierung (Route im Scope abgeschlossen):** Es liegen **keine** bekannten offenen Produkt-, UX-,
 *   Architektur- oder Trust-Lücken **in dieser Route** vor, die „fast final“ rechtfertigen würden. Wiederkehrende
 *   Geräte-QA, Betriebsregeln, Demo-Disziplin und GTM-Prozesse sind **operativer Normalbetrieb**, kein offenes
 *   Routen-Backlog. **Stabilisieren:** ohne neuen Auftrag funktional nicht weiter ausbauen (s. Punkt 13); Änderungen
 *   nur bei Bugfix, Sicherheit oder regressionsbedingt über geteilte Inbox-Komponenten.
 *
 * **Route:** außerhalb `(protected)` — kein Session-Zwang. **Abschalten:** Server-Env `INBOX_PREVIEW_ENABLED=false`
 * oder `0` → `layout.tsx` liefert 404 (siehe `.env.example`).
 */
export const metadata: Metadata = {
  title: "Einsendungen – UI-Vorschau (Demo)",
  description:
    "Statische UI-Vorschau mit fiktiven Beispieldaten. Ohne Anmeldung, ohne Datenbankanbindung, ohne Echtzeit.",
  robots: { index: false, follow: true },
};

function InboxPreviewFallback() {
  return (
    <div
      className="box-border flex h-[100dvh] flex-col pb-[env(safe-area-inset-bottom,0px)]"
      style={{ background: "#FAFBFC" }}
    >
      <div
        className="shrink-0 border-b px-3 pb-3 text-center text-[13px] leading-snug sm:px-4"
        style={{
          borderColor: "#E2E8F0",
          background: "#F8FAFC",
          color: "#64748B",
          paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))",
        }}
      >
        <strong style={{ color: "#0F172A" }}>UI-Vorschau (Demo)</strong>
      </div>
      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 text-center sm:px-6"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-[14px]" style={{ color: "#64748B" }}>
          Die Oberfläche wird angezeigt …
        </p>
        <p className="mt-2 max-w-sm text-[12px] leading-snug" style={{ color: "#94A3B8" }}>
          Kein Abruf von Praxisdaten — nur lokale Beispieldaten.
        </p>
      </div>
    </div>
  );
}

export default function InboxPreviewPage() {
  return (
    <Suspense fallback={<InboxPreviewFallback />}>
      <InboxPreviewView />
    </Suspense>
  );
}
