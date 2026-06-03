"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy } from "lucide-react";

import {
  approveMessageDraftForSubmission,
  markMessageDraftSentForSubmission,
  prepareMessageDraftForSubmission,
  saveMessageDraftBody,
} from "@/app/(protected)/inbox/[id]/message-draft-actions";
import {
  buildFollowUpDraft,
  buildRuckfrageDraftForSnippet,
  FOLLOW_UP_SNIPPETS,
  type UrgencyKey,
} from "@/lib/clinical/message-templates";
import { consumeCommandDraftForSubmission } from "@/lib/command-ai/draft-bridge";
import type { MessageDraftRow } from "@/lib/queries/message-drafts";

type SubmissionMessageDraftPanelProps = {
  submissionId: string;
  patientName: string | null;
  urgency: string | null;
  practicePhone: string | null;
  appointmentUrl: string | null;
  isDoctor: boolean;
  draftsAvailable: boolean;
  initialEditableDraft: MessageDraftRow | null;
  initialHistoryDraft: MessageDraftRow | null;
};

function toUrgencyKey(urgency: string | null): UrgencyKey {
  if (urgency === "today" || urgency === "this_week" || urgency === "not_urgent") {
    return urgency;
  }
  return null;
}

function historyStatusLabel(status: MessageDraftRow["status"]): string {
  if (status === "approved") return "Antwort freigegeben";
  if (status === "sent") return "Als versendet markiert";
  return "Verlauf";
}

export function SubmissionMessageDraftPanel({
  submissionId,
  patientName,
  urgency,
  practicePhone,
  appointmentUrl,
  isDoctor,
  draftsAvailable,
  initialEditableDraft,
  initialHistoryDraft,
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
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commandDraftApplied = useRef(false);

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
    const pending = consumeCommandDraftForSubmission(submissionId);
    if (pending) {
      setBody(pending);
      commandDraftApplied.current = true;
    }
  }, [submissionId, editableDraft]);

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

  const applySnippet = useCallback(
    (snippetId: string) => {
      const next = buildRuckfrageDraftForSnippet(snippetId, params);
      setActiveSnippetId(snippetId);
      setBody(next);
      setFlash(true);
      window.setTimeout(() => setFlash(false), 200);
    },
    [params]
  );

  const resetToStandard = useCallback(() => {
    setBody(canonicalBase);
    setActiveSnippetId(null);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 200);
  }, [canonicalBase]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* no-op */
    }
  };

  const chip = (active: boolean) =>
    active
      ? {
          border: "1px solid #2B6FE8",
          background: "#EEF6FF",
          color: "#1D4ED8",
        }
      : {
          border: "1px solid #E5E7EB",
          background: "#FFFFFF",
          color: "#64748B",
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
          Freigabe durch die Praxis. Kein automatischer Versand an Patient:innen.
        </p>
        {isDoctor && historyDraft.status === "approved" ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setErrorMessage(null);
              startTransition(async () => {
                const res = await markMessageDraftSentForSubmission({
                  draftId: historyDraft.id,
                  submissionId,
                });
                if (!res.ok) setErrorMessage(res.error);
                else {
                  setStatusMessage("Als versendet markiert");
                  refreshAfterMutation();
                }
              });
            }}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-[9px] border border-[#E5E7EB] bg-white px-4 text-[14px] font-medium text-[#0F172A] transition disabled:opacity-60"
          >
            {isPending ? "Wird gespeichert …" : "Als gesendet markieren"}
          </button>
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
        <p className="text-[13px] leading-relaxed text-slate-600">
          Noch kein Antwortentwurf vorbereitet.
        </p>
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
          Die Plattform bereitet einen Entwurf vor — Sie prüfen und geben frei. Kein automatischer
          Versand.
        </p>
      </div>
    );
  }

  return (
    <div className="touch-manipulation space-y-3 lg:space-y-4">
      <p className="text-[13px] font-semibold text-slate-800">Antwortentwurf vorbereitet</p>

      <div
        className="bg-[#FAFBFC] transition-[box-shadow] duration-200 ease-out motion-reduce:transition-none max-lg:bg-white"
        style={{
          borderRadius: "10px",
          boxShadow: flash
            ? "inset 0 0 0 1px rgba(43,111,232,0.12)"
            : "inset 0 0 0 1px rgba(226, 232, 240, 1)",
          opacity: isPending ? 0.92 : 1,
        }}
      >
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
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
          aria-label="Antwortentwurf — wird nicht automatisch versendet"
          data-tracker-draft
        />
      </div>
      <p className="text-[12px] leading-relaxed text-slate-500">
        Freigabe durch die Praxis erforderlich. Kein automatischer Versand.
      </p>

      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-slate-500">
          Textbausteine
        </p>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled={isPending}
            onClick={resetToStandard}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              textAlign: "left",
              width: "100%",
              ...chip(activeSnippetId === null),
            }}
            className="min-h-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.25)] disabled:opacity-60"
          >
            Standard
          </button>
          {FOLLOW_UP_SNIPPETS.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={isPending}
              onClick={() => applySnippet(s.id)}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                textAlign: "left",
                width: "100%",
                ...chip(activeSnippetId === s.id),
              }}
              className="min-h-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.25)] disabled:opacity-60"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

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
            background: "#2B6FE8",
            boxShadow: "0 1px 2px rgba(43,111,232,0.1)",
          }}
        >
          {isPending ? "Entwurf wird gespeichert …" : "Entwurf speichern"}
        </button>

        {isDoctor ? (
          <button
            type="button"
            disabled={isPending}
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
                const res = await approveMessageDraftForSubmission({
                  draftId: editableDraft.id,
                  submissionId,
                });
                if (!res.ok) setErrorMessage(res.error);
                else {
                  setStatusMessage("Antwort freigegeben");
                  refreshAfterMutation();
                }
              });
            }}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-[9px] border border-[#CBD5E1] bg-white px-4 text-[14px] font-medium text-[#2B6FE8] transition disabled:opacity-60"
          >
            {isPending ? "Freigabe wird gespeichert …" : "Freigeben"}
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
            <Check className="h-4 w-4 text-[#2563EB]" strokeWidth={2} />
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
        background: "#2B6FE8",
        boxShadow: "0 1px 2px rgba(43,111,232,0.1)",
      }}
    >
      {isPending ? "Antwort wird vorbereitet …" : "Antwort vorbereiten"}
    </button>
  );
}
