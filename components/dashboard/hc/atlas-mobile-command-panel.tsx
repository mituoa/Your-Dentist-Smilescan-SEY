"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { useAssistUiOptional } from "@/components/command-assist/assist-shell";
import { buildCommandMicroInsights } from "@/lib/dashboard/command-insights";
import { WORKSPACE_COPY } from "@/lib/dashboard/workspace-copy";
import type { SubmissionPreviewRow } from "@/lib/queries/dashboard";

type AtlasMobileCommandPanelProps = {
  unseenCount: number | null;
  openTaskCount: number;
  relayUnread: number;
  previewRows: SubmissionPreviewRow[] | null;
};

export function AtlasMobileCommandPanel({
  unseenCount,
  openTaskCount,
  relayUnread,
  previewRows,
}: AtlasMobileCommandPanelProps) {
  const assist = useAssistUiOptional();
  const [draft, setDraft] = useState("");

  const insights = buildCommandMicroInsights({
    unseenCount,
    openTaskCount,
    relayUnread,
    previewRows,
  });

  const openAssist = (seed?: string) => {
    if (seed) setDraft(seed);
    assist?.openCommand();
  };

  return (
    <section className="yd-atlas-m-command" aria-label="Command">
      <form
        className="yd-atlas-m-command-form"
        onSubmit={(event) => {
          event.preventDefault();
          openAssist(draft.trim() || undefined);
        }}
      >
        <span className="yd-atlas-m-command-icon" aria-hidden>
          <Sparkles className="h-4 w-4" strokeWidth={1.65} />
        </span>
        <input
          type="text"
          name="command"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={WORKSPACE_COPY.command.placeholder}
          className="yd-atlas-m-command-input"
          autoComplete="off"
          enterKeyHint="go"
        />
      </form>

      <div className="yd-atlas-m-quick-actions" role="group" aria-label="Schnell">
        {WORKSPACE_COPY.command.quick.map((action) => (
          <button
            key={action.label}
            type="button"
            className="yd-atlas-m-quick-action"
            onClick={() => openAssist(action.phrase)}
          >
            {action.label}
          </button>
        ))}
      </div>

      <ul className="yd-atlas-m-insights" aria-label="Hinweise">
        {insights.map((line) => (
          <li key={line} className="yd-atlas-m-insight">
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
