import Link from "next/link";

export default function AgbPage() {
  return (
    <main className="min-h-screen bg-surface-page px-6 py-16 text-text-primary">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-6 font-serif text-4xl font-light tracking-tight">Allgemeine Geschäftsbedingungen</h1>
        <div className="prose prose-slate max-w-none">
          <p>Platzhalter. Bitte ersetzen durch eure finalen AGB.</p>
          <p>
            Für den Vertragsabschluss in der Registrierung wird auf diese Seite verlinkt.
          </p>
          <p>
            Optional könnt ihr auch die{" "}
            <Link href="/widerruf" className="text-[#0284C7] hover:underline">
              Widerrufsbelehrung
            </Link>{" "}
            hier verlinken.
          </p>
        </div>
      </div>
    </main>
  );
}

