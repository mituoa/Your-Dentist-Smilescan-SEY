"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { acceptInvitation } from "@/app/(protected)/settings/actions";
import { SignOutReturnForm } from "@/components/app-shell/sign-out-form";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
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

const primaryCtaClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-slate-700 px-4 py-3 text-[15px] font-medium text-white shadow-[0px_8px_22px_rgba(51,65,85,0.25)] transition-all duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700/30 focus-visible:ring-offset-2";

const glassCardClass =
  "relative flex flex-col gap-6 rounded-[18px] border border-white/30 bg-white/80 p-8 backdrop-blur-xl";

const glassCardShadow = {
  boxShadow: "0px 24px 64px rgba(15, 23, 42, 0.12)",
} as const;

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
      router.push(result.role === "doctor" ? "/dashboard" : "/my-tasks");
      router.refresh();
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-8 pt-24 md:pt-8">
      <div
        className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(148, 163, 184, 0.7) 0%, rgba(59, 130, 246, 0.55) 100%)",
          filter: "blur(150px)",
          transform: "translate(-25%, -25%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(99, 102, 241, 0.45) 100%)",
          filter: "blur(150px)",
          transform: "translate(25%, 25%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[500px]">
        <div className={glassCardClass} style={glassCardShadow}>
          <div className="mb-6 flex justify-center border-b border-slate-200/60 pb-5 sm:mb-7 sm:pb-6">
            <YourDentistBrandLockup
              size="sm"
              tagline="Neutral Practice Platform"
              centered
              priority
            />
          </div>
          {scenario === "invalid" && (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                  <AlertCircle className="h-8 w-8 text-red-600" aria-hidden />
                </div>
                <h1 className="font-serif text-3xl font-light tracking-tight text-[#111111] md:text-4xl">
                  Einladung ungültig
                </h1>
                <p className="max-w-sm text-base leading-relaxed text-danger">
                  {invalidReason ?? "Diese Einladung ist nicht mehr gültig."}
                </p>
              </div>
              <Link
                href="/login"
                className="flex h-[46px] w-full items-center justify-center rounded-[10px] bg-slate-100 text-[15px] font-medium text-slate-900 transition-all duration-200 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700/25 focus-visible:ring-offset-2"
              >
                Zum Login
              </Link>
            </div>
          )}

          {scenario === "A" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="font-serif text-3xl font-light tracking-tight text-[#111111] md:text-4xl">
                  Team-Einladung
                </h1>
                <p className="text-left text-sm leading-relaxed text-slate-600">
                  <strong className="font-semibold text-slate-900">{practiceName}</strong> hat
                  Sie eingeladen ({inviteEmail}). Es existiert noch kein Konto mit dieser E-Mail.
                </p>
              </div>
              <Link href={registerHref} className={`group ${primaryCtaClass}`}>
                Account erstellen
                <ArrowRight
                  className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          )}

          {scenario === "B" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="font-serif text-3xl font-light tracking-tight text-[#111111] md:text-4xl">
                  Team-Einladung
                </h1>
                <p className="text-left text-sm leading-relaxed text-slate-600">
                  <strong className="font-semibold text-slate-900">{practiceName}</strong> hat Sie
                  eingeladen. Für diese E-Mail-Adresse existiert bereits ein Konto.
                  Melden Sie sich an, um die Einladung anzunehmen.
                </p>
              </div>
              <Link href={loginHref} className={`group ${primaryCtaClass}`}>
                Anmelden und beitreten
                <ArrowRight
                  className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          )}

          {scenario === "C" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="font-serif text-3xl font-light tracking-tight text-[#111111] md:text-4xl">
                  Einladung bestätigen
                </h1>
                <p className="text-left text-sm leading-relaxed text-slate-600">
                  Sie wurden zu <strong className="font-semibold text-slate-900">{practiceName}</strong>{" "}
                  eingeladen ({inviteEmail}).
                </p>
              </div>
              {actionError && (
                <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-left text-sm leading-relaxed text-danger">{actionError}</p>
                </div>
              )}
              <Button
                type="button"
                disabled={pending}
                onClick={handleAccept}
                className="h-auto min-h-[46px] w-full rounded-[10px] bg-slate-700 py-3 text-[15px] font-medium text-white shadow-[0px_8px_22px_rgba(51,65,85,0.25)] transition-all duration-200 hover:bg-slate-800 disabled:opacity-50"
              >
                {pending ? (
                  <span className="flex items-center justify-center gap-3">
                    <span
                      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                      aria-hidden
                    />
                    Wird bearbeitet…
                  </span>
                ) : (
                  "Einladung annehmen"
                )}
              </Button>
            </div>
          )}

          {scenario === "D" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
                  <AlertCircle className="h-8 w-8 text-orange-600" aria-hidden />
                </div>
                <h1 className="font-serif text-3xl font-light tracking-tight text-[#111111] md:text-4xl">
                  Falsches Konto
                </h1>
                <p className="text-left text-sm leading-relaxed text-slate-600">
                  Diese Einladung ist für <strong className="font-semibold text-slate-900">{inviteEmail}</strong>. Sie
                  sind als <strong className="font-semibold text-slate-900">{sessionEmail}</strong> angemeldet. Bitte
                  melden Sie sich ab.
                </p>
              </div>
              <SignOutReturnForm returnTo={returnToAccept} />
            </div>
          )}

          {scenario === "E" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
                  <AlertCircle className="h-8 w-8 text-orange-600" aria-hidden />
                </div>
                <h1 className="font-serif text-3xl font-light tracking-tight text-[#111111] md:text-4xl">
                  Bereits anderer Workspace
                </h1>
                <p className="text-left text-sm leading-relaxed text-slate-600">
                  Sie gehören bereits zu Workspace{" "}
                  <strong className="font-semibold text-slate-900">
                    {otherWorkspaceName ?? "einer anderen Praxis"}
                  </strong>
                  . Sie können nicht gleichzeitig Mitglied zweier Workspaces sein. Bitte Workspace verlassen oder sich
                  abmelden.
                </p>
              </div>
              <SignOutReturnForm returnTo={returnToAccept} />
            </div>
          )}

          {scenario === "F" && (
            <div className="space-y-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden />
                </div>
                <h1 className="font-serif text-3xl font-light tracking-tight text-[#111111] md:text-4xl">
                  Bereits Mitglied
                </h1>
                <p className="text-sm leading-relaxed text-slate-600">
                  Sie sind bereits Mitglied dieses Workspaces.
                </p>
              </div>
              <Link href="/dashboard" className={`group ${primaryCtaClass}`}>
                Zum Dashboard
                <ArrowRight
                  className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
