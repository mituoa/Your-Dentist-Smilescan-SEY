"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type LoginPasswordFieldProps = {
  id?: string;
  name?: string;
  disabled?: boolean;
  defaultValue?: string;
};

export function LoginPasswordField({
  id = "password",
  name = "password",
  disabled = false,
  defaultValue,
}: LoginPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        placeholder="Passwort"
        autoComplete="current-password"
        className="yd-auth-input pr-10"
        required
        disabled={disabled}
        defaultValue={defaultValue}
      />
      <button
        type="button"
        className="absolute right-3.5 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#94A3B8] transition hover:text-[#1a4f9c] disabled:opacity-60"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? "Passwort verbergen" : "Passwort anzeigen"}
        tabIndex={-1}
      >
        {visible ? (
          <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        ) : (
          <Eye className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        )}
      </button>
    </div>
  );
}
