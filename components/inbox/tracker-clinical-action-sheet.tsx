"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
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
  ASSIST_PHOTO_OPTIONS,
  buildFollowUpDraft,
  buildPhotoRequestDraft,
  buildRuckfrageDraftForSnippet,
  buildTaskSuggestionFromCase,
  buildTerminOfferDraft,
  CLINICAL_RUCKFRAGE_TOPICS,
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
  onOutcome?: (outcome: { type: "success" | "error"; message: string }) => void;
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

type FlowStep = "choose" | "draft";

const ASSIST_GENERATING_MS = 400;

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

function AssistReadyBanner() {
  return (
    <div className="yd-tracker-v13-assist-ready" role="status">
      <p className="yd-tracker-v13-assist-ready__title">KI-Entwurf bereit</p>
      <p className="yd-tracker-v13-assist-ready__hint">
        Bitte prüfen und bei Bedarf anpassen — kein automatischer Versand.
      </p>
    </div>
  );
}

function AssistLoading({ label }: { label: string }) {
  return (
    <div className="yd-tracker-v13-assist-loading" role="status" aria-live="polite" aria-busy="true">
      <span className="yd-tracker-v13-assist-loading__spinner" aria-hidden />
      <p>{label}</p>
    </div>
  );
}

export function TrackerClinicalActionSheet(props: TrackerClinicalActionSheetProps) {
  const {
    open,
    intent,
    onClose,
    onOutcome,
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
  const generateTimerRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [body, setBody] = useState("");
  const [flowStep, setFlowStep] = useState<FlowStep>("choose");
  const [ruckfrageTopic, setRuckfrageTopic] = useState<RuckfrageTopicId | null>(null);
  const [photoViewId, setPhotoViewId] = useState<string | null>(null);
  const [terminUrgency, setTerminUrgency] = useState<Exclude<UrgencyKey, null>>("this_week");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftFailed, setDraftFailed] = useState(false);
  const [isPending, startTransition] = useTransition();

  const urgencyKey = toUrgencyKey(urgency);
  const draftBase = useMemo(
    () => ({
      patientName,
      urgency: urgencyKey,
      practicePhone: practicePhone || "",
      appointmentUrl,
    }),
    [patientName, urgencyKey, practicePhone, appointmentUrl]
  );

  const orderedRuckfrageTopics = useMemo(() => {
    const byId = new Map(CLINICAL_RUCKFRAGE_TOPICS.map((s) => [s.id, s]));
    const out: typeof CLINICAL_RUCKFRAGE_TOPICS = [];
    for (const id of prioritizedRuckfrageTopics) {
      const row = byId.get(id as RuckfrageTopicId);
      if (row) out.push(row);
    }
    for (const s of CLINICAL_RUCKFRAGE_TOPICS) {
      if (!out.some((o) => o.id === s.id)) out.push(s);
    }
    return out;
  }, [prioritizedRuckfrageTopics]);

  const orderedPhotoOptions = useMemo(() => {
    const byId = new Map(ASSIST_PHOTO_OPTIONS.map((o) => [o.id, o]));
    const out: typeof ASSIST_PHOTO_OPTIONS = [];
    if (suggestedPhotoViewId && byId.has(suggestedPhotoViewId)) {
      out.push(byId.get(suggestedPhotoViewId)!);
    }
    for (const o of ASSIST_PHOTO_OPTIONS) {
      if (!out.some((x) => x.id === o.id)) out.push(o);
    }
    return out;
  }, [suggestedPhotoViewId]);

  const clearGenerateTimer = useCallback(() => {
    if (generateTimerRef.current) {
      window.clearTimeout(generateTimerRef.current);
      generateTimerRef.current = null;
    }
  }, []);

  const buildDraftText = useCallback(
    (overrides?: {
      ruckfrage?: RuckfrageTopicId;
      photo?: string;
      termin?: Exclude<UrgencyKey, null>;
      freigabeFallback?: boolean;
    }): string => {
      try {
        if (intent === "rueckfrage") {
          const topic = overrides?.ruckfrage ?? ruckfrageTopic;
          if (!topic) return "";
          return buildRuckfrageDraftForSnippet(topic, draftBase).trim();
        }
        if (intent === "foto") {
          const view = overrides?.photo ?? photoViewId;
          if (!view) return "";
          return buildPhotoRequestDraft({
            patientName,
            practicePhone: practicePhone || "",
            photoCount,
            viewId: view,
          }).trim();
        }
        if (intent === "termin") {
          const u = overrides?.termin ?? terminUrgency;
          return buildTerminOfferDraft({ ...draftBase, urgency: u }).trim();
        }
        if (intent === "freigabe") {
          const existing = initialDraftBody?.trim();
          if (existing && !overrides?.freigabeFallback) return existing;
          return buildFollowUpDraft({
            patientName,
            urgency: urgencyKey,
            practicePhone: practicePhone || "",
            appointmentUrl,
          }).trim();
        }
      } catch {
        return "";
      }
      return "";
    },
    [
      intent,
      ruckfrageTopic,
      photoViewId,
      terminUrgency,
      draftBase,
      patientName,
      practicePhone,
      photoCount,
      initialDraftBody,
      urgencyKey,
      appointmentUrl,
    ]
  );

  const revealDraft = useCallback(
    (draft: string) => {
      clearGenerateTimer();
      setDraftFailed(false);
      setError(null);
      setIsGenerating(true);
      generateTimerRef.current = window.setTimeout(() => {
        const text = draft.trim();
        if (!text) {
          setDraftFailed(true);
          setFlowStep("choose");
          setIsGenerating(false);
          return;
        }
        setBody(text);
        setFlowStep("draft");
        setIsGenerating(false);
      }, ASSIST_GENERATING_MS);
    },
    [clearGenerateTimer]
  );

  const startManualDraft = useCallback(() => {
    clearGenerateTimer();
    setDraftFailed(false);
    const fallback = buildFollowUpDraft({
      patientName,
      urgency: urgencyKey,
      practicePhone: practicePhone || "",
      appointmentUrl,
    }).trim();
    if (fallback) {
      setBody(fallback);
      setFlowStep("draft");
      setIsGenerating(false);
      return;
    }
    setDraftFailed(true);
  }, [clearGenerateTimer, patientName, urgencyKey, practicePhone, appointmentUrl]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || !intent) return;

    clearGenerateTimer();
    setError(null);
    setStatus(null);
    setBody("");
    setDraftFailed(false);
    setIsGenerating(false);
    setRuckfrageTopic(null);
    setPhotoViewId(suggestedPhotoViewId ?? null);
    setTerminUrgency(
      (urgencyKey as Exclude<UrgencyKey, null> | null) ?? "this_week"
    );

    if (intent === "freigabe") {
      const draft =
        initialDraftBody?.trim() ||
        buildFollowUpDraft({
          patientName,
          urgency: urgencyKey,
          practicePhone: practicePhone || "",
          appointmentUrl,
        });
      revealDraft(draft);
      return;
    }

    setFlowStep("choose");
  }, [
    open,
    intent,
    initialDraftBody,
    suggestedPhotoViewId,
    urgencyKey,
    patientName,
    practicePhone,
    appointmentUrl,
    clearGenerateTimer,
    revealDraft,
  ]);

  useEffect(() => () => clearGenerateTimer(), [clearGenerateTimer]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending && !isGenerating) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isPending, isGenerating, onClose]);

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
    if (isPending || isGenerating || !body.trim()) return;
    setError(null);
    setStatus(null);
    startTransition(async () => {
      const res = await ensureDraftAndSave();
      if (!res.ok) {
        setError(res.error);
        onOutcome?.({ type: "error", message: res.error });
        return;
      }
      const successMsg = "Nachricht übernommen — weiter in der Kommunikation.";
      setStatus(successMsg);
      onOutcome?.({ type: "success", message: successMsg });
      router.refresh();
      onClose();
      window.setTimeout(scrollToCommunication, 120);
    });
  };

  const handleApprove = () => {
    if (!isDoctor) {
      const msg = "Nur Zahnärzt:innen können Antworten freigeben.";
      setError(msg);
      onOutcome?.({ type: "error", message: msg });
      return;
    }
    setError(null);
    startTransition(async () => {
      const ensured = await ensureDraftAndSave();
      if (!ensured.ok) {
        setError(ensured.error);
        onOutcome?.({ type: "error", message: ensured.error });
        return;
      }
      router.refresh();
      if (!editableDraftId) {
        const msg = "Entwurf vorbereitet — Freigabe in der Kommunikation.";
        setStatus(msg);
        onOutcome?.({ type: "success", message: msg });
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
        onOutcome?.({ type: "error", message: res.error });
        return;
      }
      const msg = "Antwort freigegeben.";
      setStatus(msg);
      onOutcome?.({ type: "success", message: msg });
      router.refresh();
      onClose();
      window.setTimeout(scrollToCommunication, 120);
    });
  };

  const onSelectRuckfrage = (topicId: RuckfrageTopicId) => {
    setRuckfrageTopic(topicId);
    revealDraft(buildDraftText({ ruckfrage: topicId }));
  };

  const onSelectPhoto = (viewId: string) => {
    setPhotoViewId(viewId);
    revealDraft(buildDraftText({ photo: viewId }));
  };

  const onSelectTermin = (u: Exclude<UrgencyKey, null>) => {
    setTerminUrgency(u);
    revealDraft(buildDraftText({ termin: u }));
  };

  const goBackToChoose = () => {
    clearGenerateTimer();
    setIsGenerating(false);
    setDraftFailed(false);
    setBody("");
    setFlowStep("choose");
  };

  const onPrimary = () => {
    if (flowStep === "draft") {
      if (intent === "freigabe" && isDoctor) {
        handleApprove();
        return;
      }
      handleApply();
    }
  };

  if (!open || !intent || !mounted) return null;

  const title =
    intent === "rueckfrage"
      ? "Rückfrage stellen"
      : intent === "termin"
        ? "Termin anbieten"
        : intent === "foto"
          ? photoActionLabel(photoCount)
          : isDoctor
            ? "Antwort freigeben"
            : "Antwort vorbereiten";

  const lead =
    isGenerating
      ? "Nachricht wird vorbereitet…"
      : flowStep === "draft"
        ? "Die KI hat einen Entwurf vorbereitet — bitte kurz prüfen."
        : intent === "rueckfrage"
          ? "Welche Information möchten Sie klären?"
          : intent === "foto"
            ? "Welche Aufnahme wird benötigt?"
            : intent === "termin"
              ? "Welche Dringlichkeit gilt für den Terminvorschlag?"
              : "Antwortentwurf zur Prüfung.";

  const primaryLabel =
    intent === "freigabe" && isDoctor ? "Antwort freigeben" : "Nachricht übernehmen";

  const showDraftEditor = flowStep === "draft" && body.trim().length > 0 && !isGenerating;

  return createPortal(
    <div
      className="yd-tracker-v8-action-backdrop"
      role="presentation"
      onClick={() => !isPending && !isGenerating && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="yd-tracker-v8-action-sheet yd-tracker-v9-action-sheet yd-tracker-v12-action-sheet yd-tracker-v13-action-sheet"
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
              disabled={isPending || isGenerating}
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

          {isGenerating ? <AssistLoading label="Nachricht wird vorbereitet…" /> : null}

          {draftFailed && !isGenerating ? (
            <div className="yd-tracker-v13-assist-empty" role="status">
              <p>Für diesen Fall konnte keine passende Vorlage erstellt werden.</p>
              <button type="button" className="yd-tracker-v13-assist-empty__btn" onClick={startManualDraft}>
                Nachricht manuell verfassen
              </button>
            </div>
          ) : null}

          <fieldset
            disabled={isPending || isGenerating}
            aria-busy={isGenerating || isPending}
            className="m-0 min-w-0 border-0 p-0 disabled:opacity-[0.58]"
          >
            {flowStep === "choose" && !isGenerating && !draftFailed && intent === "rueckfrage" ? (
              <div className="yd-tracker-v8-action-flow-block">
                <div
                  className="yd-tracker-v12-action-radios"
                  role="radiogroup"
                  aria-label="Thema der Rückfrage"
                >
                  {orderedRuckfrageTopics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      role="radio"
                      aria-checked={ruckfrageTopic === topic.id}
                      className={cn(
                        "yd-tracker-v12-action-radio",
                        ruckfrageTopic === topic.id && "yd-tracker-v12-action-radio--active"
                      )}
                      onClick={() => onSelectRuckfrage(topic.id)}
                    >
                      <span className="yd-tracker-v12-action-radio__dot" aria-hidden />
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {flowStep === "choose" && !isGenerating && !draftFailed && intent === "foto" ? (
              <div className="yd-tracker-v8-action-flow-block">
                <div
                  className="yd-tracker-v12-action-radios"
                  role="radiogroup"
                  aria-label="Art der Aufnahme"
                >
                  {orderedPhotoOptions.map((view) => (
                    <button
                      key={view.id}
                      type="button"
                      role="radio"
                      aria-checked={photoViewId === view.id}
                      className={cn(
                        "yd-tracker-v12-action-radio",
                        photoViewId === view.id && "yd-tracker-v12-action-radio--active"
                      )}
                      onClick={() => onSelectPhoto(view.id)}
                    >
                      <span className="yd-tracker-v12-action-radio__dot" aria-hidden />
                      {view.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {flowStep === "choose" && !isGenerating && !draftFailed && intent === "termin" ? (
              <div className="yd-tracker-v8-action-flow-block">
                <MedicalFormSegmented
                  name="termin_urgency"
                  aria-label="Termin-Dringlichkeit"
                  options={TERMIN_OPTIONS}
                  value={terminUrgency}
                  onChange={(v) => v && onSelectTermin(v)}
                  disabled={isPending || isGenerating}
                />
              </div>
            ) : null}

            {showDraftEditor ? (
              <div className="yd-tracker-v8-action-flow-block">
                <AssistReadyBanner />
                <label htmlFor={`${titleId}-body`} className="yd-tracker-v8-action-sheet__label">
                  Nachrichtentwurf
                </label>
                <textarea
                  id={`${titleId}-body`}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={intent === "freigabe" ? 10 : 8}
                  className="yd-tracker-v8-action-sheet__textarea"
                  spellCheck={false}
                />
              </div>
            ) : null}

            {intent === "termin" && showDraftEditor ? (
              <div className="yd-tracker-v8-action-sheet__termin">
                <p className="yd-tracker-v8-action-sheet__label">Terminlink</p>
                {canSendAppointmentLink && isDoctor ? (
                  <AppointmentLinkButton
                    submissionId={submissionId}
                    hasPatientEmail={Boolean(patientEmail?.trim())}
                    canSend
                  />
                ) : (
                  <p className="yd-tracker-v8-action-sheet__hint">
                    Versand des Terminlinks nur durch Zahnärzt:innen. Der Text wird in der
                    Kommunikation vorbereitet.
                  </p>
                )}
              </div>
            ) : null}

            {showDraftEditor ? (
              <p className="yd-tracker-v8-action-sheet__hint">
                {intent === "freigabe" && !isDoctor
                  ? "Entwurf wird übernommen — die Freigabe erfolgt durch Zahnärzt:innen."
                  : "Kein automatischer Versand — Übernahme in die Kommunikation zur Freigabe."}
              </p>
            ) : null}
          </fieldset>
        </div>

        <footer className="yd-tracker-v8-action-sheet__footer">
          <button
            type="button"
            className="yd-auth-btn-secondary yd-tracker-v8-action-sheet__btn"
            disabled={isPending || isGenerating}
            onClick={() => {
              if (flowStep === "draft" && intent !== "freigabe") {
                goBackToChoose();
                return;
              }
              onClose();
            }}
          >
            {flowStep === "draft" && intent !== "freigabe" ? "Zurück" : "Abbrechen"}
          </button>
          {showDraftEditor ? (
            <button
              type="button"
              className="yd-auth-btn-primary yd-tracker-v8-action-sheet__btn"
              disabled={isPending || isGenerating || !body.trim()}
              onClick={onPrimary}
            >
              {isPending ? "Wird gespeichert…" : primaryLabel}
            </button>
          ) : null}
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
