"use client";

import { useCallback, useEffect, useId, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import {
  approveMessageDraftForSubmission,
  prepareMessageDraftForSubmission,
  saveMessageDraftBody,
} from "@/app/(protected)/inbox/[id]/message-draft-actions";
import { AppointmentLinkButton } from "@/components/inbox/appointment-link-button";
import { MedicalFormSegmented } from "@/components/forms/medical-form-ui";
import {
  buildPhotoRequestDraft,
  buildPhotoRequestRationale,
  buildRuckfrageDraftForSnippet,
  buildTaskSuggestionFromCase,
  buildTerminOfferDraft,
  FOLLOW_UP_SNIPPETS,
  PHOTO_VIEW_SNIPPETS,
  type RuckfrageTopicId,
  type UrgencyKey,
} from "@/lib/clinical/message-templates";
import { stashCommandDraftForSubmission } from "@/lib/command-ai/draft-bridge";
import {
  photoActionLabel,
  type TrackerActionIntent,
} from "@/lib/inbox/tracker-clinical-decision";
import { CLINICAL_URGENCY_OPTIONS } from "@/lib/inbox/tracker-v9-clinical";
import { cn } from "@/lib/utils";

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
  prioritizedRuckfrageTopics?: string[];
  suggestedPhotoViewId?: string | null;
};

type FlowStep = "choose" | "review" | "preview";

const TERMIN_OPTIONS: { id: Exclude<UrgencyKey, null>; label: string }[] =
  CLINICAL_URGENCY_OPTIONS.map((o) => ({
    id: o.id,
    label: o.id === "not_urgent" ? "Routine" : o.label,
  }));

function toUrgencyKey(urgency: string | null): UrgencyKey {
  if (
    urgency === "today" ||
    urgency === "within_24h" ||
    urgency === "this_week" ||
    urgency === "not_urgent"
  ) {
    return urgency;
  }
  return null;
}

function DraftPreview({ body }: { body: string }) {
  return (
    <div className="yd-tracker-v8-action-preview" aria-label="Vorschau der Nachricht">
      <p className="yd-tracker-v8-action-sheet__label">Vorschau</p>
      <div className="yd-tracker-v8-action-preview__body">{body.trim() || "—"}</div>
    </div>
  );
}

export function TrackerClinicalActionSheet(props: TrackerClinicalActionSheetProps) {
  const {
    open,
    intent,
    onClose,
    submissionId,
    patientName,
    patientEmail,
    urgency,
    practicePhone,
    appointmentUrl,
    photoCount,
    isDoctor,
    canSendAppointmentLink,
    draftsAvailable,
    editableDraftId,
    initialDraftBody,
    prioritizedRuckfrageTopics = [],
    suggestedPhotoViewId,
  } = props;

  const router = useRouter();
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [body, setBody] = useState("");
  const [flowStep, setFlowStep] = useState<FlowStep>("choose");
  const [ruckfrageTopic, setRuckfrageTopic] = useState<RuckfrageTopicId | null>(null);
  const [photoViewId, setPhotoViewId] = useState<string | null>(null);
  const [terminUrgency, setTerminUrgency] = useState<Exclude<UrgencyKey, null>>("this_week");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const urgencyKey = toUrgencyKey(urgency);
  const draftBase = {
    patientName,
    urgency: urgencyKey,
    practicePhone: practicePhone || "",
    appointmentUrl,
  };

  const orderedRuckfrageTopics = useMemo(() => {
    const byId = new Map(FOLLOW_UP_SNIPPETS.map((s) => [s.id, s]));
    const out: typeof FOLLOW_UP_SNIPPETS = [];
    for (const id of prioritizedRuckfrageTopics) {
      const row = byId.get(id);
      if (row) out.push(row);
    }
    for (const s of FOLLOW_UP_SNIPPETS) {
      if (!out.some((o) => o.id === s.id)) out.push(s);
    }
    return out;
  }, [prioritizedRuckfrageTopics]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !intent) return;
    setError(null);
    setStatus(null);
    setBody("");
    setFlowStep(intent === "freigabe" ? "review" : "choose");
    setRuckfrageTopic(null);
    setPhotoViewId(suggestedPhotoViewId ?? null);
    setTerminUrgency(urgencyKey ?? "this_week");
    if (intent === "freigabe" && initialDraftBody?.trim()) {
      setBody(initialDraftBody.trim());
    }
  }, [open, intent, initialDraftBody, suggestedPhotoViewId, urgencyKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isPending, onClose]);

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [open]);

  const scrollToCommunication = useCallback(() => {
    document.getElementById("tracker-kommunikation")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const ensureDraftAndSave = useCallback(async (): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (!draftsAvailable) {
      return { ok: false, error: "Antwortentwürfe sind aktuell nicht verfügbar." };
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

  const handleApply = () => {
    if (isPending || !body.trim()) return;
    setError(null);
    setStatus(null);
    startTransition(async () => {
      const res = await ensureDraftAndSave();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setStatus("Nachricht übernommen — Freigabe erfolgt in der Kommunikation.");
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

  const buildDraftForChoice = (): string => {
    if (intent === "rueckfrage" && ruckfrageTopic) {
      return buildRuckfrageDraftForSnippet(ruckfrageTopic, draftBase);
    }
    if (intent === "foto" && photoViewId) {
      return buildPhotoRequestDraft({
        patientName,
        practicePhone: practicePhone || "",
        photoCount,
        viewId: photoViewId,
      });
    }
    if (intent === "termin" && terminUrgency) {
      return buildTerminOfferDraft({ ...draftBase, urgency: terminUrgency });
    }
    return body;
  };

  const advanceFromChoose = () => {
    const draft = buildDraftForChoice();
    setBody(draft);
    setFlowStep("review");
  };

  const onPrimary = () => {
    if (flowStep === "choose") {
      advanceFromChoose();
      return;
    }
    if (flowStep === "review") {
      setFlowStep("preview");
      return;
    }
    if (intent === "freigabe" && isDoctor) {
      handleApprove();
      return;
    }
    handleApply();
  };

  const canAdvanceChoose =
    intent === "freigabe" ||
    (intent === "rueckfrage" && ruckfrageTopic) ||
    (intent === "foto" && photoViewId) ||
    (intent === "termin" && terminUrgency);

  const primaryLabel =
    flowStep === "choose"
      ? "Weiter"
      : flowStep === "review"
        ? "Nachricht prüfen"
        : intent === "freigabe" && isDoctor
          ? "Antwort freigeben"
          : "Nachricht übernehmen";

  if (!open || !intent || !mounted) return null;

  const title =
    intent === "rueckfrage"
      ? "Rückfrage an Patient"
      : intent === "termin"
        ? "Termin anbieten"
        : intent === "foto"
          ? photoActionLabel(photoCount)
          : isDoctor
            ? "Antwort senden"
            : "Antwort vorbereiten";

  const lead =
    intent === "rueckfrage" && flowStep === "choose"
      ? "Was möchten Sie klären?"
      : intent === "foto" && flowStep === "choose"
        ? "Welche Aufnahme fehlt?"
        : intent === "termin" && flowStep === "choose"
          ? "Welche Dringlichkeit gilt für den Terminvorschlag?"
          : intent === "foto"
            ? buildPhotoRequestRationale(photoCount)
            : intent === "termin"
              ? terminUrgency === "today"
                ? "Wir empfehlen eine Untersuchung noch heute."
                : terminUrgency === "within_24h"
                  ? "Wir empfehlen eine Untersuchung innerhalb der nächsten 24 Stunden."
                  : terminUrgency === "this_week"
                    ? "Wir empfehlen eine Untersuchung in dieser Woche."
                    : "Routine-Termin nach Praxiskapazität."
              : "Patientenantwort prüfen und freigeben.";

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
        className="yd-tracker-v8-action-sheet yd-tracker-v9-action-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="yd-tracker-v8-action-sheet__scroll">
          <header className="yd-tracker-v8-action-sheet__head">
            <div>
              <h2 id={titleId} className="yd-tracker-v8-action-sheet__title">
                {title}
              </h2>
              <p className="yd-tracker-v8-action-sheet__lead">{lead}</p>
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
            {intent === "rueckfrage" && flowStep === "choose" ? (
              <div className="yd-tracker-v8-action-flow-block">
                <div className="yd-tracker-v8-action-topic-grid">
                  {orderedRuckfrageTopics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      className={cn(
                        "yd-tracker-v8-action-topic-btn",
                        ruckfrageTopic === topic.id && "yd-tracker-v8-action-topic-btn--active"
                      )}
                      onClick={() => setRuckfrageTopic(topic.id as RuckfrageTopicId)}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {intent === "foto" && flowStep === "choose" ? (
              <div className="yd-tracker-v8-action-flow-block">
                <div className="yd-tracker-v8-action-topic-grid">
                  {PHOTO_VIEW_SNIPPETS.map((view) => (
                    <button
                      key={view.id}
                      type="button"
                      className={cn(
                        "yd-tracker-v8-action-topic-btn",
                        photoViewId === view.id && "yd-tracker-v8-action-topic-btn--active"
                      )}
                      onClick={() => setPhotoViewId(view.id)}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {intent === "termin" && flowStep === "choose" ? (
              <div className="yd-tracker-v8-action-flow-block">
                <MedicalFormSegmented
                  name="termin_urgency"
                  aria-label="Termin-Dringlichkeit"
                  options={TERMIN_OPTIONS}
                  value={terminUrgency}
                  onChange={(v) => v && setTerminUrgency(v)}
                  disabled={isPending}
                />
              </div>
            ) : null}

            {flowStep !== "choose" ? (
              <div className="yd-tracker-v8-action-flow-block">
                <label htmlFor={`${titleId}-body`} className="yd-tracker-v8-action-sheet__label">
                  {intent === "freigabe" ? "Antwortentwurf" : "KI-Vorschlag (bearbeitbar)"}
                </label>
                <textarea
                  id={`${titleId}-body`}
                  value={body}
                  onChange={(e) => {
                    setBody(e.target.value);
                    if (flowStep === "preview") setFlowStep("review");
                  }}
                  rows={intent === "freigabe" ? 9 : 7}
                  className="yd-tracker-v8-action-sheet__textarea"
                  spellCheck={false}
                />
              </div>
            ) : null}

            {flowStep === "preview" ? <DraftPreview body={body} /> : null}

            {intent === "termin" && flowStep === "preview" ? (
              <div className="yd-tracker-v8-action-sheet__termin">
                <p className="yd-tracker-v8-action-sheet__label">Terminlink per E-Mail</p>
                {canSendAppointmentLink && isDoctor ? (
                  <AppointmentLinkButton
                    submissionId={submissionId}
                    hasPatientEmail={Boolean(patientEmail?.trim())}
                    canSend
                  />
                ) : (
                  <p className="yd-tracker-v8-action-sheet__hint">
                    {canSendAppointmentLink
                      ? "Nur Zahnärzt:innen können den Terminlink direkt versenden. Der Nachrichtentext kann von allen Rollen vorbereitet werden."
                      : "Terminlink-Versand ist für Ihre Rolle nicht freigeschaltet. Der Nachrichtentext kann in der Kommunikation vorbereitet werden."}
                  </p>
                )}
              </div>
            ) : null}

            <p className="yd-tracker-v8-action-sheet__hint">
              {intent === "freigabe" && !isDoctor
                ? "Entwurf wird in die Kommunikation übernommen — die Freigabe erfolgt durch Zahnärzt:innen."
                : "Kein automatischer Versand — Nachricht wird in die Kommunikation übernommen zur Prüfung und Freigabe."}
            </p>
          </fieldset>
        </div>

        <footer className="yd-tracker-v8-action-sheet__footer">
          <button
            type="button"
            className="yd-auth-btn-secondary yd-tracker-v8-action-sheet__btn"
            disabled={isPending}
            onClick={() => {
              if (flowStep === "preview") {
                setFlowStep("review");
                return;
              }
              if (flowStep === "review" && intent !== "freigabe") {
                setFlowStep("choose");
                return;
              }
              onClose();
            }}
          >
            {flowStep === "choose" ? "Abbrechen" : "Zurück"}
          </button>
          <button
            type="button"
            className="yd-auth-btn-primary yd-tracker-v8-action-sheet__btn"
            disabled={
              isPending ||
              (flowStep === "choose" && !canAdvanceChoose) ||
              (flowStep !== "choose" && !body.trim())
            }
            onClick={onPrimary}
          >
            {isPending ? "Wird übernommen…" : primaryLabel}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}

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
