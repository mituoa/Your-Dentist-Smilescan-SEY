"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { useAssistUiOptional } from "@/components/command-assist/assist-shell";
import { COMMAND_AI_EXAMPLES, COMMAND_AI_PREPARED } from "@/lib/product/workflow";
import { WORKSPACE_COPY } from "@/lib/dashboard/workspace-copy";

type AtlasCommandHeroProps = {
  suggestions: string[];
  compact?: boolean;
};

export function AtlasCommandHero({ suggestions, compact = false }: AtlasCommandHeroProps) {
  const assist = useAssistUiOptional();
  const [draft, setDraft] = useState("");
  const chips = suggestions.length > 0 ? suggestions : [...COMMAND_AI_EXAMPLES];

  const run = (text: string) => {
    setDraft(text);
    assist?.openCommand();
  };

  return (
    <section
      className={compact ? "yd-command-hero yd-command-hero--compact" : "yd-command-hero yd-command-hero--cockpit"}
      aria-label="Command AI"
    >
      <div className="yd-command-hero-head">
        <Sparkles className="h-4 w-4 shrink-0" strokeWidth={1.65} aria-hidden />
        <span className="yd-command-hero-title">Command AI</span>
      </div>

      <form
        className="yd-command-hero-input-wrap"
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
          className="yd-command-hero-input"
          autoComplete="off"
        />
      </form>

      <div className="yd-command-hero-chips" role="group" aria-label="Vorschläge">
        {chips.map((line) => (
          <button
            key={line}
            type="button"
            className="yd-command-hero-chip"
            onClick={() => run(line)}
          >
            {line}
          </button>
        ))}
      </div>

      <ul className="yd-command-hero-prepared" aria-label="Vorbereitet">
        {COMMAND_AI_PREPARED.map((line) => (
          <li key={line} className="yd-command-hero-prepared-item">
            <span className="yd-command-hero-check" aria-hidden>
              ✓
            </span>
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
