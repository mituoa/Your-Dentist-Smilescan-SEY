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
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <Check className="h-8 w-8 text-brand" strokeWidth={2} />
        </div>

        <h1 className="mb-4 font-serif text-[clamp(1.75rem,6vw,2.25rem)] font-light leading-tight tracking-tight text-text-primary sm:text-4xl">
          Unterlagen eingegangen
        </h1>

        <p className="mb-2 text-[15px] leading-relaxed text-text-secondary sm:text-base">
          Ihre Einsendung wurde bei {practiceName} registriert.
        </p>
        <p className="mb-8 text-[15px] leading-relaxed text-text-secondary sm:text-base">
          Sie erhalten in Kürze eine Bestätigung per E-Mail, sofern Ihre
          Adresse korrekt angegeben wurde.
        </p>

        {profile.slug && (
          <Link
            href={`/doc/${profile.slug}`}
            className="inline-flex min-h-[44px] items-center justify-center text-sm font-medium text-brand underline-offset-4 hover:underline"
          >
            Zurück zum Profil
          </Link>
        )}
      </div>
    </div>
  );
}
