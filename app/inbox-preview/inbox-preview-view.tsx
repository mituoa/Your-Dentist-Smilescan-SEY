"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { InboxSearchFigma } from "@/components/inbox/inbox-search-figma";
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

const MOCK_CASES: MockCase[] = [
  {
    id: "mock-1",
    patient_name: "Thomas Schmidt",
    patient_notes:
      "Sehr geehrte Damen und Herren,\n\nbeim Essen ist mir hinten rechts ein großer Backenzahn abgebrochen. Seitdem habe ich starke Schmerzen, besonders bei Kälte und beim Kauen. Die Stelle ist sehr empfindlich und leicht blutet es manchmal beim Putzen. Ich kann auf dieser Seite kaum noch kauen.\n\nMit freundlichen Grüßen",
    patient_birth_date: "1975-05-15",
    patient_external_id: "12345",
    patient_email: "thomas.schmidt@example.com",
    patient_phone: null,
    urgency: "today",
    is_draft: false,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    seen_at: null,
    photoUrl:
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "mock-2",
    patient_name: "Anna Müller",
    patient_notes: "Schmerzen im oberen rechten Bereich seit einigen Tagen.",
    patient_birth_date: "1988-03-22",
    patient_external_id: null,
    patient_email: "anna@example.com",
    patient_phone: null,
    urgency: "this_week",
    is_draft: false,
    created_at: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
    seen_at: new Date().toISOString(),
    photoUrl: null,
  },
  {
    id: "mock-3",
    patient_name: "Lisa Weber",
    patient_notes: "Zahnfleischbluten nach dem Zähneputzen, eher leicht.",
    patient_birth_date: null,
    patient_external_id: null,
    patient_email: "lisa@example.com",
    patient_phone: null,
    urgency: "not_urgent",
    is_draft: false,
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    seen_at: new Date().toISOString(),
    photoUrl: null,
  },
];

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMin < 1) return "Vor wenigen Sekunden";
  if (diffMin < 60) return `Vor ${diffMin} Minuten`;
  if (diffHours < 24) return `Vor ${diffHours} Stunden`;
  if (diffDays === 1) return "Gestern";
  if (diffDays < 7) return `Vor ${diffDays} Tagen`;
  return then.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

function deriveIssue(notes: string | null, name: string | null): string {
  const raw = (notes || "").trim();
  if (raw) {
    const first = raw.split("\n")[0]?.split(".")[0]?.trim();
    if (first) return first.length > 64 ? `${first.slice(0, 64).trim()}…` : first;
  }
  const n = (name || "").trim();
  if (n) return n.length > 64 ? `${n.slice(0, 64).trim()}…` : n;
  return "Einsendung";
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

function urgencyHeadline(urgency: string | null): { text: string; color: string } | null {
  switch (urgency) {
    case "today":
      return {
        text: "Hohe Wahrscheinlichkeit für akuten Behandlungsbedarf",
        color: "#2F80ED",
      };
    case "this_week":
      return { text: "Behandlung innerhalb dieser Woche sinnvoll", color: "#64748B" };
    case "not_urgent":
      return { text: "Nicht dringend — routinemäßig planbar", color: "#64748B" };
    default:
      return null;
  }
}

function recommendedAction(urgency: string | null): string {
  switch (urgency) {
    case "today":
      return "Empfohlene Aktion: Termin in den nächsten 24 Stunden sinnvoll.";
    case "this_week":
      return "Empfohlene Aktion: Termin innerhalb der nächsten Tage sinnvoll.";
    case "not_urgent":
      return "Empfohlene Aktion: Termin nach Kapazität planen.";
    default:
      return "Empfohlene Aktion: Nach klinischer Einschätzung weiterverfolgen.";
  }
}

export function InboxPreviewView() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const q = (searchParams.get("q") || "").trim().toLowerCase();

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

  const openCount = MOCK_CASES.filter((c) => !c.is_draft).length;
  const issueTitle = selected
    ? deriveIssue(selected.patient_notes, selected.patient_name)
    : "";
  const patientLabel = selected?.patient_name || "Unbekannter Patient";
  const metaLabel = selected
    ? `${patientLabel} · ${formatRelativeTime(selected.created_at)}`
    : "";
  const birthStr = selected ? formatBirthDe(selected.patient_birth_date) : null;
  const idStr = selected?.patient_external_id?.trim() || null;
  const secondMeta = [birthStr, idStr ? `ID: ${idStr}` : null].filter(Boolean).join(" · ");
  const urgencyLine = selected ? urgencyHeadline(selected.urgency) : null;
  const recAction = selected ? recommendedAction(selected.urgency) : "";

  const photos =
    selected?.photoUrl != null
      ? [
          {
            id: "demo-1",
            storage_path: "demo/preview.jpg",
            sort_order: 0,
            signed_url: selected.photoUrl,
          },
        ]
      : [];

  return (
    <div className="flex h-[100dvh] flex-col" style={{ background: "#FAFBFC" }}>
      <div
        className="shrink-0 border-b px-4 py-3 text-center text-[13px]"
        style={{ borderColor: "#E2E8F0", background: "#F8FAFC", color: "#64748B" }}
      >
        <strong style={{ color: "#0F172A" }}>Demo-Ansicht</strong> – keine Datenbank, keine
        Anmeldung. So sieht die Einsendungen-Oberfläche mit Beispielpatienten aus.{" "}
        <a href="/login" className="font-medium text-[#2F80ED] underline">
          Zur echten Anmeldung
        </a>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(47,128,237,0.05), transparent 32%)",
          }}
        />

        <div className="relative z-10 flex h-full min-h-0">
          <aside
            className="flex min-h-0 flex-col"
            style={{
              width: "38%",
              maxWidth: "480px",
              minWidth: "380px",
              background: "#FAFBFC",
            }}
          >
            <div style={{ padding: "24px 20px" }}>
              <div style={{ marginBottom: "20px" }}>
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
                <p className="text-[13px]" style={{ color: "#2F80ED", fontWeight: 500 }}>
                  {openCount} offene {openCount === 1 ? "Fall" : "Fälle"} (Demo)
                </p>
              </div>
              <InboxSearchFigma routeBase="/inbox-preview" />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto" style={{ padding: "8px 12px" }}>
              {filteredCases.length === 0 ? (
                <p className="px-3 py-6 text-center text-[13px]" style={{ color: "#94A3B8" }}>
                  Keine Treffer in der Demo. Suchbegriff anpassen.
                </p>
              ) : (
                filteredCases.map((s) => (
                  <SubmissionListItemFigma
                    key={s.id}
                    id={s.id}
                    patientName={s.patient_name}
                    patientNotes={s.patient_notes}
                    createdAt={s.created_at}
                    seenAt={s.seen_at}
                    isDraft={s.is_draft}
                    hrefOverride={`/inbox-preview?id=${encodeURIComponent(s.id)}`}
                    activeOverride={selected != null && selected.id === s.id}
                  />
                ))
              )}
            </div>
          </aside>

          <section className="min-h-0 flex-1 overflow-hidden" style={{ background: "#FFFFFF" }}>
            {!selected ? (
              <div className="flex h-full items-center justify-center px-8 text-center text-[14px]" style={{ color: "#64748B" }}>
                Keine Fälle in der Liste – Suche zurücksetzen.
              </div>
            ) : null}
            {selected ? (
            <div className="flex h-full flex-col overflow-hidden">
              <div
                style={{
                  padding: "32px 40px 24px",
                  borderBottom: "1px solid #EEF2F6",
                  background: "#FFFFFF",
                }}
              >
                <h2
                  className="text-[26px]"
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
              </div>

              <div
                className="min-h-0 flex-1 overflow-y-auto"
                style={{ padding: "32px 40px 40px", background: "#FFFFFF" }}
              >
                <div style={{ marginBottom: "32px" }}>
                  <div
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid #EEF2F6",
                      maxHeight: "300px",
                      background: "#FFFFFF",
                    }}
                  >
                    <PhotoViewer photos={photos} patientName={patientLabel} />
                  </div>
                </div>

                <div style={{ marginBottom: "32px", maxWidth: "600px" }}>
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
                      : "Keine Beschreibung vorhanden."}
                  </p>
                </div>

                <div style={{ maxWidth: "600px" }}>
                  <div style={{ borderTop: "1px solid #EEF2F6", paddingTop: "32px" }}>
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
                      Zeitraum (Einschätzung)
                    </p>
                    <div className="mb-8 flex flex-wrap gap-2">
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
                            className="rounded-[10px] border px-4 py-2 text-[14px] font-medium"
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
                      Terminlink, Aufgaben und Team-Aktionen sind an die echte Datenbank
                      angebunden. In dieser Demo werden sie nicht ausgeführt – nach Anmeldung mit
                      Supabase erscheinen sie hier wie in der Live-Praxis.
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
