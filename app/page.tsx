import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface-page text-text-primary flex items-center justify-center">
      <div className="text-center max-w-xl px-6">
        <h1 className="font-serif text-6xl font-light tracking-tight mb-4">
          SmileScan
        </h1>
        <p className="text-text-secondary mb-8">
          Die diskrete Brücke zwischen Beobachtung und klinischer Versorgung.
        </p>
        <div className="flex gap-3 justify-center">
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
    </main>
  );
}
