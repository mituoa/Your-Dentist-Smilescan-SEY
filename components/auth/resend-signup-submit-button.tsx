"use client";

import { useFormStatus } from "react-dom";

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
      {pending ? pendingText : props.idleLabel}
    </button>
  );
}
