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
  variant?: "default" | "checkout";
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
  variant = "default",
}: RegisterStep4PaymentSetupProps) {
  const invoiceDisabled = selectedPlan === "monthly";
  const isCheckout = variant === "checkout";

  const methodButtonClass = (active: boolean, extra?: string) =>
    cn(
      isCheckout ? "yd-reg-checkout__pay-option" : "flex min-h-[44px] w-full items-center justify-center rounded-lg border px-3 text-[13px] font-medium transition-colors duration-150",
      isCheckout
        ? active
          ? "yd-reg-checkout__pay-option--active"
          : "yd-reg-checkout__pay-option--idle"
        : active
          ? "yd-reg-step4-pay--selected text-slate-900"
          : "yd-reg-step4-pay--idle text-slate-700",
      extra
    );

  const fieldShellClass = isCheckout
    ? "yd-reg-checkout__pay-fields"
    : "space-y-3 rounded-xl border border-slate-200/90 bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]";

  return (
    <div className={isCheckout ? "yd-reg-checkout__pay" : "space-y-3"}>
      <div className={isCheckout ? "yd-reg-checkout__pay-options" : "flex flex-col gap-2"}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onMethodChange("sepa_debit")}
          className={methodButtonClass(method === "sepa_debit")}
        >
          SEPA Lastschrift
        </button>
        <button
          type="button"
          disabled={disabled || invoiceDisabled}
          onClick={() => onMethodChange("invoice")}
          className={methodButtonClass(
            method === "invoice",
            invoiceDisabled ? "cursor-not-allowed opacity-45" : undefined
          )}
        >
          Rechnung
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onMethodChange("card")}
          className={methodButtonClass(method === "card")}
        >
          Karte
        </button>
      </div>
      {invoiceDisabled && method !== "invoice" ? (
        <p className={isCheckout ? "yd-reg-checkout__pay-hint" : "text-[11px] leading-relaxed text-slate-500"}>
          Rechnung ist ab Halbjahres- oder Jahrestarif verfügbar.
        </p>
      ) : null}

      {method === "sepa_debit" ? (
        <div className={fieldShellClass}>
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
        <div className={fieldShellClass}>
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
        <p className={isCheckout ? "yd-reg-checkout__pay-hint" : "text-[11px] leading-relaxed text-slate-500"}>
          Kartenzahlung im nächsten Schritt nach Freischaltung.
        </p>
      ) : null}
    </div>
  );
}
