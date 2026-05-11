import Link from "next/link";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { ResetPasswordForm } from "./ResetPasswordForm";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token_hash?: string; type?: string; invite?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const tokenHash = params.token_hash?.trim() || null;
  const type = params.type?.trim() || null;
  const invite = params.invite?.trim() || null;

  return (
    <div className="relative min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="pointer-events-none fixed left-3 top-3 z-50 md:left-4 md:top-4">
        <YourDentistBrandLockup size="sm" priority />
      </div>
      <div className="w-full max-w-md">
        <ResetPasswordForm
          tokenHashFromQuery={tokenHash}
          typeFromQuery={type}
          inviteTokenFromQuery={invite}
        />
        <p className="mt-6 text-sm text-text-secondary text-center">
          <Link href="/login" className="text-brand hover:underline">
            Zurück zum Login
          </Link>
        </p>
      </div>
    </div>
  );
}
