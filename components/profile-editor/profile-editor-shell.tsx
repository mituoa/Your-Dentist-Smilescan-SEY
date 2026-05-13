"use client";

/** Öffentliche Präsenz: Bühne (Vorschau) dominant, Kuratieren in schmaler Nebenspur. */
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
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-auto overflow-y-auto overscroll-y-contain lg:flex-row lg:overflow-hidden">
        {/* Bühne — zuerst im DOM: liest sich als Profil, nicht als Formular */}
        <div
          className="order-1 flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain lg:order-1"
          role="region"
          aria-label="Öffentliche Profildarstellung"
        >
          <ProfileFigmaLivePreview data={mergedProfile} />
        </div>

        {/* Kuratieren — schmal, visuell zurückgenommen */}
        <div
          className="order-2 flex min-h-0 w-full shrink-0 flex-col overflow-y-auto scroll-pb-10 border-slate-300/20 bg-[#F4F3F0] max-lg:border-t lg:order-2 lg:w-[min(100%,320px)] lg:max-w-[360px] lg:border-l lg:border-t-0 xl:max-w-[380px]"
          aria-busy={saveStatus === "saving" || photoUploading}
        >
          <div className="px-5 py-8 sm:px-6 sm:py-9">
            <header className="border-b border-slate-300/25 pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Öffentliche Präsenz</p>
              <h1 className="mt-1.5 font-serif text-[1.25rem] font-light leading-snug tracking-[-0.02em] text-slate-900 sm:text-[1.35rem]">
                Patientenbereich
              </h1>
              <p className="mt-2 text-[12px] leading-snug text-slate-500">Änderungen werden automatisch übernommen.</p>
            </header>

            <div className="mt-8 flex flex-col gap-9 sm:gap-10">
              {/* Porträt */}
              <section aria-labelledby="pe-photo-label">
                <h2 id="pe-photo-label" className="sr-only">
                  Porträt
                </h2>
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    disabled={interactionLocked}
                    onClick={() => fileRef.current?.click()}
                    className="group relative shrink-0 touch-manipulation overflow-hidden rounded-xl border border-slate-300/30 bg-white/50 transition hover:border-slate-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ width: 72, height: 96 }}
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
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-[12px] text-slate-500">Porträt · mind. 400px · JPG, PNG oder WebP</p>
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
                <h2 id="pe-name-label" className="sr-only">
                  Name
                </h2>
                <div className="flex flex-col gap-3">
                  <FigmaTextInput
                    variant="quiet"
                    placeholder="Titel"
                    maxLength={PROFILE_LIMITS.title}
                    value={data.title || ""}
                    onChange={(e) => updateField("title", e.target.value || null)}
                  />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                    <FigmaTextInput
                      variant="quiet"
                      placeholder="Vorname"
                      maxLength={PROFILE_LIMITS.first_name}
                      value={data.first_name || ""}
                      onChange={(e) => updateField("first_name", e.target.value || null)}
                    />
                    <FigmaTextInput
                      variant="quiet"
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
                <h2 id="pe-work-label" className="sr-only">
                  Arbeitsweise
                </h2>
                <div className="flex flex-col gap-3">
                  {([0, 1, 2] as const).map((i) => (
                    <FigmaTextInput
                      key={i}
                      variant="quiet"
                      maxLength={400}
                      placeholder={i === 0 ? "Erster Satz" : i === 1 ? "Zweiter Satz" : "Dritter Satz"}
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
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <h2 id="pe-spec-label" className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Schwerpunkte
                  </h2>
                  <span className="text-[10px] font-medium tabular-nums text-slate-400">
                    {data.specializations.length}/{MAX_FIGMA_SPECIALTY_SELECTIONS}
                  </span>
                </div>
                <ul className="max-h-[min(52vh,22rem)] divide-y divide-slate-300/25 overflow-y-auto overscroll-y-contain border-y border-slate-300/25 [-webkit-overflow-scrolling:touch]">
                  {FIGMA_SPECIALTY_OPTIONS.filter(
                    (s) =>
                      showAllSpecialties ||
                      FIGMA_PRIMARY_SPECIALTY_IDS.includes(s.id) ||
                      data.specializations.includes(s.id)
                  ).map((specialty) => {
                    const isSelected = data.specializations.includes(specialty.id);
                    const isDisabled = !isSelected && data.specializations.length >= MAX_FIGMA_SPECIALTY_SELECTIONS;
                    const rowMuted = isDisabled || interactionLocked;
                    return (
                      <li key={specialty.id}>
                        <button
                          type="button"
                          disabled={rowMuted}
                          aria-pressed={isSelected}
                          onClick={() => !rowMuted && toggleSpecialty(specialty.id)}
                          className="flex w-full items-center justify-between gap-3 py-3 pr-1 text-left text-[13px] font-normal leading-snug tracking-[-0.01em] text-slate-800 transition-colors disabled:cursor-not-allowed disabled:opacity-35 hover:bg-white/40"
                        >
                          <span className={isSelected ? "font-medium text-slate-950" : "text-slate-600"}>
                            {specialty.label}
                          </span>
                          <span className="flex h-4 w-5 shrink-0 items-center justify-end" aria-hidden>
                            {isSelected ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-700/90" />
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {!showAllSpecialties && FIGMA_SPECIALTY_OPTIONS.length > FIGMA_PRIMARY_SPECIALTY_IDS.length ? (
                  <button
                    type="button"
                    disabled={interactionLocked}
                    onClick={() => setShowAllSpecialties(true)}
                    className="mt-4 inline-flex min-h-[44px] items-center text-[12px] font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-700 touch-manipulation disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Weitere anzeigen
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
                <h2 id="pe-practice-label" className="sr-only">
                  Praxis
                </h2>
                <div className="flex flex-col gap-3">
                  <FigmaTextInput
                    variant="quiet"
                    placeholder="Praxisname"
                    maxLength={PROFILE_LIMITS.practice_name}
                    value={data.practice_name || ""}
                    onChange={(e) => updateField("practice_name", e.target.value || null)}
                  />
                  <FigmaTextInput
                    variant="quiet"
                    placeholder="Straße, Nr."
                    maxLength={120}
                    value={addr.street}
                    onChange={(e) =>
                      updatePracticeField(
                        "practice_address",
                        mergePracticeAddressBlock(e.target.value, addr.postalCode, addr.city)
                      )
                    }
                  />
                  <div className="grid grid-cols-3 gap-x-3 gap-y-3">
                    <FigmaTextInput
                      variant="quiet"
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
                      variant="quiet"
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
                    variant="quiet"
                    placeholder="Öffnungszeiten"
                    maxLength={PROFILE_LIMITS.practice_hours}
                    value={data.practice_hours || ""}
                    onChange={(e) => updateField("practice_hours", e.target.value || null)}
                  />
                </div>
              </section>

              <div className="mt-10 flex min-h-[2.5rem] flex-col justify-end border-t border-slate-300/25 pt-6">
                <AutoSaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} errorMessage={errorMessage} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
