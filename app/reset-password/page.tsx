import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const tokenHash = params.token_hash?.trim() || null;
  const type = params.type?.trim() || null;

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-light tracking-tight text-text-primary">
            SmileScan
          </h1>
        </div>
        <ResetPasswordForm
          tokenHashFromQuery={tokenHash}
          typeFromQuery={type}
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
