"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

import { useAssistUiOptional } from "@/components/command-assist/assist-shell";
import { COMMAND_AI_QUICK_ACTIONS } from "@/lib/dashboard/command-center";
import { WORKSPACE_COPY } from "@/lib/dashboard/workspace-copy";

type AtlasCommandAssistProps = {
  suggestions?: string[];
};

/** Command AI — compact analytics-style module below priority patients. */
export function AtlasCommandAssist({ suggestions = [] }: AtlasCommandAssistProps) {
  const assist = useAssistUiOptional();
  const [draft, setDraft] = useState("");

  const chips = useMemo(() => {
    const fromData = suggestions.slice(0, 4);
    if (fromData.length > 0) return fromData;
    return COMMAND_AI_QUICK_ACTIONS.slice(0, 4);
  }, [suggestions]);

  const run = (text: string) => {
    setDraft(text);
    assist?.openCommand();
  };

  return (
    <section
      className="yd-cockpit-module yd-cockpit-module--command"
      aria-label="Command AI"
    >
      <div className="yd-cockpit-module__head">
        <div className="yd-cockpit-module__title-row">
          <Sparkles
            className="h-[17px] w-[17px] shrink-0 text-[#2f80ed]"
            strokeWidth={1.65}
            aria-hidden
          />
          <h2 className="yd-cockpit-module__title">Command AI</h2>
        </div>
      </div>
      <form
        className="yd-cockpit-command__form"
        onSubmit={(event) => {
          event.preventDefault();
          run(draft.trim() || WORKSPACE_COPY.command.placeholder);
        }}
      >
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={WORKSPACE_COPY.command.placeholder}
          className="yd-cockpit-command__input"
          autoComplete="off"
        />
      </form>
      <div className="yd-cockpit-command__chips" role="group" aria-label="Vorgeschlagene Aktionen">
        {chips.map((line) => (
          <button
            key={line}
            type="button"
            className="yd-cockpit-command__chip"
            onClick={() => run(line)}
          >
            {line}
          </button>
        ))}
      </div>
    </section>
  );
}
