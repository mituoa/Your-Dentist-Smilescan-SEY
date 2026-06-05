"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { YdInlineBusy } from "@/components/design-system/yd-skeleton";

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
          <YdInlineBusy />
          <span>{pendingLabel}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
