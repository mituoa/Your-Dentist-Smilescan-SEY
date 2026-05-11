"use client";

import type { CSSProperties, MutableRefObject } from "react";
import { useFormStatus } from "react-dom";

import { AuthLoadingSpinner } from "@/components/auth/auth-loading-spinner";

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
  /**
   * Mehrere Submits im selben Formular: Spinner nur, wenn dieses `value` die laufende Aktion ausgelöst hat
   * (`submitIntentRef` wird per Form-`onSubmit` / Submitter gesetzt).
   */
  submitIntentRef?: MutableRefObject<string | null>;
  submitIntentValue?: string;
}) {
  const { pending } = useFormStatus();
  const intentAware = Boolean(props.submitIntentRef && props.submitIntentValue);
  const intentMatches =
    !intentAware ||
    (props.submitIntentRef &&
      props.submitIntentValue &&
      props.submitIntentRef.current === props.submitIntentValue);
  const isActivePending = pending && intentMatches;
  const disabled = Boolean(props.disabled) || pending;
  const idleBg =
    props.style ??
    ({ background: "linear-gradient(to bottom, #0284C7 0%, #0369A1 100%)" } satisfies CSSProperties);
  const defaultPending = {
    background: "linear-gradient(to bottom, #0369A1 0%, #075985 100%)",
  } satisfies CSSProperties;
  const style: CSSProperties = isActivePending ? (props.pendingStyle ?? defaultPending) : idleBg;

  return (
    <button
      type="submit"
      name={props.name}
      value={props.value}
      disabled={disabled}
      aria-busy={isActivePending}
      aria-label={isActivePending && !props.pendingLabel?.trim() ? props.label : undefined}
      className={props.className}
      style={style}
    >
      {isActivePending ? (
        <span className={`inline-flex items-center justify-center ${props.pendingLabel?.trim() ? "gap-2" : ""}`}>
          <AuthLoadingSpinner className="h-5 w-5 shrink-0 animate-spin text-white motion-reduce:animate-none motion-reduce:opacity-80" />
          {props.pendingLabel?.trim() ? props.pendingLabel : null}
        </span>
      ) : (
        props.label
      )}
    </button>
  );
}
