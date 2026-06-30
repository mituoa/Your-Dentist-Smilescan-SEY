import Link from "next/link";

import { PatientCommandAssist } from "@/components/command-assist/patient-command-assist";
import { getPublicDocProfileOrRedirect } from "@/lib/doc/resolve-public-doc-profile";

type PatientAssistPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PatientAssistPage({ params }: PatientAssistPageProps) {
  const { slug } = await params;
  const profile = await getPublicDocProfileOrRedirect(slug, "/assist");

  return (
    <div className="min-h-[100dvh] bg-[#F4F7FB] px-4 py-8">
      <div className="mx-auto mb-6 max-w-lg">
        <Link
          href={`/doc/${profile.slug}`}
          className="text-[13px] font-medium text-[#2563EB] underline-offset-2 hover:underline"
        >
          ← Zurück zur Praxis
        </Link>
      </div>
      <PatientCommandAssist slug={profile.slug} practiceName={profile.workspace_name} />
    </div>
  );
}
