"use client";

import { useCallback, useEffect, useId, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import {
  approveMessageDraftForSubmission,
  prepareMessageDraftForSubmission,
  saveMessageDraftBody,
} from "@/app/(protected)/inbox/[id]/message-draft-actions";
import { AppointmentLinkButton } from "@/components/inbox/appointment-link-button";
import {
  buildAssistQuickDraft,
  buildFollowUpDraft,
  buildPhotoRequestDraft,
  buildRuckfrageDraftForSnippet,
  buildTaskSuggestionFromCase,
  type UrgencyKey,
} from "@/lib/clinical/message-templates";
import { stashCommandDraftForSubmission } from "@/lib/command-ai/draft-bridge";
import type { TrackerActionIntent } from "@/lib/inbox/tracker-clinical-decision";

export type TrackerClinicalActionSheetProps = {
  open: boolean;
  intent: TrackerActionIntent | null;
  onClose: () => void;
  submissionId: string;
  patientName: string;
  patientEmail: string | null;
  patientNotes: string | null;
  urgency: string | null;
  practicePhone: string | null;
  appointmentUrl: string | null;
  photoCount: number;
  primaryAction: string;
  isDoctor: boolean;
  canSendAppointmentLink: boolean;
  draftsAvailable: boolean;
  editableDraftId: string | null;
  initialDraftBody: string | null;
};

const INTENT_COPY: Record<
  TrackerActionIntent,
  { title: string; lead: string; primaryCta: string }
> = {
  rueckfrage: {
    title: "Rückfrage an Patient",
    lead: "KI-Vorschlag — bitte prüfen und anpassen, bevor Sie den Entwurf übernehmen.",
    primaryCta: "In Kommunikation übernehmen",
  },
  termin: {
    title: "Termin anbieten",
    lead: "Empfehlungstext und optional Terminlink per E-Mail.",
    primaryCta: "In Kommunikation übernehmen",
  },
  foto: {
    title: "Fotoanforderung",
    lead: "Formulierung passend zum aktuellen Bildbestand — bearbeitbar.",
    primaryCta: "In Kommunikation übernehmen",
  },
  freigabe: {
    title: "Antwort freigeben",
    lead: "Patientenantwort prüfen und freigeben.",
    primaryCta: "Freigeben",
  },
};

function toUrgencyKey(urgency: string | null): UrgencyKey {
  if (urgency === "today" || urgency === "this_week" || urgency === "not_urgent") {
    return urgency;
  }
  return null;
}

function buildInitialBody(
  intent: TrackerActionIntent,
  params: {
    patientName: string;
    urgency: UrgencyKey;
    practicePhone: string;
    appointmentUrl: string | null;
    photoCount: number;
    existingBody: string | null;
  }
): string {
  if (intent === "freigabe" && params.existingBody?.trim()) {
    return params.existingBody.trim();
  }
  const base = {
    patientName: params.patientName,
    urgency: params.urgency,
    practicePhone: params.practicePhone,
    appointmentUrl: params.appointmentUrl,
  };
  if (intent === "rueckfrage") {
    return buildRuckfrageDraftForSnippet("pain", base);
  }
  if (intent === "termin") {
    return buildAssistQuickDraft("appointment_link_text", base);
  }
  if (intent === "foto") {
    return buildPhotoRequestDraft({
      patientName: params.patientName,
      practicePhone: params.practicePhone,
      photoCount: params.photoCount,
    });
  }
  return buildFollowUpDraft(base);
}

export function TrackerClinicalActionSheet(props: TrackerClinicalActionSheetProps) {
  const {
    open,
    intent,
    onClose,
    submissionId,
    patientName,
    patientEmail,
    patientNotes,
    urgency,
    practicePhone,
    appointmentUrl,
    photoCount,
    primaryAction,
    isDoctor,
    canSendAppointmentLink,
    draftsAvailable,
    editableDraftId,
    initialDraftBody,
  } = props;

  const router = useRouter();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const urgencyKey = toUrgencyKey(urgency);
  const draftParams = {
    patientName,
    urgency: urgencyKey,
    practicePhone: practicePhone || "",
    appointmentUrl,
    photoCount,
    existingBody: initialDraftBody,
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !intent) return;
    setError(null);
    setStatus(null);
    setBody(buildInitialBody(intent, draftParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intent/open only
  }, [open, intent]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isPending, onClose]);

  const scrollToCommunication = useCallback(() => {
    document.getElementById("tracker-kommunikation")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const ensureDraftAndSave = useCallback(async (): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (!draftsAvailable) {
      return {
        ok: false,
        error: "Antwortentwürfe sind aktuell nicht verfügbar.",
      };
    }

    stashCommandDraftForSubmission({
      submissionId,
      body,
      savedAt: new Date().toISOString(),
    });

    if (editableDraftId) {
      const save = await saveMessageDraftBody({
        draftId: editableDraftId,
        submissionId,
        body,
      });
      if (!save.ok) return { ok: false, error: save.error };
      return { ok: true };
    }

    const prep = await prepareMessageDraftForSubmission(submissionId);
    if (!prep.ok) return { ok: false, error: prep.error };
    return { ok: true };
  }, [body, draftsAvailable, editableDraftId, submissionId]);

  const handleApplyToCommunication = () => {
    if (isPending) return;
    setError(null);
    setStatus(null);
    startTransition(async () => {
      const res = await ensureDraftAndSave();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setStatus("Entwurf übernommen — Sie können ihn in der Kommunikation prüfen.");
      router.refresh();
      onClose();
      window.setTimeout(scrollToCommunication, 120);
    });
  };

  const handleApprove = () => {
    if (!isDoctor) {
      setError("Nur Zahnärzt:innen können Antworten freigeben.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const ensured = await ensureDraftAndSave();
      if (!ensured.ok) {
        setError(ensured.error);
        return;
      }
      router.refresh();
      if (!editableDraftId) {
        setStatus("Entwurf vorbereitet — bitte in der Kommunikation freigeben.");
        onClose();
        window.setTimeout(scrollToCommunication, 120);
        return;
      }
      const res = await approveMessageDraftForSubmission({
        draftId: editableDraftId,
        submissionId,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setStatus("Antwort freigegeben.");
      router.refresh();
      onClose();
      window.setTimeout(scrollToCommunication, 120);
    });
  };

  if (!open || !intent || !mounted) return null;

  const copy = INTENT_COPY[intent];

  return createPortal(
    <div
      className="yd-tracker-v8-action-backdrop"
      role="presentation"
      onClick={() => !isPending && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="yd-tracker-v8-action-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="yd-tracker-v8-action-sheet__head">
          <div>
            <h2 id={titleId} className="yd-tracker-v8-action-sheet__title">
              {copy.title}
            </h2>
            <p className="yd-tracker-v8-action-sheet__lead">{copy.lead}</p>
          </div>
          <button
            type="button"
            className="yd-tracker-v8-action-sheet__close"
            onClick={onClose}
            disabled={isPending}
            aria-label="Schließen"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        {error ? (
          <p className="yd-medical-form-alert" role="alert">
            {error}
          </p>
        ) : null}
        {status ? (
          <p className="yd-tracker-v8-action-sheet__status" role="status">
            {status}
          </p>
        ) : null}

        <fieldset
          disabled={isPending}
          aria-busy={isPending}
          className="m-0 min-w-0 border-0 p-0 disabled:opacity-[0.58]"
        >
          <label htmlFor={`${titleId}-body`} className="yd-tracker-v8-action-sheet__label">
            Nachrichtentext
          </label>
          <textarea
            id={`${titleId}-body`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={9}
            className="yd-tracker-v8-action-sheet__textarea"
            spellCheck={false}
          />
          <p className="yd-tracker-v8-action-sheet__hint">
            Kein automatischer Versand — Sie prüfen und geben frei.
          </p>

          {intent === "termin" && canSendAppointmentLink ? (
            <div className="yd-tracker-v8-action-sheet__termin">
              <p className="yd-tracker-v8-action-sheet__label">Terminlink per E-Mail</p>
              <AppointmentLinkButton
                submissionId={submissionId}
                hasPatientEmail={Boolean(patientEmail?.trim())}
                canSend={isDoctor}
              />
            </div>
          ) : null}
        </fieldset>

        <footer className="yd-tracker-v8-action-sheet__footer">
          <button
            type="button"
            className="yd-auth-btn-secondary"
            disabled={isPending}
            onClick={onClose}
          >
            Abbrechen
          </button>
          {intent === "freigabe" ? (
            <button
              type="button"
              className="yd-auth-btn-primary"
              disabled={isPending || !editableDraftId}
              onClick={handleApprove}
            >
              {isPending ? "Wird freigegeben…" : copy.primaryCta}
            </button>
          ) : (
            <button
              type="button"
              className="yd-auth-btn-primary"
              disabled={isPending || !body.trim()}
              onClick={handleApplyToCommunication}
            >
              {isPending ? "Wird übernommen…" : copy.primaryCta}
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
}

/** Navigiert zum Aufgabenflow mit KI-Vorschlag (kein Sheet). */
export function openTrackerTaskFlow(props: {
  router: ReturnType<typeof useRouter>;
  submissionId: string;
  patientName: string;
  patientNotes: string | null;
  primaryAction: string;
  onClose?: () => void;
}) {
  const suggestion = buildTaskSuggestionFromCase({
    patientName: props.patientName,
    patientNotes: props.patientNotes,
    primaryAction: props.primaryAction,
  });
  const params = new URLSearchParams({
    from: "inbox",
    submission_id: props.submissionId,
    title: suggestion.title,
    description: suggestion.description,
  });
  props.onClose?.();
  props.router.push(`/my-tasks/new?${params.toString()}`);
}
