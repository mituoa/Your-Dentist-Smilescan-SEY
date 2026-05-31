"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

import { useAssistUiOptional } from "@/components/command-assist/assist-shell";

const QUICK_ACTIONS = [
  { label: "Patient informieren", phrase: "Patient informieren" },
  { label: "Aufgabe erstellen", phrase: "Aufgabe erstellen" },
  { label: "Teamnachricht", phrase: "Teamnachricht senden" },
  { label: "Rückruf vorbereiten", phrase: "Rückruf vorbereiten" },
] as const;

/** Mobile Atlas — Command AI zuerst, schnelle Aktionen. */
export function AtlasMobileCommandPanel() {
  const assist = useAssistUiOptional();
  const [draft, setDraft] = useState("");

  const openAssist = (seed?: string) => {
    if (seed) setDraft(seed);
    assist?.openCommand();
  };

  return (
    <section className="yd-atlas-m-command" aria-label="Command AI">
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
          placeholder="Was soll erledigt werden?"
          className="yd-atlas-m-command-input"
          autoComplete="off"
          enterKeyHint="go"
        />
      </form>
      <div className="yd-atlas-m-quick-actions" role="group" aria-label="Schnellaktionen">
        {QUICK_ACTIONS.map((action) => (
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
    </section>
  );
}
