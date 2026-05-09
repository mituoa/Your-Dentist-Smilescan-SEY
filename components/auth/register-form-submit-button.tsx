"use client";

import type { CSSProperties } from "react";
import { useFormStatus } from "react-dom";

export function RegisterFormSubmitButton(props: {
  label: string;
  pendingLabel: string;
  disabled?: boolean;
  className: string;
  name?: string;
  value?: string;
  style?: CSSProperties;
  /** When set, used while `pending` instead of the default blue gradient (e.g. demo/secondary submit). */
  pendingStyle?: CSSProperties;
}) {
  const { pending } = useFormStatus();
  const disabled = Boolean(props.disabled) || pending;
  const idleBg =
    props.style ??
    ({ background: "linear-gradient(to bottom, #0284C7 0%, #0369A1 100%)" } satisfies CSSProperties);
  const defaultPending = {
    background: "linear-gradient(to bottom, #0369A1 0%, #075985 100%)",
  } satisfies CSSProperties;
  const style: CSSProperties = pending ? (props.pendingStyle ?? defaultPending) : idleBg;

  return (
    <button
      type="submit"
      name={props.name}
      value={props.value}
      disabled={disabled}
      aria-busy={pending}
      aria-label={pending && !props.pendingLabel?.trim() ? props.label : undefined}
      className={props.className}
      style={style}
    >
      {pending ? (
        <span className={`inline-flex items-center justify-center ${props.pendingLabel?.trim() ? "gap-2" : ""}`}>
          <svg className="h-5 w-5 shrink-0 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {props.pendingLabel?.trim() ? props.pendingLabel : null}
        </span>
      ) : (
        props.label
      )}
    </button>
  );
}
