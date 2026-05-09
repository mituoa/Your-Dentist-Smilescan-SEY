import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublicDocProfileOrRedirect } from "@/lib/doc/resolve-public-doc-profile";
import { UploadForm } from "@/components/public/upload-form";

interface UploadPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UploadPage({ params }: UploadPageProps) {
  const { slug: urlSlug } = await params;
  const profile = await getPublicDocProfileOrRedirect(urlSlug, "/upload");

  const practiceName =
    profile.practice_name || profile.display_name || "Zahnarztpraxis";

  return (
    <div className="mx-auto max-w-xl px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-12">
      <Link
        href={`/doc/${profile.slug}`}
        className="mb-6 inline-flex min-h-[44px] items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary sm:mb-8"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        Zurück zum Profil
      </Link>

      <div className="mb-8 sm:mb-10">
        <p className="mb-2 text-[11px] font-mono uppercase tracking-wider text-text-tertiary sm:mb-3 sm:text-xs">
          Einsendung
        </p>
        <h1 className="mb-3 font-serif text-[clamp(1.75rem,6vw,2.25rem)] font-light leading-tight tracking-tight text-text-primary sm:text-4xl">
          Unterlagen einreichen
        </h1>
        <p className="text-[15px] leading-relaxed text-text-secondary sm:text-sm">
          Ihre Daten werden verschlüsselt an{" "}
          <strong className="font-medium text-text-primary">{practiceName}</strong>{" "}
          übermittelt.
        </p>
      </div>

      <UploadForm
        slug={profile.slug}
        practiceName={practiceName}
        workspaceId={profile.workspace_id}
      />
    </div>
  );
}
