import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ProfileCTAProps {
  slug: string;
}

export function ProfileCTA({ slug }: ProfileCTAProps) {
  return (
    <section className="py-20 px-6 border-t border-border bg-surface-card">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-4xl font-light text-text-primary mb-4">
          Unterlagen einreichen
        </h2>
        <p className="text-text-secondary mb-8">
          Senden Sie Ihre Fotos direkt und diskret an die Praxis.
        </p>
        <Link
          href={`/doc/${slug}/upload`}
          className="inline-flex items-center gap-2 h-12 px-8 bg-brand text-white rounded hover:bg-brand-glow transition-colors font-medium"
        >
          Jetzt einsenden
          <ArrowRight className="w-4 h-4" strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}
