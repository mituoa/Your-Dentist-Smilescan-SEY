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
  cancelHref?: string;
  onClose?: () => void;
  overlay?: "auth" | "workspace";
}

export function CreateCaseClient({
  workspaceId,
  cancelHref = "/inbox",
  onClose,
  overlay = "auth",
}: CreateCaseClientProps) {
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

  const busy = isPending;

  const patientName = `${firstName.trim()} ${lastName.trim()}`.trim();
  const notesTrim = notes.trim();
  const emailTrim = patientEmail.trim();
  const phoneTrim = patientPhone.trim();
  const canSaveFinal =
    patientName.length > 0 && emailTrim.length > 0 && phoneTrim.length > 0;

  const close = () => {
    if (busy) return;
    if (onClose) {
      onClose();
      return;
    }
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

        if (!emailTrim) {
          setError("Bitte geben Sie die E-Mail-Adresse des Patienten ein.");
          return;
        }
        if (!phoneTrim) {
          setError("Bitte geben Sie die Telefonnummer des Patienten ein.");
          return;
        }

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
          patientEmail: emailTrim,
          patientPhone: phoneTrim,
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
          onClose?.();
          router.push(`/inbox/${result.submissionId}?${q.toString()}`);
          router.refresh();
        }
      } catch (e) {
        if (uploadedPaths.length > 0) void deleteTempSubmissionPhotos(uploadedPaths);
        setError(taskMutationClientFailureMessage(e));
      }
    });
  };

  return (
    <MedicalFormShell
      title="Neuer Fall"
      onClose={close}
      closeDisabled={busy}
      ariaLabel="Neuer Fall"
      overlayVariant={overlay}
      panelClassName={
        overlay === "workspace" ? "yd-medical-form-panel--workspace-compact" : undefined
      }
      footer={
        <MedicalFormFooterActions
          onCancel={close}
          cancelDisabled={busy}
          primaryLabel="Patientenfall anlegen"
          primaryPendingLabel="Wird angelegt…"
          onPrimary={submit}
          primaryDisabled={!canSaveFinal}
          isPending={busy}
        />
      }
    >
      <div className="yd-medical-form">
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
                />
              </div>
            </MedicalFormFieldStack>
            <MedicalFormFieldStack className="mt-4">
              <div>
                <MedicalFormLabel htmlFor="cc-email">E-Mail</MedicalFormLabel>
                <input
                  id="cc-email"
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="yd-auth-input"
                />
              </div>
              <div>
                <MedicalFormLabel htmlFor="cc-phone">Telefon</MedicalFormLabel>
                <input
                  id="cc-phone"
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  autoComplete="tel"
                  required
                  className="yd-auth-input"
                />
              </div>
            </MedicalFormFieldStack>
          </MedicalFormSection>

          <MedicalFormSection title="Anliegen">
            <MedicalFormLabel htmlFor="cc-notes">Anliegen</MedicalFormLabel>
            <MedicalFormTextarea
              id="cc-notes"
              value={notes}
              onChange={setNotes}
              rows={6}
            />
          </MedicalFormSection>

          <section ref={uploadSectionRef}>
          <MedicalFormSection title="Klinische Bilder">
            <MedicalFormUploadEmpty
              title={
                attachments.length > 0 ? "Weitere Fotos" : "Fotos hinzufügen"
              }
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
        </fieldset>
      </div>
    </MedicalFormShell>
  );
}
