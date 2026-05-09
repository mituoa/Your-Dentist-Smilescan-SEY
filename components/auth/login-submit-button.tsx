"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-lg px-4 text-[14px] font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-sm bg-[linear-gradient(to_bottom,#0284C7_0%,#0369A1_100%)] hover:bg-[linear-gradient(to_bottom,#0369A1_0%,#075985_100%)] lg:mt-6 lg:h-[56px] lg:rounded-xl lg:text-[15px]"
      style={
        pending
          ? {
              background: "linear-gradient(to bottom, #0369A1 0%, #075985 100%)",
            }
          : undefined
      }
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
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
          Wird angemeldet...
        </span>
      ) : (
        "Anmelden"
      )}
    </button>
  );
}

