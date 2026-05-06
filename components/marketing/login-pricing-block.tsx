"use client";

import Link from "next/link";

const PLANS = {
  monthly: {
    billing: "Monatlich abgerechnet",
    price: "20",
    totalLabel: null as string | null,
  },
  halfyearly: {
    billing: "Alle 6 Monate abgerechnet",
    price: "18",
    totalLabel: "108 alle 6 Monate",
  },
  yearly: {
    billing: "Jährlich abgerechnet",
    price: "16",
    totalLabel: "192 pro Jahr",
  },
} as const;

const FEATURES = [
  "Unbegrenzte Fallaufnahmen",
  "DSGVO-konforme Datenspeicherung",
  "Automatische Backups",
  "Mobile App (iOS & Android)",
  "Exportfunktion (PDF, CSV)",
  "Team-Verwaltung",
  "Kostenlose Updates",
  "Sicheres Cloud-Hosting",
] as const;

const FAQ = [
  {
    q: "Kann ich meinen Plan später ändern?",
    a: "Ja, Sie können jederzeit zu einem anderen Plan wechseln. Die Änderung wird zum nächsten Abrechnungszeitraum wirksam.",
  },
  {
    q: "Wie funktioniert die 14-tägige Testphase?",
    a: "Nach der Registrierung haben Sie 14 Tage vollen Zugriff auf alle Funktionen. Ihre Kreditkarte wird erst nach Ablauf der Testphase belastet.",
  },
  {
    q: "Welche Zahlungsmethoden akzeptieren Sie?",
    a: "Wir akzeptieren alle gängigen Kreditkarten (Visa, Mastercard, Amex), SEPA-Lastschrift und PayPal.",
  },
] as const;

export function LoginPricingBlock() {
  return (
    <section
      className="w-full bg-white px-6 py-10 lg:px-12 xl:px-16"
      aria-labelledby="login-pricing-heading"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 text-center">
          <h2
            id="login-pricing-heading"
            className="mb-3 text-[36px] font-semibold tracking-tight text-gray-900"
          >
            Einfache, transparente Preise
          </h2>
          <p className="mx-auto max-w-xl text-[16px] text-gray-600">
            Alle Pläne beinhalten den vollen Funktionsumfang. Wählen Sie einfach
            Ihren Abrechnungszeitraum.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-[13px] text-gray-600">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>14 Tage kostenlos testen</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Jederzeit kündbar</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>30 Tage Geld-zurück-Garantie</span>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          <div className="flex flex-col rounded-2xl border-2 border-gray-200 bg-white p-6 transition-all duration-200 hover:border-[#0284C7] hover:shadow-lg">
            <div className="h-[20px]" />
            <h3 className="mb-1 text-[20px] font-semibold text-gray-900">
              Monatlich
            </h3>
            <p className="mb-6 text-[13px] text-gray-500">
              {PLANS.monthly.billing}
            </p>
            <div className="mb-2">
              <span className="text-[40px] font-semibold text-gray-900">
                €{PLANS.monthly.price}
              </span>
              <span className="ml-1 text-[16px] text-gray-500">/Monat</span>
            </div>
            <div className="mb-8 h-[20px]" />
            <Link
              href="/register?plan=monthly"
              className="mt-auto inline-flex h-[48px] w-full items-center justify-center rounded-xl border-2 border-gray-900 bg-white text-[15px] font-semibold text-gray-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-900 hover:text-white active:scale-[0.98]"
            >
              Jetzt starten
            </Link>
          </div>

          <div className="relative flex flex-col rounded-2xl border-2 border-gray-200 bg-white p-6 transition-all duration-200 hover:border-[#0284C7] hover:shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-[#F59E0B] px-3 py-1 text-[11px] font-semibold text-white">
                SPARE 10%
              </span>
            </div>
            <div className="h-[20px]" />
            <h3 className="mb-1 text-[20px] font-semibold text-gray-900">
              Halbjährlich
            </h3>
            <p className="mb-6 text-[13px] text-gray-500">
              {PLANS.halfyearly.billing}
            </p>
            <div className="mb-2">
              <span className="text-[40px] font-semibold text-gray-900">
                €{PLANS.halfyearly.price}
              </span>
              <span className="ml-1 text-[16px] text-gray-500">/Monat</span>
            </div>
            <div className="mb-8 flex h-[20px] items-center justify-start">
              <span className="text-[12px] text-gray-500">
                €{PLANS.halfyearly.totalLabel}
              </span>
            </div>
            <Link
              href="/register?plan=halfyearly"
              className="mt-auto inline-flex h-[48px] w-full items-center justify-center rounded-xl border-2 border-gray-900 bg-white text-[15px] font-semibold text-gray-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-900 hover:text-white active:scale-[0.98]"
            >
              Jetzt starten
            </Link>
          </div>

          <div className="relative flex flex-col rounded-2xl border-2 border-[#0284C7] bg-white p-6 shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="login-pricing-badge-pulse rounded-full bg-gradient-to-r from-[#0284C7] to-[#0369A1] px-3 py-1 text-[11px] font-semibold text-white">
                BELIEBTESTE WAHL
              </span>
            </div>
            <div className="h-[20px]" />
            <h3 className="mb-1 text-[20px] font-semibold text-gray-900">
              Jährlich
            </h3>
            <p className="mb-6 text-[13px] text-gray-500">
              {PLANS.yearly.billing}
            </p>
            <div className="mb-2">
              <span className="text-[40px] font-semibold text-[#0284C7]">
                €{PLANS.yearly.price}
              </span>
              <span className="ml-1 text-[16px] text-gray-500">/Monat</span>
            </div>
            <div className="mb-8 flex h-[20px] items-center justify-start">
              <span className="text-[12px] text-gray-500">
                €{PLANS.yearly.totalLabel}
              </span>
            </div>
            <Link
              href="/register?plan=yearly"
              className="mt-auto inline-flex h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#0284C7] to-[#0369A1] text-[15px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-gradient-to-b hover:from-[#0369A1] hover:to-[#075985] hover:shadow-lg motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.02] active:scale-[0.98]"
            >
              Jetzt starten
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-6">
          <h3 className="mb-6 text-center text-[20px] font-semibold text-gray-900">
            Alle Pläne beinhalten
          </h3>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 shrink-0 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-[14px] text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="mb-6 text-[13px] text-gray-500">
            Vertrauen Sie der Nr. 1 Plattform für Zahnärzte
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12">
            <div>
              <div className="text-[24px] font-semibold text-gray-900">
                2.500+
              </div>
              <div className="text-[12px] text-gray-500">Zahnarztpraxen</div>
            </div>
            <div>
              <div className="text-[24px] font-semibold text-gray-900">
                99,9%
              </div>
              <div className="text-[12px] text-gray-500">Uptime</div>
            </div>
            <div>
              <div className="text-[24px] font-semibold text-gray-900">
                4,9/5
              </div>
              <div className="text-[12px] text-gray-500">★★★★★ Bewertung</div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-2xl">
          <h3 className="mb-8 text-center text-[24px] font-semibold text-gray-900">
            Häufig gestellte Fragen
          </h3>
          <div className="space-y-6">
            {FAQ.map((item) => (
              <div key={item.q}>
                <h4 className="mb-2 text-[15px] font-semibold text-gray-900">
                  {item.q}
                </h4>
                <p className="text-[14px] text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
