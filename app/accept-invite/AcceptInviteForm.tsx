"use client";

/**
 * Oberfläche für Praxis-Einladungen (MVP). Szenario-Logik und Invite-Lesen liegen in `app/accept-invite/page.tsx`;
 * Workspace-Beitritt nur per Server-Action {@link acceptInvitation} in Szenario **C** (expliziter Klick).
 *
 * **Aktionen je Szenario:** invalid → Login; A → Registrieren; B → Login mit Invite; C → „Annehmen“ (Join);
 * D/E → Abmelden (Return zur Accept-URL); F → App-Home. Kein Join außerhalb von **C**.
 *
 * Szenario-Codes A–F sind bewusst kurz (Props-Stabilität); Bedeutung siehe Seiten-JSDoc.
 *
 * **Nice / Future / Non-MVP:** Kurz in `page.tsx` dokumentiert — UI dieses Moduls nicht erweitern ohne
 * explizites Produkt-Backlog (kein Wizard, kein Marketing, keine freien Redirects).
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { acceptInvitation } from "@/app/(protected)/settings/actions";
import { SignOutReturnForm } from "@/components/app-shell/sign-out-form";
import { AuthLoadingSpinner } from "@/components/auth/auth-loading-spinner";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { Button } from "@/components/ui/button";
import {
  ACCEPT_INVITE_CARD_CLASS,
  ACCEPT_INVITE_INNER_CLASS,
  ACCEPT_INVITE_OUTER_CLASS,
  AcceptInviteAmbientBackground,
  acceptInviteCardShadow,
} from "./accept-invite-shell";

export type AcceptInviteScenario = "invalid" | "A" | "B" | "C" | "D" | "E" | "F";

export type AcceptInviteFormProps = {
  token: string;
  scenario: AcceptInviteScenario;
  inviteEmail: string;
  practiceName: string;
  sessionEmail?: string;
  otherWorkspaceName?: string;
  /** Nach „bereits Mitglied“: rollenkorrekter App-Einstieg (Doctor vs Team). */
  inviteHomePath?: "/dashboard" | "/my-tasks";
  invalidReason?: string;
  /** `neutral`: ruhiger Ton bei fehlendem/beschädigtem Link (kein „Fehleralarm“). */
  invalidTone?: "error" | "neutral";
  /** Optionaler Titel bei `invalid` (Standard: „Einladung ungültig“). */
  invalidTitle?: string;
};

function displayPracticeName(name: string): string {
  const t = name.trim();
  return t && t !== "Unbekannt" ? t : "Die einladende Praxis";
}

const primaryCtaClass =
  "inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-[10px] bg-slate-700 px-4 py-3 text-[16px] font-medium leading-snug text-white shadow-[0px_8px_22px_rgba(51,65,85,0.25)] transition-all duration-200 hover:bg-slate-800 active:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700/30 focus-visible:ring-offset-2 sm:text-[15px]";

const inviteHeadingClass =
  "min-w-0 max-w-full text-balance font-sans text-3xl font-semibold tracking-[-0.025em] text-[#111111] md:text-4xl";

const inviteBodyClass =
  "min-w-0 max-w-full text-pretty text-left text-sm leading-relaxed text-slate-600 break-words [overflow-wrap:anywhere]";

const inviteSecondaryCtaClass =
  "flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-[10px] bg-slate-100 text-[16px] font-medium leading-snug text-slate-900 transition-all duration-200 hover:bg-slate-200 active:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700/25 focus-visible:ring-offset-2 sm:text-[15px]";

/** Keine Roh-`result.error`-Ausgabe: ausschließlich kontrollierte Nutzersprache. */
function userMessageForAcceptInviteFailure(code: string | undefined): string {
  switch (code) {
    case "INVALID_TOKEN":
    case "NOT_FOUND":
    case "INVALID_STATUS":
      return "Diese Einladung ist nicht mehr aktiv — vermutlich wurde sie bereits angenommen oder zurückgezogen. Bitte laden Sie die Seite neu oder melden Sie sich in der App an.";
    case "EXPIRED":
      return "Die Frist dieser Einladung ist abgelaufen. Bitte fordern Sie bei der einladenden Praxis eine neue Einladung an.";
    case "EMAIL_MISMATCH":
      return "Die E-Mail-Adresse dieses Kontos passt nicht zu der eingeladenen Adresse. Melden Sie sich mit dem vorgesehenen Konto an oder wenden Sie sich an die Praxis.";
    case "NOT_AUTHENTICATED":
      return "Sie sind nicht (mehr) angemeldet. Bitte melden Sie sich erneut an und öffnen Sie den Einladungslink danach noch einmal.";
    case "OTHER_WORKSPACE":
      return "Sie sind bereits einer anderen Praxis zugeordnet. Eine zweite gleichzeitige Mitgliedschaft ist derzeit nicht möglich — bitte wenden Sie sich an Ihre Administration.";
    case "JOIN_RACE":
      return "Der Beitritt wurde gerade unterbrochen. Bitte laden Sie die Seite neu. Wenn Sie bereits zugeordnet sind, gelangen Sie danach zur passenden Ansicht.";
    case "MEMBER_INSERT_FAILED":
    case "INVITE_LOAD_FAILED":
      return "Der Vorgang konnte gerade nicht abgeschlossen werden. Bitte versuchen Sie es in einem Moment erneut oder laden Sie die Seite neu.";
    case "INVALID_INVITE_EMAIL":
    case "USER_NOT_FOUND":
    case "USER_LOOKUP_FAILED":
      return "Die Einladung kann mit diesem Konto so nicht abgeschlossen werden. Bitte prüfen Sie Ihre E-Mail-Bestätigung oder wenden Sie sich an die einladende Praxis.";
    default:
      return "Der Vorgang konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.";
  }
}

export function AcceptInviteForm({
  token,
  scenario,
  inviteEmail,
  practiceName,
  sessionEmail,
  otherWorkspaceName,
  inviteHomePath,
  invalidReason,
  invalidTone = "error",
  invalidTitle,
}: AcceptInviteFormProps) {
  const router = useRouter();
  const [acceptPending, setAcceptPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [acceptFailureCode, setAcceptFailureCode] = useState<string | null>(null);
  const acceptInFlightRef = useRef(false);

  const tokenOk = token.trim().length > 0;
  const returnToAccept = `/accept-invite?token=${encodeURIComponent(token)}`;
  const loginHref = tokenOk
    ? `/login?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(inviteEmail)}`
    : "/login";
  const registerHref = `/register?invite=${encodeURIComponent(token)}&email=${encodeURIComponent(inviteEmail)}`;

  const practiceLabel = displayPracticeName(practiceName);
  const invalidHeading = invalidTitle ?? "Einladung ungültig";
  const showInvalidContext =
    scenario === "invalid" &&
    Boolean((practiceName.trim() && practiceName.trim() !== "Unbekannt") || inviteEmail.trim());

  async function handleAccept() {
    if (acceptPending || acceptInFlightRef.current) return;
    acceptInFlightRef.current = true;
    setAcceptPending(true);
    setActionError(null);
    setAcceptFailureCode(null);
    try {
      const result = await acceptInvitation(token);
      if (!result.ok) {
        setAcceptFailureCode(result.code ?? null);
        setActionError(userMessageForAcceptInviteFailure(result.code));
        acceptInFlightRef.current = false;
        setAcceptPending(false);
        return;
      }
      setAcceptFailureCode(null);
      router.push(result.role === "doctor" ? "/dashboard" : "/my-tasks");
      router.refresh();
    } catch {
      setAcceptFailureCode(null);
      setActionError("Es ist ein Verbindungsproblem aufgetreten. Bitte versuchen Sie es erneut.");
      acceptInFlightRef.current = false;
      setAcceptPending(false);
    }
  }

  return (
    <div className={ACCEPT_INVITE_OUTER_CLASS}>
      <AcceptInviteAmbientBackground />

      <div className={ACCEPT_INVITE_INNER_CLASS}>
        <div className={ACCEPT_INVITE_CARD_CLASS} style={acceptInviteCardShadow}>
          <div className="mb-6 flex min-w-0 w-full justify-center border-b border-slate-200/60 pb-5 sm:mb-7 sm:pb-6">
            <YourDentistBrandLockup size="sm" centered priority />
          </div>
          {scenario === "invalid" && (
            <div className="w-full min-w-0 space-y-5 sm:space-y-6">
              <div className="flex w-full min-w-0 flex-col items-center space-y-4 text-center">
                <div
                  className={
                    invalidTone === "neutral"
                      ? "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100"
                      : "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-50"
                  }
                >
                  {invalidTone === "neutral" ? (
                    <Mail className="h-8 w-8 text-slate-600" aria-hidden />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-600" aria-hidden />
                  )}
                </div>
                <h1 className={`${inviteHeadingClass} text-center`}>{invalidHeading}</h1>
                <p
                  className={
                    invalidTone === "neutral"
                      ? "w-full min-w-0 max-w-sm text-pretty text-base leading-relaxed text-slate-600 break-words [overflow-wrap:anywhere]"
                      : "w-full min-w-0 max-w-sm text-pretty text-base leading-relaxed text-danger break-words [overflow-wrap:anywhere]"
                  }
                >
                  {invalidReason ?? "Diese Einladung ist nicht mehr gültig."}
                </p>
                {showInvalidContext && (
                  <p className="w-full min-w-0 max-w-sm text-pretty text-left text-sm leading-relaxed text-slate-600 break-words [overflow-wrap:anywhere] sm:text-center">
                    {practiceName.trim() && practiceName.trim() !== "Unbekannt" ? (
                      <>
                        Zugehörige Praxis:{" "}
                        <strong className="font-semibold text-slate-900">{practiceName.trim()}</strong>
                      </>
                    ) : null}
                    {practiceName.trim() && practiceName.trim() !== "Unbekannt" && inviteEmail.trim()
                      ? " · "
                      : null}
                    {inviteEmail.trim() ? (
                      <>
                        Einladungsadresse:{" "}
                        <strong className="font-semibold text-slate-900">{inviteEmail.trim()}</strong>
                      </>
                    ) : null}
                  </p>
                )}
              </div>
              <Link href={loginHref} className={inviteSecondaryCtaClass}>
                Zum Login
              </Link>
              <p className="mx-auto w-full min-w-0 max-w-sm text-pretty text-center text-xs leading-relaxed text-slate-500">
                Benötigen Sie einen neuen Einladungslink, wenden Sie sich bitte an die einladende Praxis.
              </p>
            </div>
          )}

          {scenario === "A" && (
            <div className="w-full min-w-0 space-y-5 sm:space-y-6">
              <div className="w-full min-w-0 space-y-4">
                <h1 className={inviteHeadingClass}>Einladung ins Team</h1>
                <p className={inviteBodyClass}>
                  <strong className="font-semibold text-slate-900">{practiceLabel}</strong> hat Sie zur
                  Zusammenarbeit in der Praxis eingeladen. Die Einladung gilt für{" "}
                  <strong className="font-semibold text-slate-900">{inviteEmail}</strong>. Für diese Adresse
                  gibt es noch kein Konto.
                </p>
              </div>
              <Link href={registerHref} prefetch={false} className={`group ${primaryCtaClass}`}>
                Account erstellen
                <ArrowRight
                  className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          )}

          {scenario === "B" && (
            <div className="w-full min-w-0 space-y-5 sm:space-y-6">
              <div className="w-full min-w-0 space-y-4">
                <h1 className={inviteHeadingClass}>Einladung ins Team</h1>
                <p className={inviteBodyClass}>
                  <strong className="font-semibold text-slate-900">{practiceLabel}</strong> hat Sie zur
                  Zusammenarbeit in der Praxis eingeladen. Die Einladung gilt für{" "}
                  <strong className="font-semibold text-slate-900">{inviteEmail}</strong>. Für diese Adresse
                  gibt es bereits ein Konto — der Beitritt zur Praxis gelingt nach der Anmeldung.
                </p>
              </div>
              <Link href={loginHref} prefetch={false} className={`group ${primaryCtaClass}`}>
                Zur Anmeldung
                <ArrowRight
                  className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          )}

          {scenario === "C" && (
            <div className="w-full min-w-0 space-y-5 sm:space-y-6">
              <div className="w-full min-w-0 space-y-4">
                <h1 className={inviteHeadingClass}>Praxis beitreten</h1>
                <p className={inviteBodyClass}>
                  <strong className="font-semibold text-slate-900">{practiceLabel}</strong> hat Sie eingeladen.
                  Die Einladung gilt für{" "}
                  <strong className="font-semibold text-slate-900">{inviteEmail}</strong>.
                </p>
                <p className={inviteBodyClass}>
                  Mit <strong className="font-semibold text-slate-900">Einladung annehmen</strong> treten Sie der
                  Praxis bei — erst danach sind Sie dort als Teammitglied sichtbar.
                </p>
              </div>
              {actionError && (
                <div
                  className="min-w-0 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <p className="text-pretty text-left text-sm leading-relaxed text-danger break-words [overflow-wrap:anywhere]">
                    {actionError}
                  </p>
                </div>
              )}
              {(acceptFailureCode === "NOT_AUTHENTICATED" || acceptFailureCode === "EMAIL_MISMATCH") && (
                <Link
                  href={loginHref}
                  prefetch={false}
                  className="flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-[10px] text-center text-[16px] font-medium text-slate-800 ring-1 ring-inset ring-slate-200/90 transition-colors hover:bg-slate-50 active:bg-slate-100 sm:text-[15px]"
                >
                  Zur Anmeldung
                </Link>
              )}
              <form
                className="contents"
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleAccept();
                }}
              >
                <Button
                  type="submit"
                  disabled={acceptPending}
                  aria-busy={acceptPending}
                  aria-label={
                    acceptPending ? "Einladung wird angenommen, bitte warten" : "Einladung annehmen"
                  }
                  className="h-auto min-h-[48px] w-full touch-manipulation rounded-[10px] bg-slate-700 py-3 text-[16px] font-medium leading-snug text-white shadow-[0px_8px_22px_rgba(51,65,85,0.25)] transition-all duration-200 hover:bg-slate-800 active:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]"
                >
                  {acceptPending ? (
                    <span className="flex items-center justify-center gap-3">
                      <AuthLoadingSpinner className="h-5 w-5 shrink-0 text-white/90 motion-reduce:animate-none motion-reduce:opacity-80" />
                      Einladung wird angenommen&nbsp;…
                    </span>
                  ) : (
                    "Einladung annehmen"
                  )}
                </Button>
              </form>
            </div>
          )}

          {scenario === "D" && (
            <div className="w-full min-w-0 space-y-5 sm:space-y-6">
              <div className="w-full min-w-0 space-y-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-50">
                  <AlertCircle className="h-8 w-8 text-orange-600" aria-hidden />
                </div>
                <h1 className={inviteHeadingClass}>Falsches Konto</h1>
                <p className={inviteBodyClass}>
                  Diese Einladung gilt für{" "}
                  <strong className="font-semibold text-slate-900">{inviteEmail}</strong>.
                  {sessionEmail?.trim() ? (
                    <>
                      {" "}
                      Sie sind derzeit als{" "}
                      <strong className="font-semibold text-slate-900">{sessionEmail.trim()}</strong> angemeldet.
                    </>
                  ) : (
                    <>Sie sind mit einem anderen Konto angemeldet als von der Einladung vorgesehen.</>
                  )}{" "}
                  Bitte melden Sie sich ab und öffnen Sie den Einladungslink erneut (z.&nbsp;B. aus der E-Mail).
                </p>
              </div>
              <SignOutReturnForm returnTo={returnToAccept} />
            </div>
          )}

          {scenario === "E" && (
            <div className="w-full min-w-0 space-y-5 sm:space-y-6">
              <div className="w-full min-w-0 space-y-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-50">
                  <AlertCircle className="h-8 w-8 text-orange-600" aria-hidden />
                </div>
                <h1 className={inviteHeadingClass}>Bereits andere Praxis</h1>
                <p className={inviteBodyClass}>
                  Sie sind bereits der Praxis{" "}
                  <strong className="font-semibold text-slate-900">
                    {otherWorkspaceName ?? "einer anderen Einrichtung"}
                  </strong>{" "}
                  zugeordnet. Eine gleichzeitige Mitgliedschaft in zwei Praxen ist derzeit nicht möglich. Bitte
                  kontaktieren Sie Ihre Administratorin bzw. Ihren Administrator — oder melden Sie sich ab, falls Sie den
                  Einladungslink erneut mit dem passenden Konto öffnen möchten.
                </p>
              </div>
              <SignOutReturnForm returnTo={returnToAccept} />
            </div>
          )}

          {scenario === "F" && (
            <div className="w-full min-w-0 space-y-5 text-center sm:space-y-6">
              <div className="flex w-full min-w-0 flex-col items-center space-y-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" aria-hidden />
                </div>
                <h1 className={`${inviteHeadingClass} text-center`}>Bereits Mitglied</h1>
                <p className={`${inviteBodyClass} text-center`}>
                  {practiceName.trim() && practiceName.trim() !== "Unbekannt" ? (
                    <>
                      Sie sind bereits Mitglied der Praxis{" "}
                      <strong className="font-semibold text-slate-900">{practiceName.trim()}</strong> und können die
                      Einladung nicht erneut annehmen.
                    </>
                  ) : (
                    <>
                      Sie sind bereits Mitglied dieser Praxis und können die Einladung nicht erneut annehmen.
                    </>
                  )}
                </p>
              </div>
              <Link href={inviteHomePath ?? "/dashboard"} className={`group ${primaryCtaClass}`}>
                Weiter zur App
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
