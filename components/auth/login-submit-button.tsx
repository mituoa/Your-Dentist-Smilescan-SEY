"use client";

import { useFormStatus } from "react-dom";

import { useLocale } from "@/components/i18n/locale-provider";
import { YdInlineBusy } from "@/components/design-system/yd-skeleton";

export function LoginSubmitButton(props: { disabledExternal?: boolean }) {
  const { messages } = useLocale();
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
        <YdInlineBusy inverse />
        <span>{messages.login.submitPending}</span>
      </span>
      <span
        className={
          "absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
          (pending ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0")
        }
        aria-hidden={pending}
      >
        {messages.login.submit}
      </span>
    </button>
  );
}
