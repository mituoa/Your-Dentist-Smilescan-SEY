"use client";

import { getPasswordRequirements, getPasswordStrengthDisplay, PASSWORD_STRENGTH_COLOR } from "@/lib/auth/register-validation";

type RegisterPasswordGuidanceProps = {
  password: string;
};

export function RegisterPasswordGuidance({ password }: RegisterPasswordGuidanceProps) {
  if (!password) return null;

  const requirements = getPasswordRequirements(password);
  const strength = getPasswordStrengthDisplay(password);

  return (
    <div className="mt-3 space-y-3">
      <ul className="space-y-1.5" aria-label="Passwort-Anforderungen">
        {requirements.map((req) => (
          <li
            key={req.id}
            className={`flex items-start gap-2 text-[12px] leading-snug ${
              req.met ? "text-green-700" : "text-slate-500"
            }`}
          >
            <span className="mt-px w-3 shrink-0 text-center" aria-hidden>
              {req.met ? "✓" : "○"}
            </span>
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
      {strength ? (
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${strength.barPct}%`,
                backgroundColor: PASSWORD_STRENGTH_COLOR[strength.tier],
              }}
            />
          </div>
          <span
            className="text-[11px] font-medium tabular-nums"
            style={{ color: PASSWORD_STRENGTH_COLOR[strength.tier] }}
          >
            {strength.label}
          </span>
        </div>
      ) : null}
    </div>
  );
}
