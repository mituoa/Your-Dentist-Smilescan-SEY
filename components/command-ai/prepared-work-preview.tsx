"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import type { PreparedWorkItem } from "@/lib/command-ai/types";
import { COMMAND_AI_DISCLAIMER, COMMAND_AI_NO_AUTO_SEND } from "@/lib/command-ai/safety-copy";
import { cn } from "@/lib/utils";

type PreparedWorkPreviewProps = {
  work: PreparedWorkItem;
  onApprove: () => void;
  onDismiss: () => void;
  busy?: boolean;
};

export function PreparedWorkPreview({
  work,
  onApprove,
  onDismiss,
  busy = false,
}: PreparedWorkPreviewProps) {
  const primaryHref =
    work.actions.find((a) => a.enabled && a.href)?.href ?? work.actions[0]?.href;

  return (
    <div className="yd-command-prepared rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#FAFBFC] p-4 dark:border-white/[0.08] dark:bg-[rgb(22_24_28/0.85)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B] dark:text-slate-500">
        Vorbereitet zur Prüfung
      </p>

      {work.patientName ? (
        <p className="mt-2 text-[15px] font-semibold text-[#0F172A] dark:text-slate-100">
          {work.patientName}
        </p>
      ) : null}

      <p className="mt-2 text-[13px] leading-relaxed text-[#475569] dark:text-slate-400">
        {work.situationSummary}
      </p>
      <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-[#334155] dark:text-slate-300">
        {work.suggestionSummary}
      </p>

      <ul className="mt-3 space-y-1.5" aria-label="Vorbereitungsschritte">
        {work.checks.map((check) => (
          <li key={check.id} className="flex items-center gap-2 text-[12px] text-[#475569] dark:text-slate-400">
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                check.done
                  ? "bg-[rgba(34,197,94,0.12)] text-[#16a34a]"
                  : "bg-[rgba(148,163,184,0.15)] text-[#94a3b8]"
              )}
              aria-hidden
            >
              {check.done ? <Check className="h-2.5 w-2.5" strokeWidth={2.5} /> : "·"}
            </span>
            {check.label}
          </li>
        ))}
      </ul>

      {work.messageDraft ? (
        <div className="mt-3 rounded-lg border border-[rgba(15,23,42,0.06)] bg-white px-3 py-2.5 dark:border-white/[0.08] dark:bg-[rgb(18_20_24/0.9)]">
          <p className="text-[11px] font-medium text-[#94A3B8]">Entwurf</p>
          <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-[12px] leading-relaxed text-[#334155] dark:text-slate-300">
            {work.messageDraft}
          </p>
        </div>
      ) : null}

      <ul className="mt-3 space-y-1">
        {work.actions.filter((a) => a.enabled).map((action) => (
          <li key={action.id} className="text-[12px] text-[#64748B] dark:text-slate-500">
            → {action.label}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] leading-relaxed text-[#94A3B8] dark:text-slate-500">
        {COMMAND_AI_DISCLAIMER} {COMMAND_AI_NO_AUTO_SEND}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {primaryHref ? (
          <Link
            href={primaryHref}
            onClick={onApprove}
            className="inline-flex h-10 items-center rounded-xl bg-[#0F172A] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1E293B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,23,42,0.2)]"
          >
            Prüfen & freigeben
          </Link>
        ) : (
          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            className="inline-flex h-10 items-center rounded-xl bg-[#0F172A] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1E293B] disabled:opacity-50"
          >
            Übernehmen
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          disabled={busy}
          className="inline-flex h-10 items-center rounded-xl border border-[rgba(15,23,42,0.1)] bg-white px-4 text-[13px] font-medium text-[#475569] transition hover:bg-[#F8FAFC] disabled:opacity-50 dark:border-white/[0.1] dark:bg-transparent dark:text-slate-300"
        >
          Verwerfen
        </button>
      </div>
    </div>
  );
}
