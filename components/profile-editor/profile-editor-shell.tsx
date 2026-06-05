"use client";

/** Öffentliche Präsenz: Bühne (Vorschau) dominant, Kuratieren in schmaler Nebenspur. */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Camera } from "lucide-react";

import { AutoSaveIndicator, type SaveStatus } from "./auto-save-indicator";
import { FigmaTextInput } from "./figma-form-fields";
import { ProfileBackgroundPicker } from "@/components/profile-editor/profile-background-picker";
import { ProfileFigmaLivePreview } from "@/components/profile-editor/profile-figma-live-preview";
import { ProfileServicesPicker } from "@/components/profile-editor/profile-services-picker";
import { ProfileSpecializationPicker } from "@/components/profile-editor/profile-specialization-picker";
import { saveProfileData, uploadPortraitPhoto } from "@/app/(protected)/profile/editor/actions";
import type { ProfileEditorData } from "@/lib/types/profile-editor-data";
import {
  MAX_WORKING_STYLE_SELECTIONS,
  buildWorkingStyleVita,
  getCategorizedStatements,
  parseWorkingStyleVita,
  statementIdsToThreeLines,
} from "@/lib/profile/working-style-library";
import { mergePracticeAddressBlock, parsePracticeAddressBlock } from "@/lib/profile/practice-address-split";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";

interface ProfileEditorShellProps {
  initialData: ProfileEditorData;
  workspaceName?: string;
}

type WorkingFormState = ReturnType<typeof parseWorkingStyleVita>;

export function ProfileEditorShell({
  initialData,
  workspaceName = "Ihre Praxis",
}: ProfileEditorShellProps) {
  const [data, setData] = useState<ProfileEditorData>(initialData);
  const [working, setWorking] = useState<WorkingFormState>(() => parseWorkingStyleVita(initialData.vita_markdown));
  const [showStatementLibrary, setShowStatementLibrary] = useState(false);
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
        profile_background_color: d.profile_background_color,
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
      className="yd-profile-editor-shell relative flex min-h-0 w-full flex-1 flex-col overflow-hidden pb-[max(0px,env(safe-area-inset-bottom))] md:h-full"
      style={{ backgroundColor: "#EDECE8" }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_0%,rgba(255,255,255,0.5),transparent_50%)]"
        aria-hidden
      />
      <div className="yd-profile-editor-body relative flex min-h-0 min-w-0 flex-1 flex-col md:flex-row md:overflow-hidden">
        {/* Bühne — zuerst im DOM: liest sich als Profil, nicht als Formular */}
        <div
          className="yd-profile-editor-preview order-1 flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] md:order-1"
          role="region"
          aria-label="Öffentliche Profildarstellung"
        >
          <ProfileFigmaLivePreview data={mergedProfile} workspaceName={workspaceName} />
        </div>

        {/* Kuratieren — schmal, visuell zurückgenommen */}
        <div
          className="yd-profile-editor-curate order-2 flex min-h-0 w-full shrink-0 flex-col border-slate-300/20 bg-[#F4F3F0] max-md:border-t md:order-2 md:w-[min(100%,320px)] md:max-w-[360px] md:border-l md:border-t-0 xl:max-w-[380px]"
          aria-busy={saveStatus === "saving" || photoUploading}
        >
          <div className="yd-profile-editor-curate-scroll px-5 py-8 sm:px-6 sm:py-9">
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

              {/* Praxis — oben, steuert die Headline in der Vorschau */}
              <section aria-labelledby="pe-practice-label">
                <h2
                  id="pe-practice-label"
                  className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400"
                >
                  Praxis
                </h2>
                <p className="mb-4 text-[12px] leading-snug text-slate-500">
                  Praxisname erscheint in der großen Headline der Patientenansicht.
                </p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label
                      htmlFor="pe-practice-name"
                      className="mb-1.5 block text-[11px] font-medium text-slate-600"
                    >
                      Praxisname
                    </label>
                    <FigmaTextInput
                      id="pe-practice-name"
                      variant="quiet"
                      placeholder="z. B. Carree Dental"
                      maxLength={PROFILE_LIMITS.practice_name}
                      value={data.practice_name || ""}
                      onChange={(e) => updateField("practice_name", e.target.value || null)}
                    />
                  </div>
                  <ProfileBackgroundPicker
                    value={data.profile_background_color}
                    onChange={(hex) => updateField("profile_background_color", hex)}
                    disabled={interactionLocked}
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

              {/* Schwerpunkte — vollständige Masterliste, gruppiert */}
              <section aria-labelledby="pe-spec-label">
                <ProfileSpecializationPicker
                  selected={data.specializations}
                  onChange={(ids) => updateField("specializations", ids)}
                  disabled={interactionLocked}
                />
              </section>

              {/* Leistungen — SERVICE_MASTER (12 Fachbereiche) */}
              <section aria-labelledby="pe-services-label" className="mt-9">
                <ProfileServicesPicker
                  services={data.services_structured}
                  onChange={(services) => updateField("services_structured", services)}
                  disabled={interactionLocked}
                />
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
