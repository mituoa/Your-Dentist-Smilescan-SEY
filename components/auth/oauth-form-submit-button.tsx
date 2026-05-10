"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type OAuthFormSubmitButtonProps = {
  children: ReactNode;
  pendingLabel: string;
  className: string;
};

/**
 * Submit innerhalb eines <form action={…}> — verhindert Doppelklicks während der Server Action läuft
 * (z. B. OAuth-Redirect vorbereiten).
 */
export function OAuthFormSubmitButton({ children, pendingLabel, className }: OAuthFormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={className}>
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-5 w-5 shrink-0 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
