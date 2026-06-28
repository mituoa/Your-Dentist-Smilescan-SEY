"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";

import {
  prepareMessageDraftForSubmission,
  saveMessageDraftBody,
} from "@/app/(protected)/inbox/[id]/message-draft-actions";
import { sendTrackerPatientMessage } from "@/app/(protected)/inbox/[id]/patient-message-actions";
import {
  buildFollowUpDraft,
  type UrgencyKey,
} from "@/lib/clinical/message-templates";
import { useTrackerWorkflow } from "@/components/inbox/tracker-workflow-context";
import {
  consumeCommandDraftForSubmission,
  consumeWorkflowDraftForSubmission,
} from "@/lib/command-ai/draft-bridge";
import type { MessageDraftRow } from "@/lib/queries/message-drafts";
import { formatTrackerRelativeIngress } from "@/lib/inbox/tracker-v9-clinical";
import { cn } from "@/lib/utils";

type SubmissionMessageDraftPanelProps = {
  submissionId: string;
  patientName: string | null;
  patientEmail: string | null;
  urgency: string | null;
  practicePhone: string | null;
  appointmentUrl: string | null;
  isDoctor: boolean;
  draftsAvailable: boolean;
  initialEditableDraft: MessageDraftRow | null;
  initialHistoryDraft: MessageDraftRow | null;
  trackerBackboneAvailable?: boolean;
};

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

type DraftPath = "standard" | "termin" | "ruckfrage" | "snippet" | "custom";

function historyStatusLabel(status: MessageDraftRow["status"]): string {
  if (status === "approved") return "Antwort freigegeben (noch nicht versendet)";
  if (status === "sent") return "Antwort per E-Mail gesendet";
  return "Verlauf";
}

function draftUpdatedLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const rel = formatTrackerRelativeIngress(iso);
  if (rel === "Gerade eben") return "Letzte Änderung gerade eben";
  if (rel.startsWith("Vor ")) return `Letzte Änderung ${rel.toLowerCase()}`;
  return `Letzte Änderung ${rel}`;
}

function draftPreviewTwoLines(body: string): string {
  const lines = body
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 2);
  return lines.join(" ") || "—";
}

export function SubmissionMessageDraftPanel({
  submissionId,
  patientName,
  patientEmail,
  urgency,
  practicePhone,
  appointmentUrl,
  isDoctor,
  draftsAvailable,
  initialEditableDraft,
  initialHistoryDraft,
  trackerBackboneAvailable = true,
}: SubmissionMessageDraftPanelProps) {
  const urgencyKey = toUrgencyKey(urgency);
  const params = useMemo(
    () => ({
      patientName: patientName || "Patient",
      urgency: urgencyKey,
      practicePhone: practicePhone || "",
      appointmentUrl,
    }),
    [patientName, urgencyKey, practicePhone, appointmentUrl]
  );

  const canonicalBase = useMemo(
    () =>
      buildFollowUpDraft({
        patientName: params.patientName,
        urgency: params.urgency,
        practicePhone: params.practicePhone,
        appointmentUrl: params.appointmentUrl,
      }),
    [params]
  );

  const [editableDraft, setEditableDraft] = useState(initialEditableDraft);
  const [historyDraft, setHistoryDraft] = useState(initialHistoryDraft);
  const [body, setBody] = useState(initialEditableDraft?.body ?? canonicalBase);
  const [draftPath, setDraftPath] = useState<DraftPath>(
    initialEditableDraft ? "custom" : "standard"
  );
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { draftApplyRequest } = useTrackerWorkflow();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commandDraftApplied = useRef(false);
  const lastAppliedRevision = useRef(0);

  const refreshAfterMutation = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    setEditableDraft(initialEditableDraft);
    setHistoryDraft(initialHistoryDraft);
    if (initialEditableDraft) {
      setBody(initialEditableDraft.body);
    }
  }, [initialEditableDraft, initialHistoryDraft]);

  useEffect(() => {
    if (commandDraftApplied.current || !editableDraft) return;
    const pending =
      consumeCommandDraftForSubmission(submissionId) ??
      consumeWorkflowDraftForSubmission(submissionId);
    if (pending) {
      setBody(pending);
      setDraftPath("custom");
      commandDraftApplied.current = true;
    }
  }, [submissionId, editableDraft]);

  useEffect(() => {
    if (!draftApplyRequest || !editableDraft) return;
    if (draftApplyRequest.revision === lastAppliedRevision.current) return;
    lastAppliedRevision.current = draftApplyRequest.revision;
    setBody(draftApplyRequest.body);
    setDraftPath(
      draftApplyRequest.path === "termin"
        ? "termin"
        : draftApplyRequest.path === "ruckfrage"
          ? "ruckfrage"
          : "standard"
    );
    setActiveSnippetId(draftApplyRequest.snippetId ?? null);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 200);
  }, [draftApplyRequest, editableDraft]);

  const scrollDraftIntoView = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const run = () =>
      el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    window.requestAnimationFrame(() => {
      run();
      window.setTimeout(run, 280);
    });
  }, []);

  useEffect(() => {
    if (draftPath === "custom") return;
    if (draftApplyRequest) return;
    setBody(canonicalBase);
  }, [canonicalBase, draftPath, draftApplyRequest]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* no-op */
    }
  };

  if (!draftsAvailable) {
    return (
      <p className="text-[13px] leading-relaxed text-slate-600" role="status">
        Antwortentwürfe sind aktuell nicht verfügbar.
      </p>
    );
  }

  const readOnlyHistory = !editableDraft && historyDraft;

  if (readOnlyHistory && historyDraft) {
    return (
      <div className="touch-manipulation space-y-3">
        <p className="text-[13px] font-semibold text-slate-800">{historyStatusLabel(historyDraft.status)}</p>
        <div
          className="rounded-[10px] bg-[#FAFBFC] px-4 py-4 text-[15px] leading-relaxed text-[#0F172A] max-lg:bg-white"
          style={{ boxShadow: "inset 0 0 0 1px rgba(226, 232, 240, 1)" }}
        >
          {historyDraft.body}
        </div>
        <p className="text-[12px] leading-relaxed text-slate-500">
          {historyDraft.status === "sent"
            ? "Die Antwort wurde per E-Mail an den Patienten gesendet."
            : "Freigabe durch die Praxis — Versand nur nach ausdrücklichem Senden."}
        </p>
        {isDoctor && historyDraft.status === "approved" ? (
          <button
            type="button"
            disabled={isPending || !patientEmail?.trim() || !trackerBackboneAvailable}
            onClick={() => {
              setErrorMessage(null);
              startTransition(async () => {
                const res = await sendTrackerPatientMessage({
                  submissionId,
                  body: historyDraft.body,
                  messageKind: "reply",
                  draftId: historyDraft.id,
                });
                if (!res.ok) setErrorMessage(res.error);
                else {
                  setStatusMessage(res.message ?? "Antwort wurde per E-Mail gesendet.");
                  refreshAfterMutation();
                }
              });
            }}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-[9px] border border-[#E5E7EB] bg-white px-4 text-[14px] font-medium text-[#0F172A] transition disabled:opacity-60"
          >
            {isPending ? "Wird gesendet …" : "Antwort prüfen und senden"}
          </button>
        ) : null}
        {isDoctor && historyDraft.status === "approved" && !patientEmail?.trim() ? (
          <p className="text-[12px] leading-relaxed text-amber-800" role="status">
            Für diesen Patienten ist keine E-Mail-Adresse hinterlegt.
          </p>
        ) : null}
        {!editableDraft ? (
          <PrepareDraftButton
            submissionId={submissionId}
            isPending={isPending}
            startTransition={startTransition}
            onStatus={setStatusMessage}
            onError={setErrorMessage}
            onSuccess={refreshAfterMutation}
          />
        ) : null}
        <StatusBanners statusMessage={statusMessage} errorMessage={errorMessage} />
      </div>
    );
  }

  if (!editableDraft) {
    return (
      <div className="touch-manipulation space-y-3">
        <div className="yd-tracker-v11-comm-empty">
          <p className="yd-tracker-v11-comm-empty__title">
            Noch kein Vorschlag — wählen Sie links einen Antwortweg.
          </p>
        </div>
        <PrepareDraftButton
          submissionId={submissionId}
          isPending={isPending}
          startTransition={startTransition}
          onStatus={setStatusMessage}
          onError={setErrorMessage}
          onSuccess={refreshAfterMutation}
        />
        <StatusBanners statusMessage={statusMessage} errorMessage={errorMessage} />
        <p className="text-[12px] leading-relaxed text-slate-500">
          Formulierung erfolgt aus Ihrer Entscheidung — Versand erst nach Prüfung durch Zahnärzt:innen.
        </p>
      </div>
    );
  }

  const updatedMeta = draftUpdatedLabel(editableDraft.updated_at);
  const previewText = draftPreviewTwoLines(body);

  return (
    <div className="touch-manipulation space-y-3 lg:space-y-4">
      <div className="yd-tracker-v11-comm-card">
        <div className="yd-tracker-v11-comm-card__copy">
          <p className="yd-tracker-v11-comm-card__title">Vorschlag für Patientenantwort</p>
          {updatedMeta ? (
            <p className="yd-tracker-v11-comm-card__meta">{updatedMeta}</p>
          ) : null}
          <p className="yd-tracker-v11-comm-card__preview">{previewText}</p>
        </div>
        <button
          type="button"
          className="yd-tracker-v11-comm-card__open"
          disabled={isPending}
          onClick={scrollDraftIntoView}
        >
          Öffnen
        </button>
      </div>

      <div
        className={cn(
          "yd-tracker-v11-comm-editor bg-[#FAFBFC] transition-[box-shadow] duration-200 ease-out motion-reduce:transition-none max-lg:bg-white",
          isPending && "opacity-[0.92]"
        )}
        style={{
          borderRadius: "10px",
          boxShadow: flash
            ? "inset 0 0 0 1px rgba(12,25,41,0.1)"
            : "inset 0 0 0 1px rgba(226, 232, 240, 1)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setDraftPath("custom");
            setActiveSnippetId("custom");
          }}
          onFocus={scrollDraftIntoView}
          rows={8}
          spellCheck={false}
          disabled={isPending}
          className="min-h-[168px] w-full scroll-mt-6 resize-y border-0 bg-transparent px-4 py-4 outline-none max-lg:min-h-[180px] disabled:opacity-70 lg:px-5 lg:py-4"
          style={{
            fontSize: "16px",
            lineHeight: 1.6,
            letterSpacing: "-0.01em",
            color: "#0F172A",
            fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
          }}
          aria-label="Antwortentwurf"
          data-tracker-draft
        />
      </div>
      <p className="text-[12px] leading-relaxed text-slate-500">
        {patientEmail?.trim()
          ? "Bitte prüfen Sie den Vorschlag — Versand nur nach ausdrücklicher Freigabe."
          : "Für diesen Patienten ist keine E-Mail-Adresse hinterlegt — nur Entwurf speicherbar."}
      </p>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setErrorMessage(null);
            setStatusMessage(null);
            startTransition(async () => {
              const res = await saveMessageDraftBody({
                draftId: editableDraft.id,
                submissionId,
                body,
              });
              if (!res.ok) setErrorMessage(res.error);
              else {
                setStatusMessage("Entwurf gespeichert");
                refreshAfterMutation();
              }
            });
          }}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-[9px] px-4 text-[14px] font-semibold text-white transition disabled:opacity-60"
          style={{
            background: "linear-gradient(168deg, #2a5f9e 0%, #1A4F9C 48%, #163d7a 100%)",
            boxShadow: "0 1px 2px rgba(12,25,41,0.08)",
          }}
        >
          {isPending ? "Entwurf wird gespeichert …" : "Entwurf speichern"}
        </button>

        {isDoctor ? (
          <button
            type="button"
            disabled={isPending || !patientEmail?.trim() || !trackerBackboneAvailable}
            onClick={() => {
              setErrorMessage(null);
              startTransition(async () => {
                const saveRes = await saveMessageDraftBody({
                  draftId: editableDraft.id,
                  submissionId,
                  body,
                });
                if (!saveRes.ok) {
                  setErrorMessage(saveRes.error);
                  return;
                }
                const res = await sendTrackerPatientMessage({
                  submissionId,
                  body,
                  messageKind: "reply",
                  draftId: editableDraft.id,
                });
                if (!res.ok) setErrorMessage(res.error);
                else {
                  setStatusMessage(res.message ?? "Antwort wurde per E-Mail gesendet.");
                  refreshAfterMutation();
                }
              });
            }}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-[9px] border border-[#CBD5E1] bg-white px-4 text-[14px] font-medium text-[#1A4F9C] transition disabled:opacity-60"
          >
            {isPending ? "Wird gesendet …" : "Antwort prüfen und senden"}
          </button>
        ) : (
          <p className="text-[12px] leading-relaxed text-slate-500" role="note">
            Nur Zahnärzt:innen können Antworten freigeben.
          </p>
        )}

        <button
          type="button"
          disabled={isPending}
          onClick={copy}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[9px] border border-[#E5E7EB] bg-white px-4 text-[14px] font-medium text-[#0F172A] transition disabled:opacity-60"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[#1A4F9C]" strokeWidth={2} />
          ) : (
            <Copy className="h-4 w-4 opacity-60" strokeWidth={1.75} />
          )}
          {copied ? "Kopiert" : "In Zwischenablage kopieren"}
        </button>
      </div>

      <StatusBanners statusMessage={statusMessage} errorMessage={errorMessage} />
    </div>
  );
}

function StatusBanners({
  statusMessage,
  errorMessage,
}: {
  statusMessage: string | null;
  errorMessage: string | null;
}) {
  return (
    <>
      {statusMessage ? (
        <p className="text-[13px] font-medium text-[#166534]" role="status" aria-live="polite">
          {statusMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="text-[13px] leading-relaxed text-[#B45309]" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}

function PrepareDraftButton({
  submissionId,
  isPending,
  startTransition,
  onStatus,
  onError,
  onSuccess,
}: {
  submissionId: string;
  isPending: boolean;
  startTransition: (fn: () => void | Promise<void>) => void;
  onStatus: (msg: string | null) => void;
  onError: (msg: string | null) => void;
  onSuccess: () => void;
}) {
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        onError(null);
        onStatus(null);
        startTransition(async () => {
          const res = await prepareMessageDraftForSubmission(submissionId);
          if (!res.ok) onError(res.error);
          else {
            onStatus("Antwortentwurf gespeichert");
            onSuccess();
          }
        });
      }}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-[9px] px-4 text-[14px] font-semibold text-white transition disabled:opacity-60"
      style={{
        background: "linear-gradient(168deg, #2a5f9e 0%, #1A4F9C 48%, #163d7a 100%)",
        boxShadow: "0 1px 2px rgba(12,25,41,0.08)",
      }}
    >
      {isPending ? "Nachricht wird vorbereitet…" : "Nachricht erstellen"}
    </button>
  );
}
