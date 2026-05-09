"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  buildFollowUpDraft,
  buildRuckfrageDraftForSnippet,
  FOLLOW_UP_SNIPPETS,
  type UrgencyKey,
} from "@/lib/clinical/message-templates";

interface FollowUpMessageDraftProps {
  patientName: string | null;
  urgency: UrgencyKey;
  practicePhone: string | null;
  appointmentUrl: string | null;
}

export function FollowUpMessageDraft({
  patientName,
  urgency,
  practicePhone,
  appointmentUrl,
}: FollowUpMessageDraftProps) {
  const params = useMemo(
    () => ({
      patientName: patientName || "Patient",
      urgency,
      practicePhone: practicePhone || "",
      appointmentUrl,
    }),
    [patientName, urgency, practicePhone, appointmentUrl]
  );

  const paramsSig = `${params.patientName}|${params.urgency}|${params.practicePhone}|${params.appointmentUrl ?? ""}`;

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

  const [body, setBody] = useState(canonicalBase);
  /** null = Standard-Einladung aktiv; "custom" = manuell bearbeitet; sonst Snippet-ID */
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [copied, setCopied] = useState(false);
  const prevSig = useRef<string | null>(null);

  useEffect(() => {
    if (prevSig.current === null) {
      prevSig.current = paramsSig;
      return;
    }
    if (prevSig.current !== paramsSig) {
      prevSig.current = paramsSig;
      setBody(canonicalBase);
      setActiveSnippetId(null);
    }
  }, [paramsSig, canonicalBase]);

  const applySnippet = useCallback(
    (snippetId: string) => {
      const next = buildRuckfrageDraftForSnippet(snippetId, params);
      setActiveSnippetId(snippetId);
      setBody(next);
      setFlash(true);
      window.setTimeout(() => setFlash(false), 220);
    },
    [params]
  );

  const resetToStandard = useCallback(() => {
    setBody(canonicalBase);
    setActiveSnippetId(null);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 220);
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

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
          Patientenkorrespondenz
        </h3>
        <p className="text-[14px] leading-relaxed text-text-secondary">
          Entwurf zur Prüfung durch die Praxis.{" "}
          <span className="font-medium text-text-primary">Es wird nichts automatisch versendet.</span>
        </p>
      </header>

      <div
        className={`rounded-xl border border-border/80 bg-surface-card/90 shadow-sm transition-[box-shadow,background-color] duration-200 ease-out motion-reduce:transition-none ${
          flash ? "shadow-md ring-1 ring-brand/15" : ""
        }`}
      >
        <textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setActiveSnippetId("custom");
          }}
          rows={12}
          className="min-h-[220px] w-full resize-y rounded-xl border-0 bg-transparent px-4 py-4 text-[15px] leading-[1.65] text-text-primary outline-none transition-opacity duration-200 motion-reduce:transition-none placeholder:text-text-tertiary"
          aria-label="Nachrichtentwurf"
        />
      </div>

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Vorlagen
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetToStandard}
            className={`min-h-10 rounded-full border px-4 py-2 text-left text-[13px] font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 ${
              activeSnippetId === null
                ? "border-brand/40 bg-brand/8 text-text-primary"
                : "border-border/80 bg-surface-page/90 text-text-secondary hover:border-brand/30 hover:bg-surface-card hover:text-text-primary"
            }`}
          >
            Standard-Einladung
          </button>
          {FOLLOW_UP_SNIPPETS.map((s) => {
            const active = activeSnippetId !== "custom" && activeSnippetId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => applySnippet(s.id)}
                className={`min-h-10 rounded-full border px-4 py-2 text-left text-[13px] font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 ${
                  active
                    ? "border-brand/40 bg-brand/8 text-text-primary"
                    : "border-border/80 bg-surface-page/90 text-text-secondary hover:border-brand/30 hover:bg-surface-card hover:text-text-primary"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-card px-4 text-[14px] font-medium text-text-primary shadow-sm transition hover:border-brand/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 sm:w-auto"
      >
        {copied ? (
          <Check className="h-4 w-4 text-brand" strokeWidth={2} />
        ) : (
          <Copy className="h-4 w-4 opacity-70" strokeWidth={1.75} />
        )}
        {copied ? "Kopiert" : "In Zwischenablage kopieren"}
      </button>
    </div>
  );
}
