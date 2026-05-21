"use client";

import type { CSSProperties, MutableRefObject } from "react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

export function RegisterFormSubmitButton(props: {
  label: string;
  pendingLabel: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  value?: string;
  style?: CSSProperties;
  pendingStyle?: CSSProperties;
  submitIntentRef?: MutableRefObject<string | null>;
  submitIntentValue?: string;
  variant?: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  const intentAware = Boolean(props.submitIntentRef && props.submitIntentValue);
  const intentMatches =
    !intentAware ||
    Boolean(
      props.submitIntentRef &&
        props.submitIntentValue &&
        props.submitIntentRef.current === props.submitIntentValue
    );
  const isActivePending = Boolean(pending && intentMatches);
  const disabled = Boolean(props.disabled) || pending;
  const variant = props.variant ?? "primary";

  return (
    <button
      type="submit"
      name={props.name}
      value={props.value}
      disabled={disabled}
      aria-busy={isActivePending}
      aria-label={isActivePending && !props.pendingLabel?.trim() ? props.label : undefined}
      className={cn(
        variant === "primary" ? "yd-auth-btn-primary" : "yd-auth-btn-secondary",
        props.className
      )}
      style={isActivePending ? props.pendingStyle : props.style}
    >
      {isActivePending ? (
        <span className={`inline-flex items-center justify-center ${props.pendingLabel?.trim() ? "gap-2" : ""}`}>
          <span className="yd-auth-loading-pulse !h-4 !w-4" aria-hidden />
          {props.pendingLabel?.trim() ? props.pendingLabel : null}
        </span>
      ) : (
        props.label
      )}
    </button>
  );
}
