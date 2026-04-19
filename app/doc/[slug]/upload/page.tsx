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
    <div className="max-w-xl mx-auto px-6 py-12">
      <Link
        href={`/doc/${profile.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-8"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        Zurück zum Profil
      </Link>

      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Einsendung
        </p>
        <h1 className="font-serif text-4xl font-light tracking-tight text-text-primary mb-3">
          Unterlagen einreichen
        </h1>
        <p className="text-sm text-text-secondary">
          Ihre Daten werden verschlüsselt an{" "}
          <strong>{practiceName}</strong> übermittelt.
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
