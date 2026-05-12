"use client";

/**
 * **ProfileEditorShell — Zweck (Punkt 1):** Ruhige Pflege der **Praxisdarstellung**, die im **öffentlichen
 * Patientenbereich** (`/doc/…`) erscheint — **kein** generisches Account-Center, **kein** CMS- oder Website-Builder,
 * **keine** Branding-Spielwiese. Formular links, **Orientierungsansicht** rechts (Lesen, kein zweiter Bearbeitungsmodus).
 * Auto-Speichern = Arbeitskomfort, **kein** „Publishing“-Ritual.
 */
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
    setSaveStatus("saving");
    setErrorMessage(null);
    const d = latestDataRef.current;

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

    if (result.error) {
      setSaveStatus("error");
      setErrorMessage(result.error);
    } else {
      setSaveStatus("saved");
      setLastSavedAt(new Date());
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
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadPortraitPhoto(fd);
    setPhotoUploading(false);
    if (result.error) setPhotoError(result.error);
    else if (result.url) updateField("photo_url", result.url);
  };

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden"
      style={{ backgroundColor: "#F8FAFC" }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(15,23,42,0.04),transparent)]"
        aria-hidden
      />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-row overflow-x-auto overflow-y-hidden">
        {/* LEFT — Eingabe (feste Arbeitsbreite) */}
        <div className="flex min-h-0 w-[480px] shrink-0 flex-col overflow-y-auto border-r border-solid border-[#ECECEC] bg-[#FBFBFB]">
          <div style={{ padding: "56px 40px" }}>
            <div style={{ marginBottom: 56 }}>
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: "#A3A3A3" }}>
                Praxisdarstellung
              </p>
              <h1 className="text-[15px] font-semibold tracking-[-0.02em]" style={{ color: "#171717", marginBottom: 8 }}>
                Praxisangaben für den Patientenbereich
              </h1>
              <p className="max-w-[320px] text-[12px]" style={{ color: "#737373", lineHeight: 1.55 }}>
                Diese Felder speisen die öffentliche Darstellung unter Ihrer Praxis-Kurzadresse. Änderungen gelten nach
                dem Speichern für neue Aufrufe — keine getrennte Veröffentlichung.
              </p>
            </div>

            <div className="flex flex-col" style={{ gap: 48 }}>
              {/* Foto */}
              <div>
                <label className="mb-3 block text-[11px] font-medium" style={{ color: "#737373" }}>
                  Foto
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    disabled={photoUploading}
                    onClick={() => fileRef.current?.click()}
                    className="group relative cursor-pointer"
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 3,
                      background: "#F5F5F5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 120ms ease",
                    }}
                  >
                    {data.photo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={data.photo_url}
                        alt=""
                        className="h-full w-full object-cover"
                        style={{ borderRadius: 3 }}
                      />
                    ) : (
                      <Camera className="h-5 w-5" style={{ color: "#A3A3A3" }} />
                    )}
                    <div
                      className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ borderRadius: 3, transition: "all 120ms ease" }}
                    >
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                  </button>
                  <div>
                    <p className="mb-0.5 text-[12px]" style={{ color: "#525252" }}>
                      Porträtfoto
                    </p>
                    <p className="text-[11px]" style={{ color: "#737373", lineHeight: 1.45 }}>
                      Sichtbar neben Name und Praxis; mindestens 400×400 Pixel (JPEG, PNG oder WebP).
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
                  <p className="mt-2 text-[12px]" style={{ color: "#737373" }}>
                    Wird hochgeladen…
                  </p>
                ) : null}
                {photoError ? (
                  <p className="mt-2 text-[12px]" style={{ color: "#DC2626" }}>
                    {photoError}
                  </p>
                ) : null}
              </div>

              {/* Name */}
              <div>
                <label className="mb-3 block text-[11px] font-medium" style={{ color: "#737373" }}>
                  Name
                </label>
                <div className="flex flex-col" style={{ gap: 8 }}>
                  <FigmaTextInput
                    placeholder="Titel"
                    maxLength={PROFILE_LIMITS.title}
                    value={data.title || ""}
                    onChange={(e) => updateField("title", e.target.value || null)}
                  />
                  <div className="grid grid-cols-2 gap-2">
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
              </div>

              {/* Arbeitsweise */}
              <div>
                <div className="mb-3">
                  <label className="mb-1 block text-[11px] font-medium" style={{ color: "#737373" }}>
                    Arbeitsweise
                  </label>
                  <p className="text-[11px]" style={{ color: "#737373", lineHeight: 1.5 }}>
                    Bis zu drei kurze Zeilen, sachlich und für Patientinnen nachvollziehbar; erscheinen im Patientenbereich
                    unter Ihrem Namen.
                  </p>
                </div>

                <div className="flex flex-col" style={{ gap: 8 }}>
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
                    onClick={() => setShowStatementLibrary(true)}
                    className="mt-3 text-[11px] font-medium"
                    style={{ color: "#999999", transition: "all 120ms ease" }}
                  >
                    Formulierungsvorschläge
                  </button>
                ) : null}

                {showStatementLibrary ? (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #F0F0F0" }}>
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] font-medium" style={{ color: "#A3A3A3" }}>
                        {working.statementIds.length}/{MAX_WORKING_STYLE_SELECTIONS} ausgewählt
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowStatementLibrary(false)}
                        className="text-[11px] font-medium"
                        style={{ color: "#999999", transition: "all 120ms ease" }}
                      >
                        Schließen
                      </button>
                    </div>
                    <div className="flex flex-col" style={{ gap: 16 }}>
                      {getCategorizedStatements().map((category) => (
                        <div key={category.name}>
                          <p
                            className="mb-2 text-[10px] font-medium"
                            style={{ color: "#A3A3A3", letterSpacing: "0.02em" }}
                          >
                            {category.name}
                          </p>
                          <div className="flex flex-col" style={{ gap: 5 }}>
                            {category.statements.map((statement) => {
                              const isSelected = working.statementIds.includes(statement.id);
                              const isDisabled =
                                !isSelected && working.statementIds.length >= MAX_WORKING_STYLE_SELECTIONS;
                              return (
                                <button
                                  key={statement.id}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => !isDisabled && toggleStatement(statement.id)}
                                  className="rounded-sm px-3 py-2.5 text-left text-[12px]"
                                  style={{
                                    background: isSelected ? "#F0F7FF" : "transparent",
                                    color: isSelected ? "#1a1a1a" : "#737373",
                                    border: `1px solid ${isSelected ? "#2F80ED" : "#ECECEC"}`,
                                    opacity: isDisabled ? 0.35 : 1,
                                    cursor: isDisabled ? "not-allowed" : "pointer",
                                    transition: "all 120ms ease",
                                    lineHeight: 1.5,
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
              </div>

              {/* Fachgebiete */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-[11px] font-medium" style={{ color: "#737373" }}>
                    Fachgebiete
                  </label>
                  <span className="text-[10px]" style={{ color: "#A3A3A3" }}>
                    {data.specializations.length}/5
                  </span>
                </div>
                <div className="flex flex-wrap" style={{ gap: 6 }}>
                  {FIGMA_SPECIALTY_OPTIONS.filter(
                    (s) =>
                      showAllSpecialties ||
                      FIGMA_PRIMARY_SPECIALTY_IDS.includes(s.id) ||
                      data.specializations.includes(s.id)
                  ).map((specialty) => {
                    const isSelected = data.specializations.includes(specialty.id);
                    const isDisabled = !isSelected && data.specializations.length >= MAX_FIGMA_SPECIALTY_SELECTIONS;
                    return (
                      <button
                        key={specialty.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => !isDisabled && toggleSpecialty(specialty.id)}
                        className="rounded-sm px-3 py-1.5 text-[11px] font-medium"
                        style={{
                          background: isSelected ? "#262626" : "#FFFFFF",
                          color: isSelected ? "#FFFFFF" : "#737373",
                          border: `1px solid ${isSelected ? "#262626" : "#E8E8E8"}`,
                          opacity: isDisabled ? 0.3 : 1,
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          transition: "all 120ms ease",
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
                    onClick={() => setShowAllSpecialties(true)}
                    className="mt-3 text-[11px] font-medium"
                    style={{ color: "#999999", transition: "all 120ms ease" }}
                  >
                    Weitere Fachgebiete anzeigen
                  </button>
                ) : null}

                {data.specializations.some((id) => !FIGMA_SPECIALTY_OPTIONS.some((o) => o.id === id)) ? (
                  <div
                    className="mt-4 rounded-sm border border-dashed px-3 py-2 text-[11px]"
                    style={{ borderColor: "#E8E8E8", color: "#737373" }}
                  >
                    Weitere gespeicherte Schwerpunkte:{" "}
                    {data.specializations
                      .filter((id) => !FIGMA_SPECIALTY_OPTIONS.some((o) => o.id === id))
                      .map((id) => figmaSpecialtyLabel(id))
                      .join(", ")}
                  </div>
                ) : null}
              </div>

              {/* Praxis */}
              <div>
                <label className="mb-3 block text-[11px] font-medium" style={{ color: "#737373" }}>
                  Praxis
                </label>
                <div className="flex flex-col" style={{ gap: 8 }}>
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
                  <div className="grid grid-cols-3 gap-2">
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
              </div>

              <div className="mt-10 flex justify-end border-t border-[#F0F0F0] pt-6">
                <AutoSaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} errorMessage={errorMessage} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Orientierungsansicht (nur Lesen; kein zweiter Editor) */}
        <div className="flex min-h-0 min-w-[min(100%,360px)] flex-1 flex-col overflow-y-auto bg-[#EEF2F8]">
          <div
            className="flex min-h-full w-full flex-1 items-center justify-center"
            role="region"
            aria-label="Orientierungsansicht der Praxisdarstellung im Patientenbereich"
          >
            <ProfileFigmaLivePreview data={mergedProfile} />
          </div>
        </div>
      </div>
    </div>
  );
}
