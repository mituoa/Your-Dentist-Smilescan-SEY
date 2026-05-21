"use client";

import { useFormStatus } from "react-dom";

export function ResendConfirmationSubmitButton(props: { disabledExternal?: boolean }) {
  const { pending } = useFormStatus();
  const disabled = pending || Boolean(props.disabledExternal);

  return (
    <button
      type="submit"
      disabled={disabled}
      aria-busy={pending}
      className="yd-login-btn-secondary mt-3 min-h-[44px] text-[13px]"
    >
      {pending ? "Wird gesendet…" : "Bestätigungs‑E‑Mail erneut senden"}
    </button>
  );
}
