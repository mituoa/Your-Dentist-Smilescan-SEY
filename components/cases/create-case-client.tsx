"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Upload, X } from "lucide-react";
import {
  createPracticeCase,
  type PracticeCaseUrgency,
} from "@/app/(protected)/create-case/actions";
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

const URGENCY_OPTIONS: { id: UrgencyUi; label: string }[] = [
  { id: "not_urgent", label: "Nicht dringend" },
  { id: "this_week", label: "Diese Woche" },
  { id: "today", label: "Heute" },
];

function toServerUrgency(ui: UrgencyUi | null): PracticeCaseUrgency {
  if (!ui) return null;
  return ui;
}

interface CreateCaseClientProps {
  workspaceId: string;
}

export function CreateCaseClient({ workspaceId }: CreateCaseClientProps) {
  const router = useRouter();
  const birthRef = useRef<SmartDateInputHandle>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadZoneError, setUploadZoneError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [patientName, setPatientName] = useState("");
  const [birthIso, setBirthIso] = useState<string | null>(null);
  const [externalId, setExternalId] = useState("");
  const [notes, setNotes] = useState("");
  const [urgency, setUrgency] = useState<UrgencyUi | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const close = () => {
    router.push("/inbox");
  };

  const fileKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;

  const addPickedFiles = (list: FileList | null) => {
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

    setFiles((prev) => {
      const keys = new Set(prev.map(fileKey));
      const merged = [...prev];
      for (const f of accepted) {
        const k = fileKey(f);
        if (keys.has(k)) continue;
        keys.add(k);
        merged.push(f);
      }
      const next =
        merged.length > MAX_PHOTOS ? merged.slice(0, MAX_PHOTOS) : merged;
      queueMicrotask(() => {
        if (merged.length > MAX_PHOTOS) {
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

  const uploadFiles = async (): Promise<string[] | { error: string }> => {
    const paths: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        return {
          error: `Datei „${file.name}“ ist zu groß (max. ${Math.round(MAX_PHOTO_SIZE_BYTES / 1024 / 1024)} MB).`,
        };
      }
      const fd = new FormData();
      fd.append("file", file);
      fd.append("workspace_id", workspaceId);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { error: (errData as { error?: string }).error || "Upload fehlgeschlagen." };
      }
      const data = (await res.json()) as { storagePath?: string };
      if (!data.storagePath) return { error: "Upload fehlgeschlagen." };
      paths.push(data.storagePath);
    }
    return paths;
  };

  const submit = (isDraft: boolean) => {
    setError(null);
    setUploadZoneError(null);
    startTransition(async () => {
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
        setError(pathsResult.error);
        return;
      }

      const result = await createPracticeCase({
        patientName,
        patientBirthDate,
        patientExternalId: externalId || null,
        patientNotes: notes || null,
        urgency: toServerUrgency(urgency),
        isDraft,
        tempStoragePaths: pathsResult,
      });

      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.submissionId) {
        router.push(`/inbox/${result.submissionId}`);
        router.refresh();
      }
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Schließen"
        className="create-case-backdrop fixed inset-0 z-[999] border-0 p-0"
        onClick={close}
      />

      <div className="pointer-events-none fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-case-title"
          className="create-case-modal pointer-events-auto w-full max-w-[680px] max-h-[min(100vh-48px,900px)] overflow-y-auto rounded-2xl bg-white p-8 shadow-xl"
          style={{
            boxShadow:
              "0 20px 60px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="mb-8">
            <p
              className="mb-2 text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: "#94A3B8" }}
            >
              Neuer Fall
            </p>
            <h1
              id="create-case-title"
              className="mb-2 text-[28px] font-semibold tracking-tight"
              style={{ color: "#0F172A", lineHeight: 1.2 }}
            >
              Fall erstellen
            </h1>
            <p className="text-[14px] leading-relaxed" style={{ color: "#64748B" }}>
              Erfassen Sie einen neuen Patientenfall schnell und strukturiert.
            </p>
          </header>

          {error ? (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}

          <div className="space-y-8">
            <section>
              <h2
                className="mb-4 text-[11px] font-bold uppercase tracking-wider"
                style={{ color: "#94A3B8" }}
              >
                Patient
              </h2>
              <div className="space-y-4">
                <Field label="Name des Patienten">
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="z.B. Anna Müller"
                    className="h-12 w-full rounded-[10px] border border-[#E2E8F0] px-4 text-[15px] text-[#0F172A] placeholder:text-gray-400 outline-none transition focus:border-[#2F80ED] focus:ring-[3px] focus:ring-[rgba(47,128,237,0.08)]"
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
                    className="h-12 w-full rounded-[10px] border border-[#E2E8F0] px-4 text-[15px] text-[#0F172A] placeholder:text-gray-400 outline-none transition focus:border-[#2F80ED] focus:ring-[3px] focus:ring-[rgba(47,128,237,0.08)]"
                  />
                </Field>
              </div>
            </section>

            <section>
              <h2
                className="mb-4 text-[11px] font-bold uppercase tracking-wider"
                style={{ color: "#94A3B8" }}
              >
                Anliegen
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                placeholder="Was ist passiert? Wo genau? Seit wann bestehen die Beschwerden?"
                className="w-full resize-y rounded-[10px] border border-[#E2E8F0] px-4 py-3 text-[15px] text-[#0F172A] placeholder:text-gray-400 outline-none transition focus:border-[#2F80ED] focus:ring-[3px] focus:ring-[rgba(47,128,237,0.08)]"
              />
            </section>

            <section>
              <h2
                className="mb-4 text-[11px] font-bold uppercase tracking-wider"
                style={{ color: "#94A3B8" }}
              >
                Einschätzung der Dringlichkeit
              </h2>
              <div className="flex flex-wrap gap-2">
                {URGENCY_OPTIONS.map((opt) => {
                  const active = urgency === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setUrgency(active ? null : opt.id)}
                      className="rounded-[10px] border px-4 py-2.5 text-[14px] font-medium transition"
                      style={{
                        borderColor: active ? "#2F80ED" : "#E2E8F0",
                        background: active ? "rgba(47,128,237,0.08)" : "#FFFFFF",
                        color: active ? "#1C6FD8" : "#0F172A",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2
                className="mb-4 text-[11px] font-bold uppercase tracking-wider"
                style={{ color: "#94A3B8" }}
              >
                Bilder / Dokumente (optional)
              </h2>
              <div
                className={`relative flex min-h-[168px] flex-col items-center justify-center overflow-hidden rounded-[12px] border border-dashed px-6 py-10 transition-[border-color,background-color,box-shadow] duration-200 ease-out ${
                  dragActive
                    ? "border-[#2F80ED] bg-[rgba(47,128,237,0.07)] shadow-[0_0_0_3px_rgba(47,128,237,0.12)]"
                    : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]"
                }`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(true);
                }}
                onDragOver={(e) => {
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
                  addPickedFiles(e.dataTransfer.files);
                }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                  className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                  aria-label="Bilder auswählen oder per Drag & Drop ablegen"
                  onDragEnter={() => setDragActive(true)}
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
                    className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white shadow-sm"
                    style={{ color: "#64748B" }}
                  >
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="text-[14px] font-medium" style={{ color: "#0F172A" }}>
                    Bilder hinzufügen
                  </p>
                  <p className="max-w-[280px] text-center text-[12px] leading-snug" style={{ color: "#94A3B8" }}>
                    Klick zum Auswählen oder Dateien hierher ziehen · JPG, PNG, HEIC, WEBP
                  </p>
                </div>
              </div>
              {uploadZoneError ? (
                <p className="mt-2 text-[13px] leading-snug text-red-700" role="status">
                  {uploadZoneError}
                </p>
              ) : null}

              {files.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-lg bg-[#F8FAFC] px-4 py-3"
                    >
                      <span className="text-[14px] font-medium text-[#0F172A]">{file.name}</span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-[#64748B] hover:bg-[#E5E7EB]"
                        onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                        aria-label="Datei entfernen"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </div>

          <footer className="mt-10 flex flex-wrap items-center justify-end gap-3 border-t border-[#EEF2F6] pt-8">
            <button
              type="button"
              disabled={isPending}
              className="h-11 rounded-[10px] px-5 text-[14px] font-medium text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#64748B] disabled:opacity-50"
              onClick={() => submit(true)}
            >
              Speichern als Entwurf
            </button>
            <button
              type="button"
              disabled={isPending}
              className="h-11 rounded-[10px] px-6 text-[15px] font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] disabled:opacity-50"
              onClick={close}
            >
              Abbrechen
            </button>
            <button
              type="button"
              disabled={isPending}
              className="h-11 rounded-[10px] px-8 text-[15px] font-semibold text-white shadow-sm transition disabled:opacity-60"
              style={{ background: "#2F80ED", boxShadow: "0 2px 4px rgba(47,128,237,0.2)" }}
              onClick={() => submit(false)}
            >
              {isPending ? "Wird gespeichert…" : "Fall erstellen"}
            </button>
          </footer>
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
    <div>
      <label className="mb-2 block text-[13px] font-medium" style={{ color: "#64748B" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
