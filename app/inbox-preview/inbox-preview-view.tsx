"use client";

/**
 * Client-UI der öffentlichen Einsendungen-Vorschau (`/inbox-preview`).
 *
 * **Vertrag und Finalisierung:** `page.tsx` (MVP, Punkte 12–13, Route im Scope abgeschlossen).
 *
 * **Umsetzung hier:** feste Mock-Daten; keine Produkt-Backend-Calls; ZIP aus; Beispiel-Badges/Texte;
 * statische Datumsanzeige; URL-Abgleich `id`; Mobile-Stack unter `lg`; lokales Demo-Bild unter `public/inbox-preview/`.
 */

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { InboxSearchFigma } from "@/components/inbox/inbox-search-figma";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { PhotoViewer } from "@/components/inbox/photo-viewer";
import { SubmissionListItemFigma } from "@/components/inbox/submission-list-item-figma";

type MockCase = {
  id: string;
  patient_name: string | null;
  patient_notes: string | null;
  patient_birth_date: string | null;
  patient_external_id: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  urgency: "today" | "this_week" | "not_urgent" | null;
  is_draft: boolean;
  created_at: string;
  seen_at: string | null;
  photoUrl: string | null;
};

/** Feste Zeitstempel (kein Bezug zu `Date.now()`), damit die Vorschau keine künstliche „Live“-Aktualität suggeriert. */
const MOCK_CASES: MockCase[] = [
  {
    id: "mock-1",
    patient_name: "Erika Mustermann",
    patient_notes:
      "Beim Essen ist mir hinten rechts ein großer Backenzahn abgebrochen. Seitdem habe ich starke Schmerzen, besonders bei Kälte und beim Kauen. Die Stelle ist sehr empfindlich; beim Putzen blutet es manchmal leicht. Auf dieser Seite kann ich kaum noch kauen.\n\nSehr geehrte Damen und Herren,\n\nich bitte um zeitnahe Hilfe.\n\nMit freundlichen Grüßen",
    patient_birth_date: "1975-05-15",
    patient_external_id: "MUSTER-001",
    patient_email: "erika.mustermann@example.com",
    patient_phone: null,
    urgency: "today",
    is_draft: false,
    created_at: "2026-05-10T09:15:00.000Z",
    seen_at: null,
    photoUrl: "/inbox-preview/beispielabbildung.svg",
  },
  {
    id: "mock-2",
    patient_name: "Max Mustermann",
    patient_notes: "Schmerzen im oberen rechten Bereich seit einigen Tagen.",
    patient_birth_date: "1988-03-22",
    patient_external_id: null,
    patient_email: "max.mustermann@example.com",
    patient_phone: null,
    urgency: "this_week",
    is_draft: false,
    created_at: "2026-05-09T14:30:00.000Z",
    seen_at: "2026-05-10T08:00:00.000Z",
    photoUrl: null,
  },
  {
    id: "mock-3",
    patient_name: "Anna Mustermann",
    patient_notes: "Zahnfleischbluten nach dem Zähneputzen, eher leicht.",
    patient_birth_date: null,
    patient_external_id: null,
    patient_email: "anna.mustermann@example.com",
    patient_phone: null,
    urgency: "not_urgent",
    is_draft: false,
    created_at: "2026-05-08T11:00:00.000Z",
    seen_at: "2026-05-09T10:00:00.000Z",
    photoUrl: null,
  },
];

/** Kalenderdatum aus dem ISO-Datum (Datumsteil, UTC) — in der Vorschau stabil über Tage hinweg. */
function formatStaticDeDate(iso: string): string {
  const part = iso.split("T")[0];
  const [y, m, d] = part.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return "";
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBirthDe(value: string | null): string | null {
  if (!value) return null;
  const part = value.split("T")[0];
  const [y, m, d] = part.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function previewUrgencyIllustration(urgency: string | null): { text: string; color: string } | null {
  const color = "#64748B";
  switch (urgency) {
    case "today":
      return {
        text: "Möglicher akuter Behandlungsbedarf — hier nicht bewertet, nur zur Ansicht.",
        color,
      };
    case "this_week":
      return {
        text: "Zeitnahe Terminplanung wäre denkbar — nur Orientierung, ohne Speicherung.",
        color,
      };
    case "not_urgent":
      return {
        text: "Routinemäßig planbar — nur Orientierung, ohne Speicherung.",
        color,
      };
    default:
      return null;
  }
}

function previewDispositionCopy(urgency: string | null): string {
  switch (urgency) {
    case "today":
      return "Kurzfristige Terminplanung kann in der Praxis sinnvoll sein. Dieser Abschnitt dient nur der Darstellung — es erfolgt keine Speicherung oder Übermittlung.";
    case "this_week":
      return "Ein Termin in den nächsten Tagen ist oft möglich. Nur Darstellung — keine Speicherung.";
    case "not_urgent":
      return "Nach Praxis-Kapazität planbar. Nur Darstellung — keine Speicherung.";
    default:
      return "Das weitere Vorgehen entscheidet die Praxis. In der Vorschau ist nichts hinterlegt.";
  }
}

export function InboxPreviewView() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const searchKey = searchParams.toString();

  const filteredCases = useMemo(() => {
    if (!q) return MOCK_CASES;
    return MOCK_CASES.filter(
      (c) =>
        (c.patient_name || "").toLowerCase().includes(q) ||
        (c.patient_notes || "").toLowerCase().includes(q)
    );
  }, [q]);

  const selected = useMemo(() => {
    if (filteredCases.length === 0) return null;
    const byId = idParam ? filteredCases.find((c) => c.id === idParam) : null;
    return byId ?? filteredCases[0];
  }, [filteredCases, idParam]);

  useEffect(() => {
    if (pathname !== "/inbox-preview") return;
    if (filteredCases.length === 0 || !idParam) return;
    if (filteredCases.some((c) => c.id === idParam)) return;
    const params = new URLSearchParams(searchKey);
    params.set("id", filteredCases[0]!.id);
    router.replace(`/inbox-preview?${params.toString()}`);
  }, [pathname, idParam, filteredCases, router, searchKey]);

  const openCount = MOCK_CASES.filter((c) => !c.is_draft).length;
  const issueTitle = selected
    ? deriveSubmissionIssueShortLine(selected.patient_notes, selected.patient_name, {
        maxLen: 64,
        emptyLabel: "Einsendung",
      })
    : "";
  const patientLabel = selected?.patient_name || "Unbekannter Patient";
  const metaLabel = selected
    ? `${patientLabel} · ${formatStaticDeDate(selected.created_at)}`
    : "";
  const birthStr = selected ? formatBirthDe(selected.patient_birth_date) : null;
  const idStr = selected?.patient_external_id?.trim() || null;
  const secondMeta = [birthStr, idStr ? `Beispiel-ID: ${idStr}` : null].filter(Boolean).join(" · ");
  const urgencyLine = selected ? previewUrgencyIllustration(selected.urgency) : null;
  const recAction = selected ? previewDispositionCopy(selected.urgency) : "";

  const photos =
    selected?.photoUrl == null
      ? []
      : [
          {
            id: "demo-1",
            sort_order: 0,
            signed_url: selected.photoUrl,
          },
        ];

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
        <strong style={{ color: "#0F172A" }}>UI-Vorschau (Demo)</strong> – fiktive
        Beispieldaten zur Orientierung an der Oberfläche „Einsendungen“. Keine Datenbank, keine
        Anmeldung, keine Echtzeit-Aktualisierung.{" "}
        <a
          href="/login"
          className="font-medium text-[#2F80ED] underline"
          title="Zur Anmeldeseite (Produktbereich)"
        >
          Zum Anmelden
        </a>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(15,23,42,0.03), transparent 36%)",
          }}
        />

        <div className="relative z-10 flex h-full min-h-0 flex-col lg:flex-row">
          <aside className="flex max-h-[44svh] min-h-0 w-full min-w-0 flex-col border-b border-[#E2E8F0] bg-[#FAFBFC] lg:max-h-none lg:h-full lg:w-[38%] lg:max-w-[480px] lg:min-w-[280px] lg:border-b-0 lg:border-r lg:border-r-[#E2E8F0]">
            <div className="shrink-0 px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
              <div className="mb-4 sm:mb-5">
                <h1
                  className="text-[18px]"
                  style={{
                    color: "#0F172A",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    marginBottom: "4px",
                  }}
                >
                  Einsendungen
                </h1>
                <p className="text-[13px]" style={{ color: "#64748B", fontWeight: 500 }}>
                  {openCount} fiktive Beispieleinträge — keine Live-Daten
                </p>
              </div>
              <InboxSearchFigma
                routeBase="/inbox-preview"
                inputPlaceholder="In Beispielen filtern…"
                searchAriaLabel="Beispieldaten in der Vorschau durchsuchen"
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 pb-3 sm:px-3">
              {filteredCases.length === 0 ? (
                <div className="px-3 py-6 text-center">
                  <p className="text-[13px]" style={{ color: "#64748B" }}>
                    Kein Treffer unter den Beispieldaten.
                  </p>
                  <p className="mt-2 text-[12px] leading-snug" style={{ color: "#94A3B8" }}>
                    Der Filter gilt nur für die drei festen Beispieleinträge. Eingabe anpassen oder
                    leeren.
                  </p>
                </div>
              ) : (
                filteredCases.map((s) => (
                  <SubmissionListItemFigma
                    key={s.id}
                    id={s.id}
                    patientName={s.patient_name}
                    patientNotes={s.patient_notes}
                    createdAt={s.created_at}
                    createdAtDisplay={formatStaticDeDate(s.created_at)}
                    seenAt={s.seen_at}
                    isDraft={s.is_draft}
                    hrefOverride={`/inbox-preview?id=${encodeURIComponent(s.id)}`}
                    activeOverride={selected != null && selected.id === s.id}
                    listPresentation="preview"
                  />
                ))
              )}
            </div>
          </aside>

          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
            {!selected ? (
              <div
                className="flex h-full flex-col items-center justify-center px-8 text-center"
                role="status"
                aria-live="polite"
              >
                <p className="text-[14px]" style={{ color: "#64748B" }}>
                  Kein Beispieleintrag zum Anzeigen.
                </p>
                <p className="mt-2 max-w-md text-[13px] leading-snug" style={{ color: "#94A3B8" }}>
                  Die Detailspalte folgt der Liste. Filter anpassen oder das Suchfeld leeren.
                </p>
              </div>
            ) : null}
            {selected ? (
            <div className="flex h-full flex-col overflow-hidden">
              <div
                className="shrink-0 border-b border-[#EEF2F6] bg-white px-4 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-8"
              >
                <h2
                  className="text-[22px] sm:text-[26px]"
                  style={{
                    color: "#0F172A",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    marginBottom: "8px",
                    lineHeight: "1.3",
                  }}
                >
                  {issueTitle}
                </h2>
                <p className="text-[14px]" style={{ color: "#64748B" }}>
                  {metaLabel}
                  {selected?.is_draft ? (
                    <span className="ml-2 text-[12px] font-medium text-amber-700">Entwurf</span>
                  ) : null}
                </p>
                {secondMeta ? (
                  <p className="mt-1 text-[14px]" style={{ color: "#64748B" }}>
                    {secondMeta}
                  </p>
                ) : null}
                {urgencyLine ? (
                  <p className="mt-2 text-[14px] font-medium" style={{ color: urgencyLine.color }}>
                    {urgencyLine.text}
                  </p>
                ) : null}
                <p className="mt-2 text-[12px] leading-snug" style={{ color: "#94A3B8" }}>
                  Zur Orientierung in der Vorschau — keine klinische Bewertung durch die Software.
                </p>
              </div>

              <div
                className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-white px-4 py-6 sm:px-10 sm:py-10"
              >
                <div className="mb-6 sm:mb-8">
                  <div
                    className="max-h-[220px] overflow-hidden rounded-[12px] border border-[#EEF2F6] bg-white lg:max-h-[300px]"
                  >
                    <PhotoViewer
                      submissionId={selected.id}
                      photos={photos}
                      patientName={patientLabel}
                      enableZipDownload={false}
                      primaryImageAlt="Neutrales Beispielbild (Vorschau, kein klinischer Befund)"
                      noPhotosPrimaryText="Kein Beispielbild für diesen Eintrag hinterlegt."
                      noPhotosAriaLabel={`Kein Beispielbild in der Vorschau — ${patientLabel}`}
                      imageUnavailableText="Das Beispielbild konnte hier nicht geladen werden."
                    />
                  </div>
                </div>

                <div className="mb-6 max-w-[600px] sm:mb-8">
                  <p
                    className="text-[11px] uppercase"
                    style={{
                      color: "#94A3B8",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      marginBottom: "12px",
                    }}
                  >
                    Beschreibung
                  </p>
                  <p className="text-[15px]" style={{ color: "#1E293B", lineHeight: "1.6" }}>
                    {selected.patient_notes?.trim()
                      ? selected.patient_notes
                      : "Für dieses Beispiel ist kein Beschreibungstext hinterlegt."}
                  </p>
                </div>

                <div className="max-w-[600px]">
                  <div className="border-t border-[#EEF2F6] pt-6 sm:pt-8">
                    <p
                      className="text-[14px] leading-relaxed"
                      style={{ color: "#475569", marginBottom: "20px" }}
                    >
                      {recAction}
                    </p>

                    <p
                      className="text-[11px] uppercase"
                      style={{
                        color: "#94A3B8",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        marginBottom: "10px",
                      }}
                    >
                      Zeitraum (Beispiel)
                    </p>
                    <p
                      className="mb-2 max-w-xl text-[12px] leading-snug"
                      style={{ color: "#94A3B8" }}
                    >
                      Nur Darstellung — keine Priorisierung änderbar.
                    </p>
                    <div
                      className="mb-8 flex flex-wrap gap-2"
                      aria-label="Beispielhafte Prioritätsetiketten, nicht wählbar"
                    >
                      {(
                        [
                          { id: "today", label: "Heute" },
                          { id: "this_week", label: "Diese Woche" },
                          { id: "not_urgent", label: "Nicht dringend" },
                        ] as const
                      ).map((opt) => {
                        const active = selected.urgency === opt.id;
                        return (
                          <span
                            key={opt.id}
                            className="cursor-default select-none rounded-[10px] border px-4 py-2 text-[14px] font-medium"
                            style={{
                              borderColor: active ? "#2F80ED" : "#E2E8F0",
                              background: active ? "rgba(47,128,237,0.08)" : "#FFFFFF",
                              color: active ? "#1C6FD8" : "#64748B",
                            }}
                          >
                            {opt.label}
                          </span>
                        );
                      })}
                    </div>

                    <p
                      className="text-[11px] uppercase"
                      style={{
                        color: "#94A3B8",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        marginBottom: "12px",
                      }}
                    >
                      Nächste Schritte
                    </p>
                    <div
                      className="rounded-lg border px-4 py-4 text-[14px] leading-relaxed"
                      style={{
                        borderColor: "#E2E8F0",
                        background: "#F8FAFC",
                        color: "#64748B",
                      }}
                    >
                      Terminlink, Aufgaben und Team-Aktionen sind im angemeldeten Bereich mit Ihrer
                      Praxisumgebung verknüpft. In dieser Vorschau sind sie bewusst nicht verfügbar
                      und werden nicht ausgeführt.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
