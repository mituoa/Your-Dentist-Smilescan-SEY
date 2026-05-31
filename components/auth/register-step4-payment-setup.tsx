"use client";

import { cn } from "@/lib/utils";

export type RegisterStep4PaymentMethod = "sepa_debit" | "invoice" | "card";

export type RegisterStep4PaymentFields = {
  sepaAccountHolder: string;
  sepaIban: string;
  invoiceName: string;
  invoiceAddress: string;
  invoicePostalCity: string;
  invoiceVatId: string;
};

type RegisterStep4PaymentSetupProps = {
  method: RegisterStep4PaymentMethod;
  onMethodChange: (method: RegisterStep4PaymentMethod) => void;
  selectedPlan: "monthly" | "halfyearly" | "yearly";
  fields: RegisterStep4PaymentFields;
  onFieldChange: (field: keyof RegisterStep4PaymentFields, value: string) => void;
  disabled?: boolean;
};

export function isRegisterStep4PaymentSetupValid(
  method: RegisterStep4PaymentMethod,
  selectedPlan: "monthly" | "halfyearly" | "yearly",
  fields: RegisterStep4PaymentFields
): boolean {
  if (method === "sepa_debit") {
    const iban = fields.sepaIban.replace(/\s/g, "");
    return fields.sepaAccountHolder.trim().length >= 2 && iban.length >= 15;
  }
  if (method === "invoice") {
    if (selectedPlan === "monthly") return false;
    return (
      fields.invoiceName.trim().length >= 2 &&
      fields.invoiceAddress.trim().length >= 3 &&
      fields.invoicePostalCity.trim().length >= 4
    );
  }
  return true;
}

export function RegisterStep4PaymentSetup({
  method,
  onMethodChange,
  selectedPlan,
  fields,
  onFieldChange,
  disabled = false,
}: RegisterStep4PaymentSetupProps) {
  const invoiceDisabled = selectedPlan === "monthly";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onMethodChange("sepa_debit")}
          className={cn(
            "flex min-h-[44px] w-full items-center justify-center rounded-lg border px-3 text-[13px] font-medium transition-colors duration-150",
            method === "sepa_debit"
              ? "yd-reg-step4-pay--selected text-slate-900"
              : "yd-reg-step4-pay--idle text-slate-700"
          )}
        >
          SEPA Lastschrift
        </button>
        <button
          type="button"
          disabled={disabled || invoiceDisabled}
          onClick={() => onMethodChange("invoice")}
          className={cn(
            "flex min-h-[44px] w-full items-center justify-center rounded-lg border px-3 text-[13px] font-medium transition-colors duration-150",
            invoiceDisabled
              ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400"
              : method === "invoice"
                ? "yd-reg-step4-pay--selected text-slate-900"
                : "yd-reg-step4-pay--idle text-slate-700"
          )}
        >
          Rechnung
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onMethodChange("card")}
          className={cn(
            "flex min-h-[44px] w-full items-center justify-center rounded-lg border px-3 text-[13px] font-medium transition-colors duration-150",
            method === "card"
              ? "yd-reg-step4-pay--selected text-slate-900"
              : "yd-reg-step4-pay--idle text-slate-700"
          )}
        >
          Karte
        </button>
      </div>

      {method === "sepa_debit" ? (
        <div className="space-y-3 rounded-xl border border-slate-200/90 bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div>
            <label htmlFor="reg-sepa-holder" className="mb-1.5 block text-[12px] font-medium text-slate-700">
              Kontoinhaber
            </label>
            <input
              id="reg-sepa-holder"
              name="sepa_account_holder"
              type="text"
              autoComplete="name"
              disabled={disabled}
              value={fields.sepaAccountHolder}
              onChange={(e) => onFieldChange("sepaAccountHolder", e.target.value)}
              className="yd-auth-input h-[48px] text-[16px]"
            />
          </div>
          <div>
            <label htmlFor="reg-sepa-iban" className="mb-1.5 block text-[12px] font-medium text-slate-700">
              IBAN
            </label>
            <input
              id="reg-sepa-iban"
              name="sepa_iban"
              type="text"
              inputMode="text"
              autoComplete="off"
              disabled={disabled}
              value={fields.sepaIban}
              onChange={(e) => onFieldChange("sepaIban", e.target.value)}
              className="yd-auth-input h-[48px] font-mono text-[16px] tracking-wide"
              placeholder="DE00 0000 0000 0000 0000 00"
            />
          </div>
        </div>
      ) : null}

      {method === "invoice" && !invoiceDisabled ? (
        <div className="space-y-3 rounded-xl border border-slate-200/90 bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div>
            <label htmlFor="reg-invoice-name" className="mb-1.5 block text-[12px] font-medium text-slate-700">
              Praxis / Rechnungsname
            </label>
            <input
              id="reg-invoice-name"
              name="invoice_name"
              type="text"
              disabled={disabled}
              value={fields.invoiceName}
              onChange={(e) => onFieldChange("invoiceName", e.target.value)}
              className="yd-auth-input h-[48px] text-[16px]"
            />
          </div>
          <div>
            <label htmlFor="reg-invoice-address" className="mb-1.5 block text-[12px] font-medium text-slate-700">
              Adresse
            </label>
            <input
              id="reg-invoice-address"
              name="invoice_address"
              type="text"
              disabled={disabled}
              value={fields.invoiceAddress}
              onChange={(e) => onFieldChange("invoiceAddress", e.target.value)}
              className="yd-auth-input h-[48px] text-[16px]"
            />
          </div>
          <div>
            <label htmlFor="reg-invoice-plz" className="mb-1.5 block text-[12px] font-medium text-slate-700">
              PLZ Ort
            </label>
            <input
              id="reg-invoice-plz"
              name="invoice_postal_city"
              type="text"
              disabled={disabled}
              value={fields.invoicePostalCity}
              onChange={(e) => onFieldChange("invoicePostalCity", e.target.value)}
              className="yd-auth-input h-[48px] text-[16px]"
            />
          </div>
          <div>
            <label htmlFor="reg-invoice-vat" className="mb-1.5 block text-[12px] font-medium text-slate-700">
              USt-ID <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <input
              id="reg-invoice-vat"
              name="invoice_vat_id"
              type="text"
              disabled={disabled}
              value={fields.invoiceVatId}
              onChange={(e) => onFieldChange("invoiceVatId", e.target.value)}
              className="yd-auth-input h-[48px] text-[16px]"
            />
          </div>
        </div>
      ) : null}

      {method === "card" ? (
        <div
          className="rounded-xl border border-dashed border-slate-200/90 bg-slate-50/50 px-4 py-6 text-center"
          aria-hidden={false}
        >
          <p className="text-[12px] leading-relaxed text-slate-600">
            Kartendaten werden nach Freischaltung sicher im nächsten Schritt erfasst.
          </p>
        </div>
      ) : null}
    </div>
  );
}
