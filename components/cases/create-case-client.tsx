"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ImagePlus, X } from "lucide-react";

import {
  createPracticeCase,
  deleteTempSubmissionPhotos,
  type PracticeCaseUrgency,
} from "@/app/(protected)/create-case/actions";
import { MedicalFormShell } from "@/components/forms/medical-form-shell";
import {
  MedicalFormFieldStack,
  MedicalFormFooterActions,
  MedicalFormLabel,
  MedicalFormSection,
  MedicalFormSegmented,
  MedicalFormTextarea,
  MedicalFormUploadEmpty,
} from "@/components/forms/medical-form-ui";
import {
  SmartDateInput,
  type SmartDateInputHandle,
} from "@/components/smart-date-input";
import { taskMutationClientFailureMessage } from "@/lib/tasks/task-mutation-client-error";
import {
  MAX_PHOTO_SIZE_BYTES,
  MAX_PHOTOS,
  validatePhoto,
} from "@/lib/upload/validation";

type UrgencyUi = "not_urgent" | "this_week" | "today";

type LocalAttachment = { id: string; file: File; previewUrl: string };

const URGENCY_OPTIONS = [
  { id: "today" as const, label: "Heute" },
  { id: "this_week" as const, label: "Diese Woche" },
  { id: "not_urgent" as const, label: "Nicht dringend" },
];

const WIZARD_STEPS = [
  { id: 1, title: "Patient", lead: "Stammdaten des Patienten" },
  { id: 2, title: "Anliegen", lead: "Worum geht es bei diesem Fall?" },
  { id: 3, title: "Klinische Bilder", lead: "Fotos für die Einordnung" },
  { id: 4, title: "Priorität", lead: "Gewünschter Zeitraum" },
  { id: 5, title: "Prüfen & Speichern", lead: "Angaben kurz prüfen" },
] as const;

function toServerUrgency(ui: UrgencyUi | null): PracticeCaseUrgency {
  if (!ui) return null;
  return ui;
}

function userFacingUploadHttpError(status: number, serverMessage: string | undefined): string {
  const m = (serverMessage || "").trim();
  const looksLikePlainCopy =
    m.length > 0 &&
    m.length < 280 &&
    !/[{}[\]"]/.test(m) &&
    !/^\s*error\s*:/i.test(m) &&
    !/\b(trace|stack|digest)\b/i.test(m);

  if (status === 400 && looksLikePlainCopy) return m;
  if (status === 401) {
    return "Sie sind nicht angemeldet oder Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an und versuchen Sie es noch einmal.";
  }
  if (status === 403) {
    return "Dieser Vorgang ist in Ihrer aktuellen Sitzung nicht möglich. Bitte laden Sie die Seite neu oder melden Sie sich erneut an.";
  }
  if (status === 404) return "Der Arbeitsbereich wurde nicht gefunden.";
  if (status >= 500) {
    return "Die Bildübertragung ist momentan nicht möglich. Bitte versuchen Sie es in Kürze erneut.";
  }
  if (looksLikePlainCopy) return m;
  return "Die Bildübertragung ist fehlgeschlagen. Bitte versuchen Sie es erneut.";
}

interface CreateCaseClientProps {
  workspaceId: string;
  cancelHref: string;
}

export function CreateCaseClient({ workspaceId, cancelHref }: CreateCaseClientProps) {
  const router = useRouter();
  const birthRef = useRef<SmartDateInputHandle>(null);
  const actionErrorBannerRef = useRef<HTMLDivElement>(null);
  const uploadSectionRef = useRef<HTMLElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadZoneError, setUploadZoneError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthIso, setBirthIso] = useState<string | null>(null);
  const [externalId, setExternalId] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [urgency, setUrgency] = useState<UrgencyUi | null>(null);
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [step, setStep] = useState(1);

  const busy = isPending;
  const activeStep = WIZARD_STEPS[step - 1]!;

  const patientName = `${firstName.trim()} ${lastName.trim()}`.trim();
  const notesTrim = notes.trim();
  const canSaveFinal = patientName.length > 0;
  const canAdvanceStep1 = lastName.trim().length > 0 || firstName.trim().length > 0;

  const urgencyLabel =
    urgency === "today"
      ? "Heute"
      : urgency === "this_week"
        ? "Diese Woche"
        : urgency === "not_urgent"
          ? "Nicht dringend"
          : "Nicht gewählt";

  const close = () => {
    if (busy) return;
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

  useEffect(() => {
    if (!error) return;
    actionErrorBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [error]);

  useEffect(() => {
    if (!uploadZoneError) return;
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
        merged.push({ id: k, file: f, previewUrl: URL.createObjectURL(f) });
      }
      const over = merged.length > MAX_PHOTOS;
      const next = over ? merged.slice(0, MAX_PHOTOS) : merged;
      if (over) {
        for (const dropped of merged.slice(MAX_PHOTOS)) {
          URL.revokeObjectURL(dropped.previewUrl);
        }
      }
      queueMicrotask(() => {
        if (over) setUploadZoneError(`Maximal ${MAX_PHOTOS} Fotos pro Fall.`);
        else if (firstReject && accepted.length < incoming.length) {
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
          if (paths.length > 0) void deleteTempSubmissionPhotos(paths);
          return {
            error: `Datei „${file.name}“ ist zu groß (max. ${Math.round(MAX_PHOTO_SIZE_BYTES / 1024 / 1024)} MB).`,
          };
        }
        const fd = new FormData();
        fd.append("file", file);
        fd.append("workspace_id", workspaceId);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          if (paths.length > 0) void deleteTempSubmissionPhotos(paths);
          return { error: userFacingUploadHttpError(res.status, errData.error) };
        }
        const data = (await res.json()) as { storagePath?: string };
        if (!data.storagePath) {
          if (paths.length > 0) void deleteTempSubmissionPhotos(paths);
          return {
            error: "Die Bildübertragung ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
          };
        }
        paths.push(data.storagePath);
      }
      return paths;
    } catch {
      if (paths.length > 0) void deleteTempSubmissionPhotos(paths);
      return {
        error: "Die Bildübertragung ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
      };
    }
  };

  const submit = () => {
    if (busy) return;
    setError(null);
    setUploadZoneError(null);
    startTransition(async () => {
      let uploadedPaths: string[] = [];
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
          patientNotes: notesTrim || null,
          urgency: toServerUrgency(urgency),
          isDraft: false,
          tempStoragePaths: pathsResult,
        });

        if (result.error) {
          if (uploadedPaths.length > 0) void deleteTempSubmissionPhotos(uploadedPaths);
          setError(result.error);
          return;
        }
        if (result.submissionId) {
          const q = new URLSearchParams({ angelegt: "1" });
          if (result.partialAttachments) q.set("anlagen_teilweise", "1");
          router.push(`/inbox/${result.submissionId}?${q.toString()}`);
          router.refresh();
        }
      } catch (e) {
        if (uploadedPaths.length > 0) void deleteTempSubmissionPhotos(uploadedPaths);
        setError(taskMutationClientFailureMessage(e));
      }
    });
  };

  const wizardFooter =
    step < 5 ? (
      <div className="yd-medical-wizard-footer">
        <button
          type="button"
          className="yd-auth-btn-secondary yd-medical-form-footer__cancel"
          disabled={busy || step <= 1}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
        >
          Zurück
        </button>
        <button
          type="button"
          className="yd-auth-btn-primary yd-medical-form-footer__primary"
          disabled={busy || (step === 1 && !canAdvanceStep1)}
          onClick={() => setStep((s) => Math.min(5, s + 1))}
        >
          Weiter
        </button>
      </div>
    ) : (
      <MedicalFormFooterActions
        onCancel={close}
        cancelDisabled={busy}
        primaryLabel="Patientenfall anlegen"
        primaryPendingLabel="Wird angelegt…"
        onPrimary={submit}
        primaryDisabled={!canSaveFinal}
        isPending={busy}
      />
    );

  return (
    <MedicalFormShell
      title="Neuen Patientenfall anlegen"
      subtitle={`Schritt ${step} von 5 · ${activeStep.title} — ${activeStep.lead}`}
      onClose={close}
      closeDisabled={busy}
      ariaLabel="Neuen Patientenfall anlegen"
      footer={wizardFooter}
    >
      <div className="yd-medical-form">
        <div className="yd-medical-wizard-progress" aria-hidden>
          <div
            className="yd-medical-wizard-progress__bar"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />
        </div>
        <p className="yd-medical-wizard-step-label">
          Schritt {step} von 5 · {activeStep.title}
        </p>

        <div ref={actionErrorBannerRef} aria-live="polite">
          {error ? (
            <p className="yd-medical-form-alert" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <fieldset
          disabled={busy}
          aria-busy={busy}
          className="m-0 min-w-0 border-0 p-0 disabled:pointer-events-none disabled:opacity-[0.58]"
        >
          {step === 1 ? (
          <MedicalFormSection title="Patient">
            <MedicalFormFieldStack>
              <div>
                <MedicalFormLabel htmlFor="cc-first">Vorname</MedicalFormLabel>
                <input
                  id="cc-first"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  className="yd-auth-input"
                  placeholder="Vorname"
                />
              </div>
              <div>
                <MedicalFormLabel htmlFor="cc-last">Nachname</MedicalFormLabel>
                <input
                  id="cc-last"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  className="yd-auth-input"
                  placeholder="Nachname"
                />
              </div>
              <div>
                <MedicalFormLabel htmlFor="cc-birth" optional>
                  Geburtsdatum
                </MedicalFormLabel>
                <div className="yd-medical-date-wrap">
                  <SmartDateInput
                    ref={birthRef}
                    value={birthIso}
                    onChange={setBirthIso}
                    aria-label="Geburtsdatum"
                  />
                </div>
              </div>
              <div>
                <MedicalFormLabel htmlFor="cc-ext" optional>
                  Patienten-ID
                </MedicalFormLabel>
                <input
                  id="cc-ext"
                  type="text"
                  value={externalId}
                  onChange={(e) => setExternalId(e.target.value)}
                  className="yd-auth-input"
                  placeholder="Interne Kennung"
                />
              </div>
            </MedicalFormFieldStack>
            <MedicalFormFieldStack className="mt-4">
              <div>
                <MedicalFormLabel htmlFor="cc-email" optional>
                  E-Mail
                </MedicalFormLabel>
                <input
                  id="cc-email"
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  autoComplete="email"
                  className="yd-auth-input"
                  placeholder="E-Mail-Adresse"
                />
              </div>
              <div>
                <MedicalFormLabel htmlFor="cc-phone" optional>
                  Telefon
                </MedicalFormLabel>
                <input
                  id="cc-phone"
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  autoComplete="tel"
                  className="yd-auth-input"
                  placeholder="+49 …"
                />
              </div>
            </MedicalFormFieldStack>
          </MedicalFormSection>
          ) : null}

          {step === 2 ? (
          <MedicalFormSection title="Anliegen">
            <MedicalFormLabel htmlFor="cc-notes">
              Worum geht es bei diesem Fall?
            </MedicalFormLabel>
            <MedicalFormTextarea
              id="cc-notes"
              value={notes}
              onChange={setNotes}
              rows={6}
              placeholder="Beschwerden, Verlauf und klinischer Kontext in eigenen Worten …"
            />
          </MedicalFormSection>
          ) : null}

          {step === 3 ? (
          <section ref={uploadSectionRef}>
          <MedicalFormSection title="Klinische Bilder">
            <MedicalFormUploadEmpty
              title={
                attachments.length > 0
                  ? "Weitere klinische Fotos hinzufügen"
                  : "Klinische Fotos hinzufügen"
              }
              hint="JPG, PNG, HEIC oder WEBP — Übernahme nach dem Anlegen des Falls"
              dragActive={dragActive}
              disabled={busy}
              icon={
                <span className="yd-medical-upload-icon" aria-hidden>
                  <ImagePlus className="h-5 w-5" strokeWidth={1.75} />
                </span>
              }
              inputProps={{
                type: "file",
                multiple: true,
                accept:
                  "image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif",
                "aria-label": "Klinische Fotos hinzufügen",
                onChange: (e) => {
                  addPickedFiles(e.target.files);
                  e.target.value = "";
                },
              }}
              onDragEnter={() => !busy && setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => {
                e.preventDefault();
                if (!busy) e.dataTransfer.dropEffect = "copy";
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (!busy) addPickedFiles(e.dataTransfer.files);
              }}
            />
            {uploadZoneError ? (
              <p className="yd-medical-form-alert mt-3" role="alert">
                {uploadZoneError}
              </p>
            ) : null}
            {attachments.length > 0 ? (
              <ul className="mt-4" aria-label="Ausgewählte Fotos">
                {attachments.map((row, index) => (
                  <li key={row.id} className="yd-medical-attachment-row">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.previewUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-[#0c1929]">
                        {row.file.name || "Foto"}
                      </p>
                      <p className="text-[12px] text-slate-500">
                        Wird mit dem Fall gespeichert
                      </p>
                    </div>
                    <button
                      type="button"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
                      onClick={() => removeAttachment(index)}
                      aria-label="Foto entfernen"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </MedicalFormSection>
          </section>
          ) : null}

          {step === 4 ? (
          <MedicalFormSection title="Priorität">
            <MedicalFormSegmented
              name="urgency"
              aria-label="Gewünschter Zeitraum"
              options={URGENCY_OPTIONS}
              value={urgency}
              onChange={setUrgency}
              allowDeselect
              disabled={busy}
            />
          </MedicalFormSection>
          ) : null}

          {step === 5 ? (
          <MedicalFormSection title="Prüfen & Speichern">
            <dl className="yd-medical-review-dl">
              <div>
                <dt>Patient</dt>
                <dd>{patientName || "—"}</dd>
              </div>
              <div>
                <dt>Anliegen</dt>
                <dd>{notesTrim || "—"}</dd>
              </div>
              <div>
                <dt>Bilder</dt>
                <dd>{attachments.length === 0 ? "Keine" : `${attachments.length} Foto(s)`}</dd>
              </div>
              <div>
                <dt>Priorität</dt>
                <dd>{urgencyLabel}</dd>
              </div>
            </dl>
          </MedicalFormSection>
          ) : null}
        </fieldset>
      </div>
    </MedicalFormShell>
  );
}
