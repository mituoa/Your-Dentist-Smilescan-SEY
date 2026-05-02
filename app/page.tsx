import Link from "next/link";

import { PricingSection } from "@/components/marketing/pricing-section";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-surface-page text-text-primary">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="max-w-xl text-center">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">
            Your Dentist ecosystem
          </p>
          <h1 className="mb-4 font-serif text-6xl font-light tracking-tight">SmileScan</h1>
          <p className="mb-8 text-text-secondary">
            Visuelle Aufnahme und Triage im Your Dentist Markenverbund - zusammen mit
            Journals und Relay.
          </p>
          <div className="mb-8 flex flex-wrap justify-center gap-2 text-xs text-text-tertiary">
            <span className="rounded-full border border-border px-3 py-1">Your Dentist</span>
            <span className="rounded-full border border-border px-3 py-1">SmileScan</span>
            <span className="rounded-full border border-border px-3 py-1">Journals</span>
            <span className="rounded-full border border-border px-3 py-1">Relay</span>
          </div>
          <div className="flex justify-center gap-3">
            <Link href="/login">
              <Button variant="secondary">Anmelden</Button>
            </Link>
            <Link href="/register">
              <Button>Konto anlegen</Button>
            </Link>
          </div>
          <p className="mt-8 text-xs text-text-tertiary">
            In geschlossener Beta für Zahnärzte.
          </p>
        </div>
      </div>

      <PricingSection />
    </main>
  );
}
