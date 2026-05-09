"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  buildFollowUpDraft,
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
  const base = useMemo(
    () =>
      buildFollowUpDraft({
        patientName: patientName || "Patient",
        urgency,
        practicePhone: practicePhone || "",
        appointmentUrl,
      }),
    [patientName, urgency, practicePhone, appointmentUrl]
  );

  const [body, setBody] = useState(base);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBody(base);
  }, [base]);

  const append = (text: string) => {
    setBody((prev) => (prev.trim() ? `${prev.trim()}\n\n${text}` : text));
  };

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
    <section className="rounded-xl border border-border/85 bg-surface-card/95 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
        Rückfrage / Nachricht
      </h3>
      <p className="mb-3 text-[13px] leading-relaxed text-text-secondary">
        Entwurf nach Dringlichkeit — nur nach Ihrer Prüfung verwenden. Es wird{" "}
        <span className="font-medium text-text-primary">nichts automatisch versendet</span>.
      </p>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={10}
        className="mb-3 w-full resize-y rounded-lg border border-border bg-surface-card px-3 py-2.5 text-[14px] leading-relaxed text-text-primary shadow-sm outline-none transition focus:border-brand/50 focus:ring-2 focus:ring-brand/15"
        aria-label="Nachrichtentwurf"
      />

      <div className="mb-3 flex flex-wrap gap-2">
        {FOLLOW_UP_SNIPPETS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => append(s.text)}
            className="min-h-9 rounded-lg border border-border/80 bg-surface-page/90 px-3 py-1.5 text-left text-[12px] font-medium text-text-secondary transition hover:border-brand/35 hover:bg-surface-card hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
          >
            {s.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface-card px-4 text-[13px] font-medium text-text-primary shadow-sm transition hover:border-brand/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
      >
        {copied ? (
          <Check className="h-4 w-4 text-brand" strokeWidth={2} />
        ) : (
          <Copy className="h-4 w-4 opacity-70" strokeWidth={1.75} />
        )}
        {copied ? "Kopiert" : "In Zwischenablage kopieren"}
      </button>
    </section>
  );
}
