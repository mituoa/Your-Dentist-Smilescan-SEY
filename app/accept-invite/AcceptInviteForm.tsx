"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { acceptInvitation } from "@/app/(protected)/settings/actions";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export type AcceptInviteScenario = "invalid" | "A" | "B" | "C" | "D" | "E" | "F";

export type AcceptInviteFormProps = {
  token: string;
  scenario: AcceptInviteScenario;
  inviteEmail: string;
  practiceName: string;
  sessionEmail?: string;
  otherWorkspaceName?: string;
  invalidReason?: string;
};

export function AcceptInviteForm({
  token,
  scenario,
  inviteEmail,
  practiceName,
  sessionEmail,
  otherWorkspaceName,
  invalidReason,
}: AcceptInviteFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const returnToAccept = `/accept-invite?token=${encodeURIComponent(token)}`;
  const loginHref = `/login?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(inviteEmail)}`;
  const registerHref = `/register?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(inviteEmail)}`;

  function handleAccept() {
    setActionError(null);
    startTransition(async () => {
      const result = await acceptInvitation(token);
      if (!result.ok) {
        setActionError(result.error);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-surface-card border border-border rounded-lg p-8 text-center space-y-4">
        {scenario === "invalid" && (
          <>
            <h1 className="font-serif text-3xl font-light">Einladung ungültig</h1>
            <p className="text-danger text-sm">
              {invalidReason ?? "Diese Einladung ist nicht mehr gültig."}
            </p>
            <Link
              href="/login"
              className="inline-block text-sm text-brand hover:underline"
            >
              Zum Login
            </Link>
          </>
        )}

        {scenario === "A" && (
          <>
            <h1 className="font-serif text-3xl font-light">Team-Einladung</h1>
            <p className="text-text-secondary text-sm text-left">
              <strong>{practiceName}</strong> hat Sie eingeladen ({inviteEmail}). Es
              existiert noch kein Konto mit dieser E-Mail.
            </p>
            <Link
              href={registerHref}
              className="inline-flex w-full items-center justify-center h-10 px-4 text-sm font-medium rounded bg-brand text-white hover:bg-brand-glow transition-colors"
            >
              Account erstellen
            </Link>
          </>
        )}

        {scenario === "B" && (
          <>
            <h1 className="font-serif text-3xl font-light">Team-Einladung</h1>
            <p className="text-text-secondary text-sm text-left">
              <strong>{practiceName}</strong> hat Sie eingeladen. Ein Konto mit
              dieser E-Mail-Adresse existiert bereits bei SmileScan. Melden Sie
              sich an, um die Einladung anzunehmen.
            </p>
            <Link
              href={loginHref}
              className="inline-flex w-full items-center justify-center h-10 px-4 text-sm font-medium rounded bg-brand text-white hover:bg-brand-glow transition-colors"
            >
              Anmelden und beitreten
            </Link>
          </>
        )}

        {scenario === "C" && (
          <>
            <h1 className="font-serif text-3xl font-light">Einladung bestätigen</h1>
            <p className="text-text-secondary text-sm text-left">
              Sie wurden zu <strong>{practiceName}</strong> eingeladen (
              {inviteEmail}).
            </p>
            {actionError && (
              <p className="text-danger text-sm text-left">{actionError}</p>
            )}
            <Button
              type="button"
              className="w-full"
              disabled={pending}
              onClick={handleAccept}
            >
              {pending ? "Wird bearbeitet…" : "Einladung annehmen"}
            </Button>
          </>
        )}

        {scenario === "D" && (
          <>
            <h1 className="font-serif text-3xl font-light">Falsches Konto</h1>
            <p className="text-text-secondary text-sm text-left">
              Diese Einladung ist für <strong>{inviteEmail}</strong>. Sie sind als{" "}
              <strong>{sessionEmail}</strong> angemeldet. Bitte melden Sie sich ab.
            </p>
            <form action={signOut} className="w-full">
              <input type="hidden" name="return_to" value={returnToAccept} />
              <Button type="submit" variant="secondary" className="w-full">
                Abmelden
              </Button>
            </form>
          </>
        )}

        {scenario === "E" && (
          <>
            <h1 className="font-serif text-3xl font-light">Bereits anderer Workspace</h1>
            <p className="text-text-secondary text-sm text-left">
              Sie gehören bereits zu Workspace{" "}
              <strong>{otherWorkspaceName ?? "einer anderen Praxis"}</strong>. Sie
              können nicht gleichzeitig Mitglied zweier Workspaces sein. Bitte
              Workspace verlassen oder sich abmelden.
            </p>
            <form action={signOut} className="w-full">
              <input type="hidden" name="return_to" value={returnToAccept} />
              <Button type="submit" variant="secondary" className="w-full">
                Abmelden
              </Button>
            </form>
          </>
        )}

        {scenario === "F" && (
          <>
            <h1 className="font-serif text-3xl font-light">Bereits Mitglied</h1>
            <p className="text-text-secondary text-sm">
              Sie sind bereits Mitglied dieses Workspaces.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center h-10 px-4 text-sm font-medium rounded bg-brand text-white hover:bg-brand-glow transition-colors"
            >
              Zum Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
