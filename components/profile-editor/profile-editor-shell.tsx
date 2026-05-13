"use client";

/** Öffentliche Präsenz: kuratierte Eingabe links, institutionelle Live-Vorschau rechts (Patientenbereich). */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Camera } from "lucide-react";

import { AutoSaveIndicator, type SaveStatus } from "./auto-save-indicator";
import { FigmaTextInput } from "./figma-form-fields";
import { ProfileFigmaLivePreview } from "@/components/profile-editor/profile-figma-live-preview";
import { saveProfileData, uploadPortraitPhoto } from "@/app/(protected)/profile/editor/actions";
import type { ProfileEditorData } from "@/lib/types/profile-editor-data";
import {
  MAX_WORKING_STYLE_SELECTIONS,
  buildWorkingStyleVita,
  getCategorizedStatements,
  parseWorkingStyleVita,
  statementIdsToThreeLines,
} from "@/lib/profile/working-style-library";
import {
  FIGMA_PRIMARY_SPECIALTY_IDS,
  FIGMA_SPECIALTY_OPTIONS,
  MAX_FIGMA_SPECIALTY_SELECTIONS,
  figmaSpecialtyLabel,
} from "@/lib/profile/figma-specialties";
import { mergePracticeAddressBlock, parsePracticeAddressBlock } from "@/lib/profile/practice-address-split";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";

interface ProfileEditorShellProps {
  initialData: ProfileEditorData;
}

type WorkingFormState = ReturnType<typeof parseWorkingStyleVita>;

export function ProfileEditorShell({ initialData }: ProfileEditorShellProps) {
  const [data, setData] = useState<ProfileEditorData>(initialData);
  const [working, setWorking] = useState<WorkingFormState>(() => parseWorkingStyleVita(initialData.vita_markdown));
  const [showStatementLibrary, setShowStatementLibrary] = useState(false);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Verhindert, dass ein abgeschlossener Speichern-Lauf den Status überschreibt, wenn inzwischen ein neuer Lauf gestartet wurde. */
  const saveSeqRef = useRef(0);
  const latestDataRef = useRef(data);
  const mergedProfile = useMemo(
    () => ({
      ...data,
      vita_markdown: buildWorkingStyleVita(working) || null,
    }),
    [data, working]
  );
  latestDataRef.current = mergedProfile;

  const skipInitialSave = useRef(true);

  const updateField = useCallback(<K extends keyof ProfileEditorData>(field: K, value: ProfileEditorData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updatePracticeField = useCallback((field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value } as ProfileEditorData));
  }, []);

  const performSave = useCallback(async () => {
    const seq = ++saveSeqRef.current;
    setSaveStatus("saving");
    setErrorMessage(null);
    const d = latestDataRef.current;

    try {
      const result = await saveProfileData({
        first_name: d.first_name || "",
        last_name: d.last_name || "",
        title: d.title || "",
        founding_year: d.founding_year,
        vita_markdown: d.vita_markdown || "",
        specializations: d.specializations,
        services_structured: d.services_structured,
        practice_name: d.practice_name || "",
        practice_address: d.practice_address || "",
        practice_employment_status: d.practice_employment_status || "",
        practice_phone: d.practice_phone || "",
        practice_email: d.practice_email || "",
        practice_website: d.practice_website || "",
        practice_hours: d.practice_hours || "",
      });

      if (seq !== saveSeqRef.current) {
        return;
      }

      if (result.error) {
        setSaveStatus("error");
        setErrorMessage(result.error);
      } else {
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      }
    } catch {
      if (seq !== saveSeqRef.current) {
        return;
      }
      setSaveStatus("error");
      setErrorMessage("Speichern fehlgeschlagen.");
    }
  }, []);

  useEffect(() => {
    if (skipInitialSave.current) {
      skipInitialSave.current = false;
      return;
    }

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      void performSave();
    }, 2000);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, working]);

  const addr = parsePracticeAddressBlock(data.practice_address);

  const toggleSpecialty = (id: string) => {
    const sel = data.specializations;
    if (sel.includes(id)) {
      updateField(
        "specializations",
        sel.filter((x) => x !== id)
      );
      return;
    }
    if (sel.length >= MAX_FIGMA_SPECIALTY_SELECTIONS) return;
    updateField("specializations", [...sel, id]);
  };

  const toggleStatement = (id: string) => {
    setWorking((prev) => {
      const ids = prev.statementIds;
      if (ids.includes(id)) {
        return { ...prev, statementIds: ids.filter((x) => x !== id) };
      }
      if (ids.length >= MAX_WORKING_STYLE_SELECTIONS) return prev;
      return { ...prev, statementIds: [...ids, id], freeLines: ["", "", ""] };
    });
  };

  const displayLines = useMemo((): [string, string, string] => {
    if (working.statementIds.length > 0) {
      return statementIdsToThreeLines(working.statementIds);
    }
    return working.freeLines;
  }, [working.statementIds, working.freeLines]);

  const onWorkingLineChange = (index: 0 | 1 | 2, value: string) => {
    setWorking((prev) => {
      const base: [string, string, string] =
        prev.statementIds.length > 0
          ? statementIdsToThreeLines(prev.statementIds)
          : ([...prev.freeLines] as [string, string, string]);
      base[index] = value;
      return { ...prev, statementIds: [], freeLines: base };
    });
  };

  const onPhotoPick = async (file: File) => {
    setPhotoUploading(true);
    setPhotoError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadPortraitPhoto(fd);
      if (result.error) setPhotoError(result.error);
      else if (result.url) updateField("photo_url", result.url);
    } catch {
      setPhotoError("Upload fehlgeschlagen.");
    } finally {
      setPhotoUploading(false);
    }
  };

  /** Keine parallelen Nebenaktionen während persistierendem Speichern oder Porträt-Upload. */
  const interactionLocked = saveStatus === "saving" || photoUploading;

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden pb-[max(0px,env(safe-area-inset-bottom))]"
      style={{ backgroundColor: "#EDECE8" }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_0%,rgba(255,255,255,0.5),transparent_50%)]"
        aria-hidden
      />
      <div className="relative flex min-h-0 min-w-0 flex-1 touch-pan-x flex-col overflow-x-auto overflow-y-auto overscroll-y-contain max-lg:min-h-0 lg:flex-row lg:overflow-y-hidden">
        {/* Links: kuratierte Eingabe — schmaler als die Bühne, weniger „Admin-Wand“ */}
        <div
          className="flex min-h-0 w-full shrink-0 flex-col overflow-y-auto scroll-pb-10 border-slate-200/70 bg-[#FAFAF9] max-lg:border-b lg:h-full lg:w-[min(100%,400px)] lg:max-w-[440px] lg:border-b-0 lg:border-r xl:w-[min(100%,420px)]"
          aria-busy={saveStatus === "saving" || photoUploading}
        >
          <div className="px-6 py-10 sm:px-8 sm:py-12 md:px-10 md:py-14">
            <div className="mb-10 sm:mb-12">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Öffentliche Präsenz
              </p>
              <h1 className="text-[1.125rem] font-semibold leading-snug tracking-[-0.02em] text-slate-900 sm:text-[1.1875rem]">
                Ihre Darstellung im Patientenbereich
              </h1>
              <p className="mt-3 max-w-[40ch] text-[13px] leading-[1.65] text-slate-500 sm:max-w-[42ch]">
                Texte, Porträt, Schwerpunkte sowie Praxisadresse und Zeiten — so, wie Patientinnen und Patienten Sie
                später beim ersten Kontakt wahrnehmen. Änderungen werden automatisch gespeichert.
              </p>
            </div>

            <div className="flex flex-col gap-12 max-sm:gap-14 md:gap-14">
              {/* Porträt */}
              <section aria-labelledby="pe-photo-label">
                <h2 id="pe-photo-label" className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Porträt
                </h2>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <button
                    type="button"
                    disabled={interactionLocked}
                    onClick={() => fileRef.current?.click()}
                    className="group relative shrink-0 touch-manipulation overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      width: 112,
                      height: 148,
                    }}
                  >
                    {data.photo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={data.photo_url}
                        alt=""
                        className="h-full w-full object-cover object-[50%_15%]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50 px-2">
                        <Camera className="h-6 w-6 text-slate-300" strokeWidth={1.25} />
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-slate-900/35 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="mb-2 text-[11px] font-medium text-white">Ersetzen</span>
                    </div>
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-slate-700">Porträt für den Patientenbereich</p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">
                      Empfohlen mindestens 400×400 Pixel, JPEG, PNG oder WebP. Wirkt neben Ihrem Namen als
                      vertrauensbildendes Erstbild.
                    </p>
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) void onPhotoPick(f);
                  }}
                />
                {photoUploading ? (
                  <p className="mt-2 text-[12px] text-slate-500">Wird hochgeladen…</p>
                ) : null}
                {photoError ? (
                  <p
                    className="mt-2 border-l-2 border-text-tertiary/60 pl-2 text-[12px] leading-relaxed text-text-secondary"
                    role="status"
                    aria-live="polite"
                  >
                    {photoError}
                  </p>
                ) : null}
              </section>

              {/* Name */}
              <section aria-labelledby="pe-name-label">
                <h2 id="pe-name-label" className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Name
                </h2>
                <div className="flex flex-col gap-2.5 sm:gap-2">
                  <FigmaTextInput
                    placeholder="Titel"
                    maxLength={PROFILE_LIMITS.title}
                    value={data.title || ""}
                    onChange={(e) => updateField("title", e.target.value || null)}
                  />
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-2">
                    <FigmaTextInput
                      placeholder="Vorname"
                      maxLength={PROFILE_LIMITS.first_name}
                      value={data.first_name || ""}
                      onChange={(e) => updateField("first_name", e.target.value || null)}
                    />
                    <FigmaTextInput
                      placeholder="Nachname"
                      maxLength={PROFILE_LIMITS.last_name}
                      value={data.last_name || ""}
                      onChange={(e) => updateField("last_name", e.target.value || null)}
                    />
                  </div>
                </div>
              </section>

              {/* Arbeitsweise */}
              <section aria-labelledby="pe-work-label">
                <div className="mb-4">
                  <h2 id="pe-work-label" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Arbeitsweise
                  </h2>
                  <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                    Bis zu drei kurze Sätze — sachlich, für Patientinnen gut lesbar; erscheinen unter Ihrem Namen.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 sm:gap-2">
                  {([0, 1, 2] as const).map((i) => (
                    <FigmaTextInput
                      key={i}
                      maxLength={400}
                      placeholder={
                        i === 0
                          ? "z. B. Wir erklären den Ablauf verständlich."
                          : i === 1
                            ? "z. B. Vor der Behandlung klären wir offene Fragen."
                            : "z. B. Wir behandeln nur das, was medizinisch begründet ist."
                      }
                      value={displayLines[i]}
                      onChange={(e) => onWorkingLineChange(i, e.target.value)}
                    />
                  ))}
                </div>

                {!showStatementLibrary ? (
                  <button
                    type="button"
                    disabled={interactionLocked}
                    onClick={() => setShowStatementLibrary(true)}
                    className="mt-4 inline-flex min-h-[44px] items-center text-[12px] font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-700 touch-manipulation disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Formulierungsvorschläge
                  </button>
                ) : null}

                {showStatementLibrary ? (
                  <div className="mt-5 border-t border-slate-200/80 pt-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        {working.statementIds.length}/{MAX_WORKING_STYLE_SELECTIONS} ausgewählt
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowStatementLibrary(false)}
                        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-800 touch-manipulation"
                      >
                        Schließen
                      </button>
                    </div>
                    <div className="flex flex-col" style={{ gap: 16 }}>
                      {getCategorizedStatements().map((category) => (
                        <div key={category.name}>
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            {category.name}
                          </p>
                          <div className="flex flex-col" style={{ gap: 5 }}>
                            {category.statements.map((statement) => {
                              const isSelected = working.statementIds.includes(statement.id);
                              const isDisabled =
                                (!isSelected &&
                                  working.statementIds.length >= MAX_WORKING_STYLE_SELECTIONS) ||
                                interactionLocked;
                              return (
                                <button
                                  key={statement.id}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => !isDisabled && toggleStatement(statement.id)}
                                  className="rounded-xl border px-3 py-2.5 text-left text-[12px] leading-relaxed transition-colors disabled:cursor-not-allowed"
                                  style={{
                                    background: isSelected ? "rgba(248,250,252,0.95)" : "rgba(255,255,255,0.65)",
                                    color: isSelected ? "#0f172a" : "#64748b",
                                    borderColor: isSelected ? "rgba(51,65,85,0.35)" : "rgba(226,232,240,0.9)",
                                    opacity: isDisabled ? 0.35 : 1,
                                    cursor: isDisabled ? "not-allowed" : "pointer",
                                  }}
                                >
                                  {statement.text}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              {/* Schwerpunkte */}
              <section aria-labelledby="pe-spec-label">
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h2 id="pe-spec-label" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Schwerpunkte
                  </h2>
                  <span className="text-[10px] font-medium tabular-nums text-slate-400">
                    {data.specializations.length}/{MAX_FIGMA_SPECIALTY_SELECTIONS}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {FIGMA_SPECIALTY_OPTIONS.filter(
                    (s) =>
                      showAllSpecialties ||
                      FIGMA_PRIMARY_SPECIALTY_IDS.includes(s.id) ||
                      data.specializations.includes(s.id)
                  ).map((specialty) => {
                    const isSelected = data.specializations.includes(specialty.id);
                    const isDisabled = !isSelected && data.specializations.length >= MAX_FIGMA_SPECIALTY_SELECTIONS;
                    const chipMuted = isDisabled || interactionLocked;
                    return (
                      <button
                        key={specialty.id}
                        type="button"
                        disabled={chipMuted}
                        onClick={() => !chipMuted && toggleSpecialty(specialty.id)}
                        className="rounded-full px-3.5 py-2 text-left text-[12px] font-medium leading-snug tracking-[-0.01em] transition-colors disabled:cursor-not-allowed"
                        style={{
                          background: isSelected ? "#1e293b" : "rgba(255,255,255,0.85)",
                          color: isSelected ? "#f8fafc" : "#475569",
                          border: `1px solid ${isSelected ? "#1e293b" : "rgba(148,163,184,0.45)"}`,
                          opacity: chipMuted ? 0.35 : 1,
                          cursor: chipMuted ? "not-allowed" : "pointer",
                          boxShadow: isSelected ? "0 1px 2px rgba(15,23,42,0.12)" : "0 1px 0 rgba(255,255,255,0.9) inset",
                        }}
                      >
                        {specialty.label}
                      </button>
                    );
                  })}
                </div>
                {!showAllSpecialties && FIGMA_SPECIALTY_OPTIONS.length > FIGMA_PRIMARY_SPECIALTY_IDS.length ? (
                  <button
                    type="button"
                    disabled={interactionLocked}
                    onClick={() => setShowAllSpecialties(true)}
                    className="mt-4 inline-flex min-h-[44px] items-center text-[12px] font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-700 touch-manipulation disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Weitere Fachgebiete anzeigen
                  </button>
                ) : null}

                {data.specializations.some((id) => !FIGMA_SPECIALTY_OPTIONS.some((o) => o.id === id)) ? (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-200/80 bg-white/60 px-3 py-2.5 text-[11px] leading-relaxed text-slate-600">
                    Weitere gespeicherte Schwerpunkte:{" "}
                    {data.specializations
                      .filter((id) => !FIGMA_SPECIALTY_OPTIONS.some((o) => o.id === id))
                      .map((id) => figmaSpecialtyLabel(id))
                      .join(", ")}
                  </div>
                ) : null}
              </section>

              {/* Praxis */}
              <section aria-labelledby="pe-practice-label">
                <h2 id="pe-practice-label" className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Praxis
                </h2>
                <div className="flex flex-col gap-2.5 sm:gap-2">
                  <FigmaTextInput
                    placeholder="Praxisname (optional)"
                    maxLength={PROFILE_LIMITS.practice_name}
                    value={data.practice_name || ""}
                    onChange={(e) => updateField("practice_name", e.target.value || null)}
                  />
                  <FigmaTextInput
                    placeholder="Straße und Hausnummer"
                    maxLength={120}
                    value={addr.street}
                    onChange={(e) =>
                      updatePracticeField(
                        "practice_address",
                        mergePracticeAddressBlock(e.target.value, addr.postalCode, addr.city)
                      )
                    }
                  />
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-2">
                    <FigmaTextInput
                      placeholder="PLZ"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={12}
                      value={addr.postalCode}
                      onChange={(e) =>
                        updatePracticeField(
                          "practice_address",
                          mergePracticeAddressBlock(addr.street, e.target.value, addr.city)
                        )
                      }
                    />
                    <FigmaTextInput
                      placeholder="Stadt"
                      maxLength={80}
                      value={addr.city}
                      onChange={(e) =>
                        updatePracticeField(
                          "practice_address",
                          mergePracticeAddressBlock(addr.street, addr.postalCode, e.target.value)
                        )
                      }
                      className="col-span-2 w-full"
                    />
                  </div>
                  <FigmaTextInput
                    placeholder="Öffnungszeiten"
                    maxLength={PROFILE_LIMITS.practice_hours}
                    value={data.practice_hours || ""}
                    onChange={(e) => updateField("practice_hours", e.target.value || null)}
                  />
                </div>
              </section>

              <div className="mt-12 flex min-h-[2.75rem] flex-col justify-end border-t border-slate-200/80 pt-7 sm:mt-10 sm:pt-6">
                <AutoSaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} errorMessage={errorMessage} />
              </div>
            </div>
          </div>
        </div>

        {/* Rechts: Live-Bühne — volle Fläche, kein zentrierter „leerer Block“ */}
        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[#F2F0EC] lg:min-h-0"
          role="region"
          aria-label="Vorschau der öffentlichen Präsenz im Patientenbereich"
        >
          <ProfileFigmaLivePreview data={mergedProfile} />
        </div>
      </div>
    </div>
  );
}
