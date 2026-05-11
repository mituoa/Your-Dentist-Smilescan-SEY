"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Upload, X } from "lucide-react";
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

interface CreateCaseClientProps {
  workspaceId: string;
}

export function CreateCaseClient({ workspaceId }: CreateCaseClientProps) {
  const router = useRouter();
  const birthRef = useRef<SmartDateInputHandle>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingKind, setPendingKind] = useState<"draft" | "publish" | null>(
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

  const close = () => {
    router.push("/inbox");
  };

  const fileKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`;

  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;
  useEffect(() => {
    return () => {
      for (const a of attachmentsRef.current) {
        URL.revokeObjectURL(a.previewUrl);
      }
    };
  }, []);

  /** Vollflächiges Overlay: Hintergrund-Scroll/Bounce unter iOS vermeiden (global, nicht nur Seiteninhalt). */
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, []);

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
    for (let i = 0; i < attachments.length; i++) {
      const file = attachments[i].file;
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
    setPendingKind(isDraft ? "draft" : "publish");
    startTransition(async () => {
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
          setError(pathsResult.error);
          return;
        }

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
          setError(result.error);
          return;
        }
        if (result.submissionId) {
          router.push(`/inbox/${result.submissionId}?angelegt=1`);
          router.refresh();
        }
      } finally {
        setPendingKind(null);
      }
    });
  };

  const busy = isPending || pendingKind !== null;

  return (
    <>
      <button
        type="button"
        aria-label="Schließen"
        className="create-case-backdrop fixed inset-0 z-[999] border-0 p-0"
        onClick={close}
      />

      <div className="pointer-events-none fixed inset-0 z-[1000] flex min-h-0 flex-col overflow-hidden md:items-center md:justify-center md:overflow-y-auto md:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-case-title"
          className="create-case-modal pointer-events-auto flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white max-sm:max-h-[100dvh] max-sm:rounded-none max-sm:shadow-none md:max-h-[min(100dvh-3rem,920px)] md:max-w-[680px] md:flex-none md:rounded-2xl md:shadow-[0_28px_80px_-12px_rgba(15,23,42,0.18),0_12px_32px_rgba(15,23,42,0.1),0_0_0_1px_rgba(15,23,42,0.04)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-6 pt-[max(1rem,var(--safe-area-top))] [-webkit-overflow-scrolling:touch] sm:px-8 sm:pt-8">
          <header className="mb-6 sm:mb-8">
            <p
              className="mb-2 text-[12px] font-semibold uppercase tracking-wider"
              style={{ color: "#94A3B8" }}
            >
              Neuer Fall
            </p>
            <h1
              id="create-case-title"
              className="mb-2 break-words text-[clamp(1.375rem,4vw+0.35rem,1.75rem)] font-semibold tracking-tight"
              style={{ color: "#0F172A", lineHeight: 1.2 }}
            >
              Fall erstellen
            </h1>
            <p className="text-[14px] leading-relaxed" style={{ color: "#64748B" }}>
              Erfassen Sie einen neuen Patientenfall schnell und strukturiert.
            </p>
          </header>

          <div className="mb-6 min-h-[52px]">
            {error ? (
              <p
                className="rounded-xl border border-red-100/90 bg-red-50/90 px-4 py-3 text-[14px] leading-snug text-red-900/90"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>

          <div className="space-y-0">
            <section className="pb-8">
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
                    className="h-12 w-full rounded-[10px] border border-[#E2E8F0] px-4 text-[15px] text-[#0F172A] placeholder:text-gray-400 outline-none transition focus:border-[#2F80ED] focus:ring-[3px] focus:ring-[rgba(47,128,237,0.12)]"
                  />
                </Field>
                <Field label="E-Mail (optional)">
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="für Terminlink & Rückfragen"
                    className="h-12 w-full rounded-[10px] border border-[#E2E8F0] px-4 text-[15px] text-[#0F172A] placeholder:text-gray-400 outline-none transition focus:border-[#2F80ED] focus:ring-[3px] focus:ring-[rgba(47,128,237,0.12)]"
                  />
                </Field>
                <Field label="Telefon (optional)">
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="+49 …"
                    className="h-12 w-full rounded-[10px] border border-[#E2E8F0] px-4 text-[15px] text-[#0F172A] placeholder:text-gray-400 outline-none transition focus:border-[#2F80ED] focus:ring-[3px] focus:ring-[rgba(47,128,237,0.12)]"
                  />
                </Field>
              </div>
            </section>

            <section className="border-t border-[#F1F5F9] pt-8">
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
                className="w-full resize-y rounded-[10px] border border-[#E2E8F0] px-4 py-3 text-[15px] text-[#0F172A] placeholder:text-gray-400 outline-none transition focus:border-[#2F80ED] focus:ring-[3px] focus:ring-[rgba(47,128,237,0.12)]"
              />
            </section>

            <section className="border-t border-[#F1F5F9] pt-8">
              <h2
                className="mb-4 text-[11px] font-bold uppercase tracking-wider"
                style={{ color: "#94A3B8" }}
              >
                Einschätzung der Dringlichkeit
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {URGENCY_OPTIONS.map((opt) => {
                  const active = urgency === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setUrgency(active ? null : opt.id)}
                      className={`min-h-[44px] rounded-[11px] border px-4 py-2.5 text-[14px] font-medium transition-[border-color,background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.98] motion-reduce:active:scale-100 ${
                        active
                          ? "border-[#2F80ED] bg-[rgba(47,128,237,0.1)] text-[#1557C7] shadow-[0_0_0_2px_rgba(47,128,237,0.22),0_1px_2px_rgba(15,23,42,0.04)]"
                          : "border-[#E2E8F0] bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="border-t border-[#F1F5F9] pt-8">
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
                    {attachments.length > 0
                      ? "Weitere Bilder hinzufügen"
                      : "Bilder hinzufügen"}
                  </p>
                  <p className="max-w-[280px] text-center text-[12px] leading-snug" style={{ color: "#94A3B8" }}>
                    {attachments.length > 0
                      ? "Weitere Dateien auswählen oder hierher ziehen · wird beim Speichern mit übermittelt"
                      : "Klick zum Auswählen oder Dateien hierher ziehen · JPG, PNG, HEIC, WEBP"}
                  </p>
                </div>
              </div>
              {uploadZoneError ? (
                <p className="mt-2 text-[13px] leading-snug text-red-700" role="status">
                  {uploadZoneError}
                </p>
              ) : null}

              {attachments.length > 0 ? (
                <ul className="mt-4 space-y-2.5" aria-label="Ausgewählte Bilder">
                  {attachments.map((row, index) => (
                    <li
                      key={row.id}
                      className="flex items-center gap-3 rounded-xl border border-[#EEF2F6] bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={row.previewUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <span
                          className="absolute bottom-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm"
                          aria-hidden
                        >
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-[#0F172A]">
                          {row.file.name || "Bild"}
                        </p>
                        <p className="text-[12px] text-emerald-700/90">
                          Ausgewählt · wird mit dem Fall übertragen
                        </p>
                      </div>
                      <button
                        type="button"
                        className="flex h-10 min-w-[40px] shrink-0 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED]/30"
                        onClick={() => removeAttachment(index)}
                        aria-label="Bild entfernen"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-center text-[12px] leading-relaxed" style={{ color: "#94A3B8" }}>
                  Noch keine Bilder — optional, empfohlen bei sichtbaren Veränderungen.
                </p>
              )}
            </section>
          </div>
          </div>

          <footer className="shrink-0 border-t border-[#E8EDF4] bg-white/95 px-4 pt-4 backdrop-blur-md shadow-[0_-12px_32px_-12px_rgba(15,23,42,0.07)] pb-[max(1.25rem,var(--safe-area-bottom))] sm:px-8 sm:pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <button
              type="button"
              disabled={busy}
              className="h-11 min-h-[44px] w-full rounded-[10px] px-5 text-[14px] font-medium text-[#94A3B8] transition hover:bg-[#F8FAFC] hover:text-[#64748B] disabled:pointer-events-none disabled:opacity-45 sm:w-auto"
              onClick={() => submit(true)}
            >
              {pendingKind === "draft" ? "Entwurf wird gespeichert…" : "Speichern als Entwurf"}
            </button>
            <button
              type="button"
              disabled={busy}
              className="h-11 min-h-[44px] w-full rounded-[10px] px-6 text-[15px] font-medium text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#0F172A] disabled:pointer-events-none disabled:opacity-45 sm:w-auto"
              onClick={close}
            >
              Abbrechen
            </button>
            <button
              type="button"
              disabled={busy}
              className="h-11 min-h-[44px] w-full rounded-[11px] px-8 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(47,128,237,0.35),0_1px_2px_rgba(15,23,42,0.06)] transition-[box-shadow,transform,opacity] duration-150 hover:shadow-[0_6px_20px_rgba(47,128,237,0.4)] active:scale-[0.99] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-55 sm:min-w-[200px] sm:w-auto"
              style={{ background: "#2F80ED" }}
              onClick={() => submit(false)}
            >
              {pendingKind === "publish" ? "Fall wird erstellt…" : "Fall erstellen"}
            </button>
            </div>
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
