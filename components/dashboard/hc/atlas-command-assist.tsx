"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { useAssistUiOptional } from "@/components/command-assist/assist-shell";
import { WORKSPACE_COPY } from "@/lib/dashboard/workspace-copy";

type AtlasCommandAssistProps = {
  suggestions?: string[];
};

/** Command AI as helper card — not dashboard hero. */
export function AtlasCommandAssist({ suggestions = [] }: AtlasCommandAssistProps) {
  const assist = useAssistUiOptional();
  const [draft, setDraft] = useState("");

  const run = (text: string) => {
    setDraft(text);
    assist?.openCommand();
  };

  return (
    <section className="yd-med-command" aria-label="Command AI">
      <div className="yd-med-command__head">
        <Sparkles className="h-4 w-4 shrink-0 text-[#2f80ed]" strokeWidth={1.65} aria-hidden />
        <span className="yd-med-command__title">Command AI</span>
      </div>
      <form
        className="yd-med-command__form"
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
          className="yd-med-command__input"
          autoComplete="off"
        />
      </form>
      {suggestions.length > 0 ? (
        <div className="yd-med-command__chips" role="group" aria-label="Vorschläge">
          {suggestions.slice(0, 3).map((line) => (
            <button key={line} type="button" className="yd-med-command__chip" onClick={() => run(line)}>
              {line}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
