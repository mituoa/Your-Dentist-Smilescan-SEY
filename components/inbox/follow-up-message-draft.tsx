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

  return (
    <div className="touch-manipulation space-y-8">
      <div
        className="transition-[box-shadow] duration-200 ease-out motion-reduce:transition-none"
        style={{
          borderRadius: "14px",
          background: "#FDFEFE",
          boxShadow: flash
            ? "inset 0 0 0 1px rgba(43,111,232,0.12), 0 2px 12px rgba(15,23,42,0.05)"
            : "inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(15,23,42,0.04)",
          border: "1px solid rgba(226, 232, 240, 0.75)",
        }}
      >
        <textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setActiveSnippetId("custom");
          }}
          rows={11}
          spellCheck={false}
          className="min-h-[200px] w-full resize-y border-0 bg-transparent px-5 py-5 outline-none max-lg:min-h-[220px] max-lg:px-4 max-lg:py-4 lg:min-h-[240px] lg:px-6 lg:py-6"
          style={{
            fontSize: "16px",
            lineHeight: 1.75,
            letterSpacing: "-0.01em",
            color: "#0F172A",
            fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
          }}
          aria-label="Entwurf zur Patienten-Rückmeldung — wird nicht automatisch versendet"
          data-tracker-draft
        />
      </div>

      <div>
        <p className="mb-3 text-[12px] font-medium" style={{ color: "#94A3B8", letterSpacing: "0.06em" }}>
          Vorlagen
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetToStandard}
            style={{
              padding: "7px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "-0.005em",
              transition: "background 120ms ease, border-color 120ms ease, color 120ms ease",
              ...chip(activeSnippetId === null),
            }}
            className="max-lg:min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.25)]"
          >
            Standard
          </button>
          {FOLLOW_UP_SNIPPETS.map((s) => {
            const active = activeSnippetId !== "custom" && activeSnippetId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => applySnippet(s.id)}
                style={{
                  padding: "7px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "-0.005em",
                  transition: "background 120ms ease, border-color 120ms ease, color 120ms ease",
                  ...chip(active),
                }}
                className="max-lg:min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.25)]"
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
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] px-5 text-[14px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.25)]"
        style={{
          color: "#0F172A",
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        }}
      >
        {copied ? (
          <Check className="h-4 w-4" style={{ color: "#2563EB" }} strokeWidth={2} />
        ) : (
          <Copy className="h-4 w-4 opacity-60" strokeWidth={1.75} />
        )}
        {copied ? "Kopiert" : "In Zwischenablage kopieren"}
      </button>
    </div>
  );
}
