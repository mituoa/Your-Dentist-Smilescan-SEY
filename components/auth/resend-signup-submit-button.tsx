"use client";

import { useFormStatus } from "react-dom";

import { AuthLoadingSpinner } from "@/components/auth/auth-loading-spinner";

/** Submit für Bestätigungsmail erneut senden — pending kommt aus Server Action, kein künstlicher Cooldown vor Submit. */
export function ResendSignupSubmitButton(props: {
  idleLabel: string;
  disabled: boolean;
  className: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  const disabled = Boolean(props.disabled) || pending;
  const pendingText = props.pendingLabel?.trim() || "Wird gesendet…";

  return (
    <button
      type="submit"
      disabled={disabled}
      aria-busy={pending}
      className={props.className}
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <AuthLoadingSpinner className="h-5 w-5 shrink-0 animate-spin text-[#0284C7]/80 motion-reduce:animate-none motion-reduce:opacity-80" />
          {pendingText}
        </span>
      ) : (
        props.idleLabel
      )}
    </button>
  );
}
