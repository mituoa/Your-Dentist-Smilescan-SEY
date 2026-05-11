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
      className="h-[44px] w-full rounded-xl border border-amber-200 bg-white text-[13px] font-semibold text-amber-900 transition-colors hover:bg-amber-100/50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Wird gesendet…" : "Bestätigungs‑E‑Mail erneut senden"}
    </button>
  );
}
