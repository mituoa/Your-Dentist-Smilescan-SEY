import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page px-6">
      <div className="max-w-md text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">
          Seite nicht gefunden
        </p>
        <h1 className="mb-4 font-serif text-3xl font-light tracking-tight text-text-primary sm:text-4xl">
          Diese Seite existiert nicht.
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-text-secondary">
          Die angeforderte Seite ist nicht verfügbar. Möglicherweise wurde sie
          verschoben oder entfernt.
        </p>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-6 text-sm font-medium text-brand underline-offset-4 hover:underline"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
