import Link from "next/link";
import { signUp } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  return (
    <div className="bg-surface-card border border-border rounded-lg p-8">
      <h2 className="font-serif text-2xl font-light mb-2 text-text-primary">
        Konto anlegen
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        Für Zahnärzte in geschlossener Beta.
      </p>

      <form action={signUp} className="space-y-4">
        <div>
          <Label htmlFor="display_name">Vollständiger Name</Label>
          <Input
            id="display_name"
            name="display_name"
            type="text"
            required
            placeholder="Dr. med. dent. Jane Doe"
          />
        </div>

        <div>
          <Label htmlFor="workspace_name">Praxis-Name</Label>
          <Input
            id="workspace_name"
            name="workspace_name"
            type="text"
            required
            placeholder="Zahnarztpraxis am Rathausplatz"
          />
        </div>

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
            minLength={8}
            autoComplete="new-password"
          />
          <p className="text-xs text-text-tertiary mt-1">
            Mindestens 8 Zeichen.
          </p>
        </div>

        <Button type="submit" className="w-full">
          Konto anlegen
        </Button>
      </form>

      <p className="mt-6 text-sm text-text-secondary text-center">
        Schon ein Konto?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
