import Link from "next/link";
import { signIn } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <div className="bg-surface-card border border-border rounded-lg p-8">
      <h2 className="font-serif text-2xl font-light mb-2 text-text-primary">
        Anmelden
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        Willkommen zurück.
      </p>

      <form action={signIn} className="space-y-4">
        <div>
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="doc@praxis.de"
          />
        </div>

        <div>
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" className="w-full">
          Anmelden
        </Button>
      </form>

      <p className="mt-6 text-sm text-text-secondary text-center">
        Noch kein Konto?{" "}
        <Link href="/register" className="text-brand hover:underline">
          Registrieren
        </Link>
      </p>
    </div>
  );
}
