import Link from "next/link";
import { redirect } from "next/navigation";
import { acceptInvitation } from "@/app/(protected)/settings/actions";

interface AcceptInvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({
  searchParams,
}: AcceptInvitePageProps) {
  const { token } = await searchParams;
  if (!token) redirect("/login");

  const result = await acceptInvitation(token);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-surface-card border border-border rounded-lg p-8 text-center space-y-4">
        {result.success && (
          <>
            <h1 className="font-serif text-3xl font-light">
              Einladung angenommen
            </h1>
            <p className="text-text-secondary">
              Sie sind jetzt Mitglied des Workspaces.
            </p>
            <Link
              href="/dashboard"
              className="inline-block text-sm text-brand hover:underline"
            >
              Zum Dashboard →
            </Link>
          </>
        )}
        {result.needsSignup && (
          <>
            <h1 className="font-serif text-3xl font-light">Account erstellen</h1>
            <p className="text-text-secondary">
              Sie wurden eingeladen. Bitte registrieren Sie sich mit{" "}
              <strong>{result.email}</strong>, um beizutreten.
            </p>
            <Link
              href={`/register?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(result.email!)}`}
              className="inline-block px-6 py-2.5 bg-ink text-cream rounded text-sm hover:bg-brand-glow transition-colors"
            >
              Registrieren
            </Link>
          </>
        )}
        {result.error && (
          <>
            <h1 className="font-serif text-3xl font-light">
              Einladung ungültig
            </h1>
            <p className="text-danger text-sm">{result.error}</p>
            <Link
              href="/login"
              className="inline-block text-sm text-brand hover:underline"
            >
              Zum Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
