"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

/** „Zurück“ im gleichen Formular wie der Server-Action-Submit — während `pending` sperren (Doppelklick / Navigationschaos). */
export function RegisterFormBackButton(props: {
  onBack: () => void;
  className: string;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="button"
      onClick={props.onBack}
      disabled={pending}
      aria-busy={pending}
      className={props.className}
    >
      {props.children}
    </button>
  );
}
