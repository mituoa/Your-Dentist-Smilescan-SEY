"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SectionHero } from "./section-hero";
import { SectionVita } from "./section-vita";
import { SectionSpecializations } from "./section-specializations";
import { SectionServices } from "./section-services";
import { SectionPractice } from "./section-practice";
import { SectionPhoto } from "./section-photo";
import { AutoSaveIndicator, type SaveStatus } from "./auto-save-indicator";
import { EditorialProfile } from "@/components/profile-preview/editorial-profile";
import { saveProfileData } from "@/app/(protected)/profile/editor/actions";
import type { ProfileEditorData } from "@/lib/types/profile-editor-data";

interface ProfileEditorShellProps {
  initialData: ProfileEditorData;
  workspaceName: string;
  slug: string;
}

export function ProfileEditorShell({
  initialData,
  workspaceName,
  slug,
}: ProfileEditorShellProps) {
  const [data, setData] = useState<ProfileEditorData>(initialData);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDataRef = useRef(data);
  latestDataRef.current = data;

  const skipInitialSave = useRef(true);

  const updateField = useCallback(
    <K extends keyof ProfileEditorData>(field: K, value: ProfileEditorData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

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
  }, [data]);

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="sticky top-0 z-20 bg-surface-page/95 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-light">Profil bearbeiten</h1>
            <p className="text-xs text-text-tertiary">
              Änderungen werden automatisch gespeichert.
            </p>
          </div>
          <AutoSaveIndicator
            status={saveStatus}
            lastSavedAt={lastSavedAt}
            errorMessage={errorMessage}
          />
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[55%_45%] gap-0">
          <div className="px-6 py-12 space-y-24 max-w-[700px]">
            <SectionHero
              firstName={data.first_name || ""}
              lastName={data.last_name || ""}
              title={data.title || ""}
              foundingYear={data.founding_year}
              onUpdate={(field, value) =>
                updateField(field as keyof ProfileEditorData, value as never)
              }
            />
            <SectionVita
              vita={data.vita_markdown || ""}
              onUpdate={(v) => updateField("vita_markdown", v)}
            />
            <SectionSpecializations
              selected={data.specializations}
              onUpdate={(ids) => updateField("specializations", ids)}
            />
            <SectionServices
              services={data.services_structured}
              onUpdate={(s) => updateField("services_structured", s)}
            />
            <SectionPractice
              practice_name={data.practice_name || ""}
              practice_address={data.practice_address || ""}
              practice_employment_status={data.practice_employment_status || ""}
              practice_phone={data.practice_phone || ""}
              practice_email={data.practice_email || ""}
              practice_website={data.practice_website || ""}
              practice_hours={data.practice_hours || ""}
              onUpdate={updatePracticeField}
            />
            <SectionPhoto
              photoUrl={data.photo_url}
              onPhotoChange={(url) => updateField("photo_url", url)}
            />
          </div>

          <div className="hidden xl:block border-l border-border bg-cream sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
            <div className="text-[10px] uppercase tracking-wider text-text-tertiary text-center py-3 border-b border-border bg-paper">
              Live-Vorschau
            </div>
            <div
              style={{
                transform: "scale(0.78)",
                transformOrigin: "top left",
                width: "128.2%",
              }}
            >
              <EditorialProfile
                data={data}
                workspaceName={workspaceName}
                slug={slug}
                previewMode
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
