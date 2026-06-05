"use client";

/** Öffentliche Präsenz: Bühne (Vorschau) dominant, Kuratieren in schmaler Nebenspur. */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Check } from "lucide-react";

import { AutoSaveIndicator, type SaveStatus } from "./auto-save-indicator";
import { FigmaTextInput } from "./figma-form-fields";
import { ProfileBackgroundPicker } from "@/components/profile-editor/profile-background-picker";
import { ProfileCareerPathEditor } from "@/components/profile-editor/profile-career-path-editor";
import { ProfileCredentialsEditor } from "@/components/profile-editor/profile-credentials-editor";
import { ProfileEditorSection } from "@/components/profile-editor/profile-editor-section";
import { ProfilePersonalApproachEditor } from "@/components/profile-editor/profile-personal-approach-editor";
import { ProfileFigmaLivePreview } from "@/components/profile-editor/profile-figma-live-preview";
import { ProfileLogoUpload } from "@/components/profile-editor/profile-logo-upload";
import { ProfileServicesPicker } from "@/components/profile-editor/profile-services-picker";
import { ProfileSpecializationPicker } from "@/components/profile-editor/profile-specialization-picker";
import { resolveCarreeTheme } from "@/lib/profile/carree-theme";
import { specializationPickerLabel } from "@/lib/profile/specialization-picker-data";
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

type EditorSectionId =
  | "praxis"
  | "arzt"
  | "approach"
  | "career"
  | "fach"
  | "leistungen"
  | "certs";

function truncateSummary(text: string, max = 28): string {
  const t = text.trim();
  if (!t) return "";
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export function ProfileEditorShell({
  initialData,
  workspaceName = "Ihre Praxis",
}: ProfileEditorShellProps) {
  const [data, setData] = useState<ProfileEditorData>(initialData);
  const [working, setWorking] = useState<WorkingFormState>(() => parseWorkingStyleVita(initialData.vita_markdown));
  const [openSection, setOpenSection] = useState<EditorSectionId>("praxis");
  const [showStatementLibrary, setShowStatementLibrary] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const openEditorSection = useCallback((id: EditorSectionId) => {
    setOpenSection(id);
    setShowStatementLibrary(false);
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
        practice_subtitle: d.practice_subtitle || "",
        profile_credentials: (d.profile_credentials ?? []).filter((c) => c.trim()),
        profile_personal_approach: (d.profile_personal_approach ?? "").trim(),
        profile_career_path: (d.profile_career_path ?? []).filter((line) => line.trim()),
        profile_background_color: d.profile_background_color,
      });

      if (seq !== saveSeqRef.current) return;

      if (result.error) {
        setSaveStatus("error");
        setErrorMessage(result.error);
      } else {
        setSaveStatus("saved");
        setLastSavedAt(new Date());
      }
    } catch {
      if (seq !== saveSeqRef.current) return;
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

  const interactionLocked = saveStatus === "saving" || photoUploading;
  const themeInk = resolveCarreeTheme(data.profile_background_color).ink;

  const doctorName = [data.title, data.first_name, data.last_name].filter(Boolean).join(" ").trim();
  const careerFilled = (data.profile_career_path ?? []).filter((l) => l.trim()).length;
  const credFilled = (data.profile_credentials ?? []).filter((c) => c.trim()).length;
  const approachFilled = (data.profile_personal_approach ?? "").trim();

  const sectionSummaries = {
    praxis: truncateSummary(data.practice_name || workspaceName) || "Praxis",
    arzt: truncateSummary(doctorName) || "Arztprofil",
    approach: approachFilled ? truncateSummary(approachFilled) : "Optional",
    career:
      careerFilled > 0
        ? `${careerFilled} ${careerFilled === 1 ? "Station" : "Stationen"}`
        : "Optional",
    fach:
      data.specializations.length > 0
        ? data.specializations.length === 1
          ? truncateSummary(specializationPickerLabel(data.specializations[0]!))
          : `${data.specializations.length} Bereiche`
        : "Auswählen",
    leistungen:
      data.services_structured.length > 0
        ? `${data.services_structured.length} ${data.services_structured.length === 1 ? "Leistung" : "Leistungen"}`
        : "Auswählen",
    certs:
      credFilled > 0
        ? `${credFilled} ${credFilled === 1 ? "Eintrag" : "Einträge"}`
        : "Optional",
  };

  return (
    <div className="yd-profile-editor-shell relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-transparent pb-[max(0px,env(safe-area-inset-bottom))] md:h-full">
      <div className="yd-profile-editor-body relative flex min-h-0 min-w-0 flex-1 flex-col md:flex-row md:overflow-hidden">
        <div
          className="yd-profile-editor-preview order-1 flex min-h-0 min-w-0 flex-[1.35] flex-col items-start overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] md:order-1"
          role="region"
          aria-label="Öffentliche Profildarstellung"
        >
          <ProfileFigmaLivePreview
            data={mergedProfile}
            workspaceName={workspaceName}
            onPortraitEdit={() => fileRef.current?.click()}
            portraitEditPending={photoUploading}
          />
        </div>

        <div
          className="yd-profile-editor-curate order-2 flex min-h-0 w-full shrink-0 flex-col border-slate-300/20 bg-[#F4F3F0] max-md:border-t md:order-2 md:w-[min(100%,320px)] md:max-w-[360px] md:border-l md:border-t-0 xl:max-w-[380px]"
          aria-busy={saveStatus === "saving" || photoUploading}
        >
          <div className="yd-profile-editor-curate-scroll px-5 py-8 sm:px-6 sm:py-9">
            <header className="border-b border-slate-300/25 pb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                Öffentliche Präsenz
              </p>
              <p className="mt-2 text-[11px] leading-snug text-slate-500">
                Bereich für Bereich kuratieren — Änderungen werden automatisch übernommen.
              </p>
            </header>

            <div className="mt-6">
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
              {photoError ? (
                <p
                  className="mb-4 border-l-2 border-text-tertiary/60 pl-2 text-[12px] leading-relaxed text-text-secondary"
                  role="status"
                  aria-live="polite"
                >
                  {photoError}
                </p>
              ) : null}

              <div className="yd-pe-sections flex flex-col gap-2">
                <ProfileEditorSection
                  id="praxis"
                  title="Praxisprofil"
                  summary={sectionSummaries.praxis}
                  isOpen={openSection === "praxis"}
                  onToggle={() => openEditorSection("praxis")}
                >
                  <div className="flex flex-col gap-5">
                    <ProfileLogoUpload
                      logoUrl={data.logo_url}
                      onLogoChange={(url) => updateField("logo_url", url)}
                      disabled={interactionLocked}
                    />
                    <div>
                      <label
                        htmlFor="pe-practice-name"
                        className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400"
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
                    <div>
                      <label
                        htmlFor="pe-practice-subtitle"
                        className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400"
                      >
                        Untertitel
                      </label>
                      <FigmaTextInput
                        id="pe-practice-subtitle"
                        variant="quiet"
                        placeholder="z. B. Ihre Praxis in Köln"
                        maxLength={PROFILE_LIMITS.practice_subtitle}
                        value={data.practice_subtitle || ""}
                        onChange={(e) => updateField("practice_subtitle", e.target.value || null)}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="pe-practice-phone"
                          className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400"
                        >
                          Telefon
                        </label>
                        <FigmaTextInput
                          id="pe-practice-phone"
                          variant="quiet"
                          placeholder="z. B. 0221 - 123 45 67"
                          type="tel"
                          maxLength={PROFILE_LIMITS.practice_phone}
                          value={data.practice_phone || ""}
                          onChange={(e) => updateField("practice_phone", e.target.value || null)}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="pe-practice-email"
                          className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400"
                        >
                          E-Mail
                        </label>
                        <FigmaTextInput
                          id="pe-practice-email"
                          variant="quiet"
                          placeholder="z. B. info@praxis.de"
                          type="email"
                          maxLength={PROFILE_LIMITS.practice_email}
                          value={data.practice_email || ""}
                          onChange={(e) => updateField("practice_email", e.target.value || null)}
                        />
                      </div>
                    </div>
                    <ProfileBackgroundPicker
                      value={data.profile_background_color}
                      onChange={(hex) => updateField("profile_background_color", hex)}
                      disabled={interactionLocked}
                    />
                    <div>
                      <label
                        htmlFor="pe-practice-address"
                        className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400"
                      >
                        Anschrift
                      </label>
                      <div className="flex flex-col gap-3">
                        <FigmaTextInput
                          id="pe-practice-address"
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
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={interactionLocked}
                      onClick={() => void performSave()}
                      className="yd-profile-editor-save inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 text-[12px] font-semibold tracking-[0.02em] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation"
                      style={{ background: themeInk }}
                    >
                      <Check className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                      {saveStatus === "saving" ? "Wird gespeichert…" : "Speichern"}
                    </button>
                  </div>
                </ProfileEditorSection>

                <ProfileEditorSection
                  id="arzt"
                  title="Arztprofil"
                  summary={sectionSummaries.arzt}
                  isOpen={openSection === "arzt"}
                  onToggle={() => openEditorSection("arzt")}
                >
                  <div className="flex flex-col gap-5">
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
                      <FigmaTextInput
                        variant="quiet"
                        placeholder="Website"
                        maxLength={PROFILE_LIMITS.practice_website}
                        value={data.practice_website || ""}
                        onChange={(e) => updateField("practice_website", e.target.value || null)}
                      />
                      <FigmaTextInput
                        variant="quiet"
                        placeholder="Öffnungszeiten"
                        maxLength={PROFILE_LIMITS.practice_hours}
                        value={data.practice_hours || ""}
                        onChange={(e) => updateField("practice_hours", e.target.value || null)}
                      />
                    </div>

                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Vita / Arbeitsweise
                      </p>
                      <p className="mb-3 text-[11px] leading-snug text-slate-500">
                        Drei Sätze, die Patienten auf Ihrer Profilseite lesen.
                      </p>
                      <div className="flex flex-col gap-3">
                        {([0, 1, 2] as const).map((i) => (
                          <FigmaTextInput
                            key={i}
                            variant="quiet"
                            maxLength={400}
                            placeholder={
                              i === 0 ? "Erster Satz" : i === 1 ? "Zweiter Satz" : "Dritter Satz"
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
                          className="mt-3 inline-flex min-h-[40px] items-center text-[12px] font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-700 touch-manipulation disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Formulierungsvorschläge
                        </button>
                      ) : null}

                      {showStatementLibrary ? (
                        <div className="mt-4 border-t border-slate-200/80 pt-4">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                              {working.statementIds.length}/{MAX_WORKING_STYLE_SELECTIONS} ausgewählt
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowStatementLibrary(false)}
                              className="text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-800"
                            >
                              Schließen
                            </button>
                          </div>
                          <div className="flex max-h-[240px] flex-col gap-3 overflow-y-auto pr-1">
                            {getCategorizedStatements().map((category) => (
                              <div key={category.name}>
                                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                  {category.name}
                                </p>
                                <div className="flex flex-col gap-1">
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
                                        className="rounded-lg border px-3 py-2 text-left text-[12px] leading-relaxed transition-colors disabled:cursor-not-allowed"
                                        style={{
                                          background: isSelected
                                            ? "rgba(248,250,252,0.95)"
                                            : "rgba(255,255,255,0.65)",
                                          color: isSelected ? "#0f172a" : "#64748b",
                                          borderColor: isSelected
                                            ? "rgba(51,65,85,0.35)"
                                            : "rgba(226,232,240,0.9)",
                                          opacity: isDisabled ? 0.35 : 1,
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
                  </div>
                </ProfileEditorSection>

                <ProfileEditorSection
                  id="approach"
                  title="Persönliche Worte"
                  summary={sectionSummaries.approach}
                  isOpen={openSection === "approach"}
                  onToggle={() => openEditorSection("approach")}
                >
                  <ProfilePersonalApproachEditor
                    embedded
                    value={data.profile_personal_approach ?? ""}
                    onChange={(value) => updateField("profile_personal_approach", value || null)}
                    disabled={interactionLocked}
                  />
                </ProfileEditorSection>

                <ProfileEditorSection
                  id="career"
                  title="Ausbildung & Werdegang"
                  summary={sectionSummaries.career}
                  isOpen={openSection === "career"}
                  onToggle={() => openEditorSection("career")}
                >
                  <ProfileCareerPathEditor
                    embedded
                    items={data.profile_career_path ?? []}
                    onChange={(items) => updateField("profile_career_path", items)}
                    disabled={interactionLocked}
                  />
                </ProfileEditorSection>

                <ProfileEditorSection
                  id="fach"
                  title="Fachbereiche"
                  summary={sectionSummaries.fach}
                  isOpen={openSection === "fach"}
                  onToggle={() => openEditorSection("fach")}
                >
                  <ProfileSpecializationPicker
                    embedded
                    selected={data.specializations}
                    onChange={(ids) => updateField("specializations", ids)}
                    disabled={interactionLocked}
                  />
                </ProfileEditorSection>

                <ProfileEditorSection
                  id="leistungen"
                  title="Leistungen"
                  summary={sectionSummaries.leistungen}
                  isOpen={openSection === "leistungen"}
                  onToggle={() => openEditorSection("leistungen")}
                >
                  <ProfileServicesPicker
                    embedded
                    services={data.services_structured}
                    onChange={(services) => updateField("services_structured", services)}
                    disabled={interactionLocked}
                  />
                </ProfileEditorSection>

                <ProfileEditorSection
                  id="certs"
                  title="Fortbildungen & Zertifikate"
                  summary={sectionSummaries.certs}
                  isOpen={openSection === "certs"}
                  onToggle={() => openEditorSection("certs")}
                >
                  <ProfileCredentialsEditor
                    embedded
                    credentials={data.profile_credentials ?? []}
                    onChange={(items) => updateField("profile_credentials", items)}
                    disabled={interactionLocked}
                  />
                </ProfileEditorSection>
              </div>

              <div className="mt-6 flex min-h-[2.5rem] flex-col justify-end border-t border-slate-300/25 pt-4">
                <AutoSaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} errorMessage={errorMessage} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
