"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Sparkles } from "lucide-react";

import { createCareAnswerDraftFromForm } from "@/app/(protected)/journal/actions";
import { MedicalFormShell } from "@/components/forms/medical-form-shell";
import {
  MedicalFormFieldStack,
  MedicalFormFooterActions,
  MedicalFormLabel,
  MedicalFormSection,
  MedicalFormSelect,
  MedicalFormTextarea,
} from "@/components/forms/medical-form-ui";
import { CLINICAL_AREAS, type ClinicalAreaId } from "@/lib/journal/clinical-areas";
import { JOURNAL_HUB } from "@/lib/journal/journal-hub-product";
import { cn } from "@/lib/utils";

const CONTENT_TYPE_OPTIONS = [
  { id: "faq" as const, label: "FAQ — häufige Frage" },
  { id: "nachsorge" as const, label: "Nachsorge" },
];

const CLINICAL_OPTIONS: { id: ClinicalAreaId | ""; label: string }[] = [
  { id: "", label: "Automatisch / allgemein" },
  ...CLINICAL_AREAS.map((a) => ({ id: a.id, label: a.label })),
];

type CareCenterNewAnswerModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CareCenterNewAnswerModal({ open, onClose }: CareCenterNewAnswerModalProps) {
  const router = useRouter();
  const formId = useId();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [notes, setNotes] = useState("");
  const [contentType, setContentType] = useState<"faq" | "nachsorge">("faq");
  const [clinicalArea, setClinicalArea] = useState<ClinicalAreaId | "">("");

  if (!open) return null;

  const busy = isPending;
  const questionTrim = question.trim();

  const close = () => {
    if (busy) return;
    setError(null);
    onClose();
  };

  const handleSubmit = () => {
    if (!questionTrim) {
      setError("Bitte formulieren Sie die Patientenfrage oder das Thema.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await createCareAnswerDraftFromForm({
        question: questionTrim,
        notes: notes.trim() || undefined,
        clinicalArea: clinicalArea || null,
        contentType,
      });

      if (result.error || !result.id) {
        setError(result.error || "Entwurf konnte nicht erstellt werden.");
        return;
      }

      onClose();
      router.push(`/journal/${result.id}/edit`);
      router.refresh();
    });
  };

  return (
    <MedicalFormShell
      title="Neue Antwort"
      subtitle={JOURNAL_HUB.modalLead}
      onClose={close}
      closeDisabled={busy}
      headerVariant="compact"
      overlayVariant="workspace"
      ariaLabel="Neue Patientenantwort erstellen"
      panelClassName={cn(
        "yd-medical-form-panel--workspace-compact",
        "yd-medical-form-panel--task-modal",
        "yd-medical-form-panel--care-answer"
      )}
      footer={
        <MedicalFormFooterActions
          onCancel={close}
          cancelDisabled={busy}
          primaryLabel="Entwurf erstellen"
          primaryPendingLabel="KI bereitet Entwurf vor…"
          onPrimary={handleSubmit}
          primaryDisabled={!questionTrim}
          isPending={busy}
        />
      }
    >
      <div className="yd-medical-form yd-medical-form--modal yd-cc-new-answer-form">
        {error ? (
          <p className="yd-medical-form-alert" role="alert">
            {error}
          </p>
        ) : null}

        <fieldset
          disabled={busy}
          aria-busy={busy}
          className="m-0 min-w-0 border-0 p-0 disabled:pointer-events-none disabled:opacity-[0.58]"
        >
          <MedicalFormSection title="Patientenfrage">
            <MedicalFormFieldStack>
              <div>
                <MedicalFormLabel htmlFor={`${formId}-question`}>
                  Frage oder Thema
                </MedicalFormLabel>
                <input
                  id={`${formId}-question`}
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={200}
                  autoComplete="off"
                  placeholder="z. B. Wie lange dauert die Schwellung nach einer OP?"
                  className="yd-auth-input"
                />
              </div>
              <div>
                <MedicalFormLabel htmlFor={`${formId}-notes`} optional>
                  Was soll in der Antwort stehen?
                </MedicalFormLabel>
                <MedicalFormTextarea
                  id={`${formId}-notes`}
                  value={notes}
                  onChange={setNotes}
                  rows={3}
                  placeholder="Stichpunkte, Hinweise fürs Team oder für die KI …"
                />
              </div>
            </MedicalFormFieldStack>
          </MedicalFormSection>

          <MedicalFormSection title="Einordnung">
            <MedicalFormFieldStack>
              <div>
                <MedicalFormLabel htmlFor={`${formId}-type`}>Art der Antwort</MedicalFormLabel>
                <MedicalFormSelect
                  id={`${formId}-type`}
                  aria-label="Art der Antwort"
                  options={CONTENT_TYPE_OPTIONS}
                  value={contentType}
                  onChange={setContentType}
                  disabled={busy}
                />
              </div>
              <div>
                <MedicalFormLabel htmlFor={`${formId}-area`} optional>
                  Themenbereich
                </MedicalFormLabel>
                <MedicalFormSelect
                  id={`${formId}-area`}
                  aria-label="Themenbereich"
                  options={CLINICAL_OPTIONS}
                  value={clinicalArea}
                  onChange={(v) => setClinicalArea(v)}
                  disabled={busy}
                />
              </div>
            </MedicalFormFieldStack>
          </MedicalFormSection>

          <p className="yd-cc-new-answer-form__ki-hint">
            <Sparkles className="yd-cc-new-answer-form__ki-icon" strokeWidth={1.5} aria-hidden />
            Die KI erstellt einen ersten Entwurf im Hintergrund — Sie prüfen und veröffentlichen
            selbst. Keine automatische Freigabe.
          </p>
        </fieldset>
      </div>
    </MedicalFormShell>
  );
}
