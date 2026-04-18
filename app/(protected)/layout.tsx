import { requireUser } from "@/lib/auth-helpers";
import { signOut } from "../(auth)/actions";
import { Button } from "@/components/ui/button";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-surface-page">
      <header className="border-b border-border bg-surface-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-serif text-xl font-light text-text-primary">
            SmileScan
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{user.email}</span>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                Abmelden
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
