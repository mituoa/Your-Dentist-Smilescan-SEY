import Link from "next/link";
import { Check } from "lucide-react";
import { getPublicDocProfileOrRedirect } from "@/lib/doc/resolve-public-doc-profile";

interface SuccessPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UploadSuccessPage({ params }: SuccessPageProps) {
  const { slug: urlSlug } = await params;
  const profile = await getPublicDocProfileOrRedirect(urlSlug, "/upload/success");

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

        {profile.slug && (
          <Link
            href={`/doc/${profile.slug}`}
            className="text-sm text-brand hover:underline"
          >
            Zurück zum Profil
          </Link>
        )}
      </div>
    </div>
  );
}
