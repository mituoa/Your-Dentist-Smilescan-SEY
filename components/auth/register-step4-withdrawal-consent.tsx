"use client";

import { RegisterStep4Checkbox } from "@/components/auth/register-step4-checkbox";

const WITHDRAWAL_LEGAL_TEXT =
  "Ich verlange ausdrücklich, dass Your Dentist vor Ablauf der Widerrufsfrist mit der Leistung beginnt, und bestätige, dass ich dadurch mein Widerrufsrecht verlieren kann.";

type RegisterStep4WithdrawalConsentProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function RegisterStep4WithdrawalConsent({ checked, onChange }: RegisterStep4WithdrawalConsentProps) {
  return (
    <div className="space-y-1">
      <RegisterStep4Checkbox
        checked={checked}
        onChange={onChange}
        ariaLabel={WITHDRAWAL_LEGAL_TEXT}
      >
        Sofortige Bereitstellung bestätigen
      </RegisterStep4Checkbox>
      <details className="group ml-[26px]">
        <summary className="cursor-pointer list-none text-[11px] font-medium text-slate-500 underline decoration-slate-300/80 underline-offset-2 hover:text-slate-700 [&::-webkit-details-marker]:hidden">
          Rechtliche Erläuterung
        </summary>
        <p className="mt-2 max-w-prose text-[11px] leading-relaxed text-slate-600">{WITHDRAWAL_LEGAL_TEXT}</p>
      </details>
    </div>
  );
}
