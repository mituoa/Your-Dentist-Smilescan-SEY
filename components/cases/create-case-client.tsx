"use client";

/**
 * Praxis-Fall anlegen — **Punkt 1 (Zweck)** s. `app/(protected)/create-case/page.tsx`: ruhige medizinische
 * Dokumentation, keine CRM-/Lead-/Ops-Sprache; Entwurf und vollständiges Speichern als sachliche Schritte.
 *
 * **Punkt 2 (Status — final):** `useTransition` + `pendingKind`; **`fieldset disabled`** + `aria-busy` während
 * Speichern/Upload; Drag/Dateiauswahl bei **busy** gesperrt; bei fehlgeschlagener Kette **`deleteTempSubmissionPhotos`**
 * (Teil-Upload / Action-Fehler vor erfolgreichem Abschluss); Fehler zentral; s. `create-case/page.tsx`.
 *
 * **Punkt 3 (Supabase/Auth — final):** `POST /api/upload` nur mit **Session-Arzt** + abgestimmtem `workspace_id`;
 * Patienten-Flows nutzen **`doc_slug`** (s. `app/api/upload/route.ts`). Keine Secrets im Client.
 *
 * **Punkt 4 (Aktionen — final):** Entwurf (`isDraft`: Name oder Kurznotiz) vs. Fall speichern (Name Pflicht); klare
 * Pending-Texte ohne Veröffentlichen-Semantik; keine Erfolgs-Inszenierung vor Redirect; Anhänge als noch nicht
 * gesichert; Buttons bei unerfüllbarer Validierung deaktiviert; `submit` bei busy idempotent.
 *
 * **Punkt 5 (Tot/Fake — final):** Keine Schein-Erfolge (Anhänge nur lokal bis Speichern); keine irreführenden
 * „Erstellen“-/CRM-Titel; ruhige Interaktion (kein übertriebenes Drag-/Button-Theater); Copy und `pendingKind`
 * (`final` statt verdecktem „Publish“) sachlich an die echte Serverwirkung gekoppelt.
 *
 * **Punkt 6 (Loading — final):** Initiales Laden = Segment-`loading.tsx` (Server); **busy** = Speichern/Upload im
 * Client (`fieldset`, Fußzeile) — getrennte Semantik, kein Skeleton-„Realtime“-Ersatz für Mutationen.
 *
 * **Punkt 7 (Empty — final):** Leerstart ohne Doppel-Erklärungen; Upload nur **eine** ruhige Leer-Semantik; keine
 * Motivations-/CRM-Andeutungen; Platzhalter und Hilfstexte knapp und sachlich.
 *
 * **Punkt 8 (Error — final):** Validierung (Geburtsdatum) und **Server-/Speicher-Fehler** oben; **Upload- und
 * Dateiauswahl-Fehler** in der Bild-Sektion (kein „gesamtes Formular brennt“). Keine Roh-HTTP-/JSON-Strings aus
 * `fetch`; ruhige Status-Meldungen; nach Fehler **sanft** zur jeweiligen Stelle scrollen; `taskMutationClientFailureMessage`
 * bei Action-Wurf (Netzwerk). **Teil-Erfolg Anlagen:** `partialAttachments` → Redirect mit `anlagen_teilweise=1`,
 * Hinweis im **`CaseCreatedToast`** (Inbox) — ein Panel, sachlich, ohne grünes Erfolgs-Inszenieren.
 *
 * **Punkt 9 (Mobile — final):** Sheet-Höhe an **SVH + Safe Area**; **ein** Scroll-Container mit
 * **`scroll-padding-bottom`** und großzügigem unteren Polster — CTAs bleiben erreichbar; **44px**-nahe Touchziele
 * (Schließen, Entfernen); **`min-w-0`** / `overflow-x-hidden`; HTML-Scroll-Lock nur `<md`; Fußzeile
 * **`touch-manipulation`**. Kein zweites Scroll-Gitter — s. `create-case/page.tsx` / `loading.tsx`.
 *
 * **Punkt 10 (Security — final):** `workspace_id` im Upload nur zur **Abweichungsprüfung** gegen die Session (s.
 * `app/api/upload/route.ts`); **keine** Secrets; echte Autorisierung in **Server Action** + API. Client trif keine
 * Sicherheitsentscheidungen über Rolle/Workspace.
 *
 * **Punkt 11 (MVP — final):** **Ein** Formular, **kein** Wizard; **Entwurf** vs. **Fall speichern** ohne
 * Veröffentlichen-/Ticket-Semantik; **kein** Autosave, **kein** Realtime-Status, **keine** KI-/Automation-/CRM-/Lead-
 * Mechanik — bewusst fokussierte **ärztliche Falldokumentation** für die interne Inbox (s. `create-case/page.tsx`).
 *
 * **Punkt 12 (Nice / Future / Non-MVP — final):** Vollständiger Katalog und Schutz vor Plattform-/CRM-Drift —
 * **`create-case/page.tsx` Punkt 12**; in dieser Komponente **keine** eigenständige Feature-Erweiterung ohne
 * dortige Produktentscheidung.
 *
 * **Punkt 13 (Priorität — final):** Stabilität und P0/P1 — **`create-case/page.tsx` Punkt 13**; Änderungen nur bei
 * sicherheits-/kernfluss-kritischen Bugs oder kleinem Nice-Polish, keine Intake-/Plattform-Erweiterung.
 */

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Upload, X } from "lucide-react";
import {
  createPracticeCase,
  deleteTempSubmissionPhotos,
  type PracticeCaseUrgency,
} from "@/app/(protected)/create-case/actions";
import { taskMutationClientFailureMessage } from "@/lib/tasks/task-mutation-client-error";
import {
  SmartDateInput,
  type SmartDateInputHandle,
} from "@/components/smart-date-input";
import {
  MAX_PHOTO_SIZE_BYTES,
  MAX_PHOTOS,
  validatePhoto,
} from "@/lib/upload/validation";

type UrgencyUi = "not_urgent" | "this_week" | "today";

type LocalAttachment = { id: string; file: File; previewUrl: string };

const URGENCY_OPTIONS: { id: UrgencyUi; label: string }[] = [
  { id: "not_urgent", label: "Nicht dringend" },
  { id: "this_week", label: "Diese Woche" },
  { id: "today", label: "Heute" },
];

function toServerUrgency(ui: UrgencyUi | null): PracticeCaseUrgency {
  if (!ui) return null;
  return ui;
}

/** Ruhige, nutzerorientierte Meldung bei fehlgeschlagenem `POST /api/upload` — keine Roh-API-Texte. */
function userFacingUploadHttpError(status: number, serverMessage: string | undefined): string {
  const m = (serverMessage || "").trim();
  const looksLikePlainCopy =
    m.length > 0 &&
    m.length < 280 &&
    !/[{}[\]"]/.test(m) &&
    !/^\s*error\s*:/i.test(m) &&
    !/\b(trace|stack|digest)\b/i.test(m);

  if (status === 400 && looksLikePlainCopy) {
    return m;
  }
  if (status === 401) {
    return "Sie sind nicht angemeldet oder Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an und versuchen Sie es noch einmal.";
  }
  if (status === 403) {
    return "Dieser Vorgang ist in Ihrer aktuellen Sitzung nicht möglich. Bitte laden Sie die Seite neu oder melden Sie sich erneut an.";
  }
  if (status === 404) {
    return "Der Arbeitsbereich wurde nicht gefunden.";
  }
  if (status >= 500) {
    return "Die Bildübertragung ist momentan nicht möglich. Bitte versuchen Sie es in Kürze erneut.";
  }
  if (looksLikePlainCopy) {
    return m;
  }
  return "Die Bildübertragung ist fehlgeschlagen. Bitte versuchen Sie es erneut.";
}

interface CreateCaseClientProps {
  workspaceId: string;
  /** Ziel nach Abbrechen / Tap außerhalb (kommt von Server aus `?from=`). */
  cancelHref: string;
}

export function CreateCaseClient({ workspaceId, cancelHref }: CreateCaseClientProps) {
  const router = useRouter();
  const birthRef = useRef<SmartDateInputHandle>(null);
  const actionErrorBannerRef = useRef<HTMLDivElement>(null);
  const uploadSectionRef = useRef<HTMLElement>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingKind, setPendingKind] = useState<"draft" | "final" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [uploadZoneError, setUploadZoneError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [patientName, setPatientName] = useState("");
  const [birthIso, setBirthIso] = useState<string | null>(null);
  const [externalId, setExternalId] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [urgency, setUrgency] = useState<UrgencyUi | null>(null);
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);

  const busy = isPending || pendingKind !== null;

  const nameTrim = patientName.trim();
  const notesTrim = notes.trim();
  const canSaveDraft = nameTrim.length > 0 || notesTrim.length > 0;
  const canSaveFinal = nameTrim.length > 0;

  const close = () => {
    if (isPending || pendingKind !== null) return;
    router.push(cancelHref);
  };

  const fileKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;

  const attachmentsRef = useRef(attachments);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);
  useEffect(() => {
    return () => {
      for (const a of attachmentsRef.current) {
        URL.revokeObjectURL(a.previewUrl);
      }
    };
  }, []);

  /** Scroll-Lock nur Mobile (< md): Sheet über dem Shell-Canvas; Desktop scrollt normal im `main`. */
  useEffect(() => {
    const html = document.documentElement;
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      if (mq.matches) {
        html.style.overflow = "hidden";
      } else {
        html.style.overflow = "";
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      html.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!error) return;
    actionErrorBannerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [error]);

  useEffect(() => {
    if (!uploadZoneError) return;
    uploadSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [uploadZoneError]);

  const addPickedFiles = (list: FileList | null) => {
    if (busy) return;
    if (!list?.length) return;
    setUploadZoneError(null);
    const incoming = Array.from(list);
    const accepted: File[] = [];
    let firstReject: string | null = null;
    for (const f of incoming) {
      const v = validatePhoto(f);
      if (v.valid) accepted.push(f);
      else if (!firstReject && v.error) firstReject = v.error;
    }
    if (accepted.length === 0) {
      setUploadZoneError(
        firstReject || "Keine unterstützten Bilder (JPG, PNG, HEIC, WEBP)."
      );
      return;
    }

    setAttachments((prev) => {
      const keys = new Set(prev.map((p) => p.id));
      const merged = [...prev];
      for (const f of accepted) {
        const k = fileKey(f);
        if (keys.has(k)) continue;
        keys.add(k);
        merged.push({
          id: k,
          file: f,
          previewUrl: URL.createObjectURL(f),
        });
      }
      const over = merged.length > MAX_PHOTOS;
      const next = over ? merged.slice(0, MAX_PHOTOS) : merged;
      if (over) {
        for (const dropped of merged.slice(MAX_PHOTOS)) {
          URL.revokeObjectURL(dropped.previewUrl);
        }
      }
      queueMicrotask(() => {
        if (over) {
          setUploadZoneError(`Maximal ${MAX_PHOTOS} Fotos pro Fall.`);
        } else if (firstReject && accepted.length < incoming.length) {
          setUploadZoneError(
            `${incoming.length - accepted.length} Datei(en) übersprungen: ${firstReject}`
          );
        }
      });
      return next;
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const row = prev[index];
      if (row) URL.revokeObjectURL(row.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadFiles = async (): Promise<string[] | { error: string }> => {
    const paths: string[] = [];
    try {
      for (let i = 0; i < attachments.length; i++) {
        const file = attachments[i].file;
        if (file.size > MAX_PHOTO_SIZE_BYTES) {
          if (paths.length > 0) {
            void deleteTempSubmissionPhotos(paths);
          }
          return {
            error: `Datei „${file.name}“ ist zu groß (max. ${Math.round(MAX_PHOTO_SIZE_BYTES / 1024 / 1024)} MB).`,
          };
        }
        const fd = new FormData();
        fd.append("file", file);
        fd.append("workspace_id", workspaceId);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          if (paths.length > 0) {
            void deleteTempSubmissionPhotos(paths);
          }
          return {
            error: userFacingUploadHttpError(res.status, errData.error),
          };
        }
        const data = (await res.json()) as { storagePath?: string };
        if (!data.storagePath) {
          if (paths.length > 0) {
            void deleteTempSubmissionPhotos(paths);
          }
          return {
            error:
              "Die Bildübertragung ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
          };
        }
        paths.push(data.storagePath);
      }
      return paths;
    } catch {
      if (paths.length > 0) {
        void deleteTempSubmissionPhotos(paths);
      }
      return {
        error:
          "Die Bildübertragung ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
      };
    }
  };

  const submit = (isDraft: boolean) => {
    if (busy) return;
    setError(null);
    setUploadZoneError(null);
    setPendingKind(isDraft ? "draft" : "final");
    startTransition(async () => {
      let uploadedPaths: string[] = [];
      try {
        try {
          const flu = birthRef.current?.flush();
          if (flu?.ok === false) {
            setError(
              "Bitte prüfen Sie das Geburtsdatum (Format TT.MM.JJJJ) oder das Feld leeren."
            );
            return;
          }
          const patientBirthDate = flu?.ok ? flu.iso : birthIso;

          const pathsResult = await uploadFiles();
          if ("error" in pathsResult) {
            setError(null);
            setUploadZoneError(pathsResult.error);
            return;
          }
          uploadedPaths = pathsResult;

          const result = await createPracticeCase({
            patientName,
            patientBirthDate,
            patientExternalId: externalId || null,
            patientEmail: patientEmail || null,
            patientPhone: patientPhone || null,
            patientNotes: notes || null,
            urgency: toServerUrgency(urgency),
            isDraft,
            tempStoragePaths: pathsResult,
          });

          if (result.error) {
            if (uploadedPaths.length > 0) {
              void deleteTempSubmissionPhotos(uploadedPaths);
            }
            setUploadZoneError(null);
            setError(result.error);
            return;
          }
          if (result.submissionId) {
            const q = new URLSearchParams({ angelegt: "1" });
            if (result.partialAttachments) {
              q.set("anlagen_teilweise", "1");
            }
            router.push(`/inbox/${result.submissionId}?${q.toString()}`);
            router.refresh();
          }
        } catch (e) {
          if (uploadedPaths.length > 0) {
            void deleteTempSubmissionPhotos(uploadedPaths);
          }
          setUploadZoneError(null);
          setError(taskMutationClientFailureMessage(e));
        }
      } finally {
        setPendingKind(null);
      }
    });
  };

  const actionFooter = (
    <footer className="shrink-0 border-t border-slate-200/60 bg-white px-4 pt-4 pb-[max(1rem,var(--safe-area-bottom))] max-md:mt-2 max-md:border-t-0 max-md:bg-gradient-to-t max-md:from-[#FAFBFC] max-md:to-white max-md:pt-6 max-md:pb-[max(1.25rem,var(--safe-area-bottom))] md:border-[#E8EDF4] md:bg-white md:px-8 md:pt-6 md:pb-0 md:shadow-none">
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-3">
        <button
          type="button"
          disabled={busy || !canSaveDraft}
          title={
            !busy && !canSaveDraft
              ? "Mindestens Patientenname oder Kurznotiz ausfüllen."
              : undefined
          }
          className="h-11 min-h-[44px] w-full touch-manipulation rounded-[10px] px-5 text-[14px] font-medium text-[#94A3B8] transition hover:bg-white/80 hover:text-[#64748B] disabled:pointer-events-none disabled:opacity-45 md:w-auto md:hover:bg-[#F8FAFC]"
          onClick={() => submit(true)}
        >
          {pendingKind === "draft"
            ? "Entwurf wird gespeichert…"
            : "Als Entwurf sichern"}
        </button>
        <button
          type="button"
          disabled={busy}
          className="h-11 min-h-[44px] w-full touch-manipulation rounded-[10px] px-6 text-[15px] font-medium text-[#64748B] transition hover:bg-white/80 hover:text-[#0F172A] disabled:pointer-events-none disabled:opacity-45 md:w-auto md:hover:bg-[#F8FAFC]"
          onClick={close}
        >
          Abbrechen
        </button>
        <button
          type="button"
          disabled={busy || !canSaveFinal}
          title={
            !busy && !canSaveFinal
              ? "Bitte geben Sie den Namen des Patienten ein."
              : undefined
          }
          className="h-11 min-h-[44px] w-full touch-manipulation rounded-[11px] px-8 text-[15px] font-semibold text-white shadow-[0_2px_8px_rgba(47,128,237,0.22)] transition-[box-shadow,opacity] duration-150 hover:shadow-[0_3px_12px_rgba(47,128,237,0.28)] disabled:pointer-events-none disabled:opacity-55 md:min-w-[200px] md:w-auto"
          style={{ background: "#2F80ED" }}
          onClick={() => submit(false)}
        >
          {pendingKind === "final"
            ? "Speicherung läuft…"
            : "Fall speichern"}
        </button>
      </div>
    </footer>
  );

  return (
    <>
      {/* Nur Mobile: Dim + Tap außerhalb schließt — Desktop nutzt Shell-Hintergrund (#F7F9FC), kein Modal-Canvas */}
      <div
        className="create-case-backdrop pointer-events-none fixed inset-0 z-[998] bg-slate-900/45 backdrop-blur-md motion-reduce:backdrop-blur-sm max-md:block md:hidden"
        aria-hidden
      />
      <button
        type="button"
        aria-label="Schließen"
        disabled={busy}
        className={`fixed inset-0 z-[999] border-0 bg-transparent p-0 max-md:block md:hidden ${busy ? "pointer-events-none cursor-default" : "cursor-default"}`}
        onClick={() => {
          if (!busy) close();
        }}
      />

      <div className="pointer-events-none max-md:fixed max-md:inset-0 max-md:z-[1000] max-md:flex max-md:min-h-0 max-md:flex-col max-md:overflow-x-hidden max-md:overflow-y-hidden max-md:overscroll-y-contain max-md:justify-end max-md:px-[max(0.75rem,var(--safe-area-left))] max-md:pr-[max(0.75rem,var(--safe-area-right))] max-md:pb-[max(0.5rem,var(--safe-area-bottom))] max-md:pt-[max(0.5rem,var(--safe-area-top))] md:pointer-events-auto md:relative md:z-0 md:mx-auto md:flex md:min-h-0 md:w-full md:max-w-[760px] md:flex-1 md:flex-col md:overflow-visible md:px-5 md:py-10 lg:px-8 lg:py-12">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-case-title"
          aria-busy={busy}
          className="create-case-modal pointer-events-auto flex min-h-0 w-full flex-col overflow-hidden bg-white max-md:max-h-[min(calc(100svh_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom)_-_1.25rem),50rem)] max-md:flex-none max-md:rounded-[24px] max-md:border max-md:border-slate-200/55 max-md:shadow-[0_20px_56px_-16px_rgba(15,23,42,0.18),0_0_0_1px_rgba(15,23,42,0.035)] md:max-h-none md:overflow-visible md:rounded-[26px] md:border md:border-slate-200/45 md:bg-gradient-to-b md:from-white md:to-[#FAFBFC]/50 md:shadow-[0_8px_36px_-14px_rgba(15,23,42,0.07),0_0_0_1px_rgba(15,23,42,0.028)]"
          onClick={(e) => e.stopPropagation()}
        >
          <h1 id="create-case-title" className="sr-only">
            Fall dokumentieren — neuer Fall zur internen Weiterbearbeitung in der Inbox
          </h1>

          {/* Mobile: Sheet-Chrome — weicher Übergang ins Formular (analog Register-Kopf mit leichtem Verlauf) */}
          <div className="shrink-0 border-b border-slate-200/60 bg-gradient-to-b from-white to-[#FAFBFC] pt-[max(0.35rem,var(--safe-area-top))] md:hidden">
            <div className="flex justify-center pb-1.5 pt-0.5" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-slate-300/90" />
            </div>
            <div className="flex items-center gap-2 px-4 pb-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold tracking-normal text-slate-500">
                  Neuer Fall
                </p>
                <p
                  className="truncate text-[17px] font-semibold leading-snug tracking-tight text-[#0F172A]"
                  aria-hidden
                >
                  Fall dokumentieren
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={busy}
                aria-label="Schließen"
                className="flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-full text-slate-500 transition active:bg-slate-100 disabled:opacity-40"
              >
                <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white max-md:min-h-0 max-md:bg-[#FAFBFC] md:min-h-0">
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-4 pt-4 [-webkit-overflow-scrolling:touch] max-md:min-h-0 max-md:flex-1 max-md:scroll-pb-48 max-md:px-4 max-md:pb-8 max-md:pt-4 md:flex-none md:overflow-visible md:px-8 md:pb-10 md:pt-8 md:scroll-pb-0">
              <fieldset
                disabled={busy}
                aria-busy={busy}
                className="m-0 min-h-0 min-w-0 border-0 p-0 disabled:pointer-events-none disabled:[&_input]:cursor-not-allowed disabled:[&_textarea]:cursor-not-allowed disabled:[&_button]:cursor-not-allowed disabled:[&_button]:opacity-60"
              >
              {/* Desktop: ruhiger Einstieg */}
              <header className="mb-6 hidden md:mb-8 md:block">
                <p
                  className="mb-2 text-[12px] font-semibold tracking-normal text-slate-500"
                >
                  Neuer Fall
                </p>
                <h2
                  className="mb-2 break-words text-[clamp(1.375rem,4vw+0.35rem,1.75rem)] font-semibold tracking-tight"
                  style={{ color: "#0F172A", lineHeight: 1.2 }}
                >
                  Fall dokumentieren
                </h2>
                <p className="text-[14px] leading-relaxed" style={{ color: "#64748B" }}>
                  Stammdaten und Kurznotiz für die interne Weiterbearbeitung in der Inbox. Entwurf: Name oder Kurznotiz.
                  Speichern: Patientenname erforderlich — übrige Felder optional.
                </p>
              </header>

              <p className="mb-4 text-[12px] leading-relaxed text-slate-500 md:hidden">
                Entwurf: Name oder Kurznotiz. Speichern: Patientenname. Übriges optional.
              </p>

              <div
                ref={actionErrorBannerRef}
                className="mb-4 min-h-[44px] md:mb-6 md:min-h-[52px]"
                aria-live="polite"
              >
                {error ? (
                  <p
                    className="rounded-xl border border-red-100/90 bg-red-50/90 px-3 py-2.5 text-[13px] leading-snug text-red-900/90 md:px-4 md:py-3 md:text-[14px]"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}
              </div>

              <div className="space-y-0">
                <section className="pb-6 md:pb-8">
                  <h3 className="mb-2 text-[12px] font-semibold tracking-normal text-[#64748B] md:mb-3 md:text-[13px]">
                    Patient
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                <Field label="Name des Patienten">
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="z.B. Anna Müller"
                    className="h-12 max-md:h-11 w-full rounded-[10px] border border-[#E2E8F0] px-4 text-[15px] max-md:text-[16px] text-[#0F172A] placeholder:text-gray-400 outline-none transition focus:border-[#2F80ED] focus:ring-[3px] focus:ring-[rgba(47,128,237,0.08)]"
                  />
                </Field>
                <Field label="Geburtsdatum (optional)">
                  <SmartDateInput
                    ref={birthRef}
                    value={birthIso}
                    onChange={setBirthIso}
                    aria-label="Geburtsdatum"
                  />
                </Field>
                <Field label="Patienten-ID (optional)">
                  <input
                    type="text"
                    value={externalId}
                    onChange={(e) => setExternalId(e.target.value)}
                    placeholder="z.B. 12345"
                    className="h-12 max-md:h-11 w-full rounded-[10px] border border-[#E2E8F0] px-4 text-[15px] max-md:text-[16px] text-[#0F172A] placeholder:text-gray-400 outline-none transition focus:border-[#2F80ED] focus:ring-[3px] focus:ring-[rgba(47,128,237,0.12)]"
                  />
                </Field>
                <Field label="E-Mail (optional)">
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="falls Rückfragen per E-Mail gewünscht"
                    className="h-12 max-md:h-11 w-full rounded-[10px] border border-[#E2E8F0] px-4 text-[15px] max-md:text-[16px] text-[#0F172A] placeholder:text-gray-400 outline-none transition focus:border-[#2F80ED] focus:ring-[3px] focus:ring-[rgba(47,128,237,0.12)]"
                  />
                </Field>
                <Field label="Telefon (optional)">
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="+49 …"
                    className="h-12 max-md:h-11 w-full rounded-[10px] border border-[#E2E8F0] px-4 text-[15px] max-md:text-[16px] text-[#0F172A] placeholder:text-gray-400 outline-none transition focus:border-[#2F80ED] focus:ring-[3px] focus:ring-[rgba(47,128,237,0.12)]"
                  />
                </Field>
              </div>
            </section>

            <section className="border-t border-[#F1F5F9] pt-6 md:pt-8">
              <h3 className="mb-2 text-[12px] font-semibold tracking-normal text-[#64748B] md:mb-3 md:text-[13px]">
                Kurznotiz
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Anlass, Verlauf, kurze fachliche Notiz (optional)"
                className="min-h-[5.75rem] w-full min-w-0 resize-y rounded-[10px] border border-[#E2E8F0] px-4 py-2.5 text-[15px] max-md:min-h-[6rem] max-md:text-[16px] text-[#0F172A] placeholder:text-gray-400 outline-none transition focus:border-[#2F80ED] focus:ring-[3px] focus:ring-[rgba(47,128,237,0.12)] md:min-h-[7.5rem] md:py-3"
              />
            </section>

            <section className="border-t border-[#F1F5F9] pt-6 md:pt-8">
              <h3 className="mb-2 text-[12px] font-semibold tracking-normal text-[#64748B] md:mb-3 md:text-[13px]">
                Dringlichkeit (optional)
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {URGENCY_OPTIONS.map((opt) => {
                  const active = urgency === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setUrgency(active ? null : opt.id)}
                      className={`min-h-[44px] touch-manipulation rounded-[11px] border px-4 py-2.5 text-[14px] font-medium transition-[border-color,background-color,color] duration-150 ease-out active:opacity-90 ${
                        active
                          ? "border-[#2F80ED] bg-[rgba(47,128,237,0.08)] text-[#1557C7] ring-1 ring-[#2F80ED]/25"
                          : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section
              ref={uploadSectionRef}
              className="border-t border-[#F1F5F9] pb-1 pt-6 md:pt-8"
            >
              <h3 className="mb-2 text-[12px] font-semibold tracking-normal text-[#64748B] md:mb-3 md:text-[13px]">
                Bilder
              </h3>
              <div
                className={`relative flex min-h-[132px] flex-col items-center justify-center overflow-hidden rounded-[12px] border border-dashed px-4 py-7 transition-[border-color,background-color,box-shadow] duration-200 ease-out md:min-h-[168px] md:px-6 md:py-10 ${
                  dragActive
                    ? "border-[#94A3B8] bg-slate-50 ring-1 ring-[#2F80ED]/20"
                    : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]"
                }`}
                onDragEnter={(e) => {
                  if (busy) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(true);
                }}
                onDragOver={(e) => {
                  if (busy) {
                    e.preventDefault();
                    return;
                  }
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = "copy";
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const next = e.relatedTarget as Node | null;
                  if (!next || !e.currentTarget.contains(next)) {
                    setDragActive(false);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(false);
                  if (busy) return;
                  addPickedFiles(e.dataTransfer.files);
                }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                  className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                  aria-label="Bilder auswählen oder in die Ablage ziehen"
                  onDragEnter={() => {
                    if (busy) return;
                    setDragActive(true);
                  }}
                  onDragLeave={(ev) => {
                    const next = ev.relatedTarget as Node | null;
                    if (!next || !ev.currentTarget.parentElement?.contains(next)) {
                      setDragActive(false);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onChange={(e) => {
                    addPickedFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <div className="pointer-events-none relative z-10 flex flex-col items-center gap-2">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-slate-200/80 bg-white"
                    style={{ color: "#64748B" }}
                  >
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="text-[14px] font-medium" style={{ color: "#0F172A" }}>
                    {attachments.length > 0
                      ? "Weitere Bilder auswählen"
                      : "Bilder auswählen"}
                  </p>
                  <p className="max-w-[min(280px,100%)] px-1 text-center text-[12px] leading-snug" style={{ color: "#94A3B8" }}>
                    {attachments.length > 0
                      ? "Weitere Dateien wählen oder ablegen — Übernahme nach Speichern"
                      : "JPG, PNG, HEIC, WEBP — Übernahme nach Speichern"}
                  </p>
                </div>
              </div>
              {uploadZoneError ? (
                <p
                  className="mt-3 rounded-xl border border-red-100/90 bg-red-50/90 px-3 py-2.5 text-[13px] leading-snug text-red-900/90 md:px-4 md:py-3 md:text-[14px]"
                  role="alert"
                >
                  {uploadZoneError}
                </p>
              ) : null}

              {attachments.length > 0 ? (
                <ul className="mt-4 space-y-2.5" aria-label="Noch nicht gesicherte Bilder">
                  {attachments.map((row, index) => (
                    <li
                      key={row.id}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-[#EEF2F6] bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={row.previewUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-[#0F172A]">
                          {row.file.name || "Bild"}
                        </p>
                        <p className="text-[12px] leading-snug text-slate-500">
                          Lokal — Übernahme nach Speichern
                        </p>
                      </div>
                      <button
                        type="button"
                        className="flex h-11 min-h-[44px] min-w-[44px] shrink-0 touch-manipulation items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED]/30"
                        onClick={() => removeAttachment(index)}
                        aria-label="Bild entfernen"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-center text-[12px] leading-relaxed text-slate-400">
                  Keine Anlagen ausgewählt.
                </p>
              )}
            </section>
              </div>
              </fieldset>
          {actionFooter}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-[12px] font-medium text-[#64748B] md:mb-2 md:text-[13px]">
        {label}
      </label>
      {children}
    </div>
  );
}
