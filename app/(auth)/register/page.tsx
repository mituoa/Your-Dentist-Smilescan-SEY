import Link from "next/link";
import { signUp } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInvitationByToken } from "@/lib/team-invitations/get-invitation-by-token";

interface RegisterPageProps {
  searchParams: Promise<{ invite?: string; email?: string; error?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const inviteToken = params.invite?.trim() || "";
  const prefilledEmail = params.email?.trim() || "";
  const queryError = params.error;
  const invitation = inviteToken
    ? await getInvitationByToken(inviteToken)
    : null;

  return (
    <div className="bg-surface-card border border-border rounded-lg p-8">
      <h2 className="font-serif text-2xl font-light mb-2 text-text-primary">
        Konto anlegen
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        Für Zahnärzte in geschlossener Beta.
      </p>

      {queryError && (
        <p className="text-sm text-danger mb-4">{decodeURIComponent(queryError)}</p>
      )}

      <form action={signUp} className="space-y-4">
        {inviteToken ? (
          <input type="hidden" name="invite_token" value={inviteToken} />
        ) : null}

        {inviteToken ? (
          <p className="text-sm text-text-secondary rounded-md border border-border bg-surface-sunken px-3 py-2">
            Sie treten einem bestehenden Workspace bei.
            {invitation ? (
              <>
                {" "}
                <span className="font-medium text-text-primary">
                  {invitation.workspaceName}
                </span>
              </>
            ) : null}
          </p>
        ) : null}

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

        {!inviteToken ? (
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
        ) : null}

        <div>
          <Label htmlFor="email">E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="doc@praxis.de"
            defaultValue={prefilledEmail}
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
        <Link
          href={
            inviteToken
              ? `/login?invite=${encodeURIComponent(inviteToken)}${prefilledEmail ? `&email=${encodeURIComponent(prefilledEmail)}` : ""}`
              : "/login"
          }
          className="text-brand hover:underline"
        >
          Anmelden
        </Link>
      </p>
    </div>
  );
}
