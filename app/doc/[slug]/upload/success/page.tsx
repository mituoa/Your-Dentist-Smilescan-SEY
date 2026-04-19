import Link from "next/link";
import { Check } from "lucide-react";
import { getPublicProfileBySlug } from "@/lib/queries/public-profile";

interface SuccessPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UploadSuccessPage({ params }: SuccessPageProps) {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);

  const practiceName =
    profile?.practice_name || profile?.display_name || "der Praxis";

  return (
    <div className="max-w-xl mx-auto px-6 py-20">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/10 mb-6">
          <Check className="w-8 h-8 text-brand" strokeWidth={2} />
        </div>

        <h1 className="font-serif text-4xl font-light tracking-tight text-text-primary mb-4">
          Unterlagen eingegangen
        </h1>

        <p className="text-text-secondary leading-relaxed mb-2">
          Ihre Einsendung wurde bei {practiceName} registriert.
        </p>
        <p className="text-text-secondary leading-relaxed mb-8">
          Eine Bestätigung haben wir an Ihre E-Mail-Adresse gesendet.
        </p>

        {slug && (
          <Link
            href={`/doc/${slug}`}
            className="text-sm text-brand hover:underline"
          >
            Zurück zum Profil
          </Link>
        )}
      </div>
    </div>
  );
}
