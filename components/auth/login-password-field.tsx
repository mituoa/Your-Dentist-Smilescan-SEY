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
    <div className="yd-login-field-wrap">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        placeholder="Passwort"
        autoComplete="current-password"
        className="yd-login-field yd-login-field--with-icon"
        required
        disabled={disabled}
        defaultValue={defaultValue}
      />
      <button
        type="button"
        className="yd-login-field-icon-btn"
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
