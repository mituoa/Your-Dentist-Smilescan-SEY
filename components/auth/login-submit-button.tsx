"use client";

import { useFormStatus } from "react-dom";

export function LoginSubmitButton(props: { disabledExternal?: boolean }) {
  const { pending } = useFormStatus();
  const disabled = pending || Boolean(props.disabledExternal);

  return (
    <button
      type="submit"
      disabled={disabled}
      aria-busy={pending}
      data-pending={pending ? "true" : "false"}
      className="yd-auth-btn-primary yd-auth-awaken-field relative overflow-hidden"
      style={{ ["--yd-auth-field-i" as string]: "2" }}
    >
      <span
        className={
          "flex items-center justify-center gap-2 transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
          (pending ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1")
        }
        aria-hidden={!pending}
      >
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
        Anmeldung läuft…
      </span>
      <span
        className={
          "absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
          (pending ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0")
        }
        aria-hidden={pending}
      >
        Anmelden
      </span>
    </button>
  );
}
