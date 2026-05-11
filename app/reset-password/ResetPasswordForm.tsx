"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedEntryPath } from "@/app/(auth)/actions";
import { userFacingAuthError } from "@/lib/auth-user-facing-errors";
import { sanitizeTeamInvitationTokenForAuth } from "@/lib/team-invitations/sanitize-invite-token-for-auth";
import { AuthLoadingSpinner } from "@/components/auth/auth-loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  tokenHashFromQuery: string | null;
  typeFromQuery: string | null;
  inviteTokenFromQuery?: string | null;
};

/** Supabase-Recovery (PKCE): E-Mail-Link liefert `token_hash` + `type=recovery` in **Query** oder im **URL-Hash** — nicht `access_token`-implicit ohne Anpassung. Keine Token-Werte loggen. */
const MAX_TOKEN_HASH_LEN = 2048;

/** Auth-Mapper ist login-zentriert — hier für Recovery/Passwort-Update neutralisieren und typische Supabase-OTP-Meldungen abfangen. */
function userFacingPasswordRecoveryError(raw: string): string {
  const m = (raw || "").trim();
  if (!m) {
    return "Der Vorgang ist fehlgeschlagen. Bitte versuchen Sie es erneut oder fordern Sie einen neuen Link an.";
  }

  if (/\botp\b|token.*expir|expired|link is invalid|invalid.*link|email link is invalid|already been used|already.*used|one[- ]time/i.test(m)) {
    return "Der Link ist ungültig oder nicht mehr gültig. Bitte fordern Sie einen neuen Link an.";
  }
  if (/same password|password should be different|cannot reuse|reuse|previously used/i.test(m)) {
    return "Bitte wählen Sie ein neues Passwort, das sich vom bisherigen unterscheidet.";
  }
  if (/session.*expir|not authenticated|jwt expired|invalid grant|refresh.*invalid|session not found/i.test(m)) {
    return "Die Wiederherstellung ist abgelaufen oder ungültig. Bitte fordern Sie einen neuen Link an.";
  }

  const base = userFacingAuthError(raw);
  if (/die anmeldung ist fehlgeschlagen/i.test(base)) {
    return "Der Vorgang ist fehlgeschlagen. Bitte versuchen Sie es erneut oder fordern Sie einen neuen Link an.";
  }
  if (/e-mail oder passwort ist ungültig/i.test(base)) {
    return "Das neue Passwort wurde nicht akzeptiert. Bitte prüfen Sie die Anforderungen und versuchen Sie es erneut.";
  }
  return base;
}

function parseHashParams(): {
  token_hash: string | null;
  type: string | null;
  invite: string | null;
} {
  if (typeof window === "undefined") {
    return { token_hash: null, type: null, invite: null };
  }
  const raw = window.location.hash?.replace(/^#/, "") ?? "";
  if (!raw) return { token_hash: null, type: null, invite: null };
  const params = new URLSearchParams(raw);
  return {
    token_hash: params.get("token_hash"),
    type: params.get("type"),
    invite: params.get("invite"),
  };
}

/** Ein Spinner wie Route-/Auth-Loading — sichtbarer Status steht im Seitenkopf (kein doppelter Fließtext). */
function VerifySpinner() {
  return (
    <div
      className="flex flex-col items-center gap-3 py-2 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Link wird geprüft"
    >
      <AuthLoadingSpinner className="h-5 w-5 shrink-0 animate-spin text-[#0284C7]/70 motion-reduce:animate-none motion-reduce:opacity-80" />
    </div>
  );
}

export function ResetPasswordForm({
  tokenHashFromQuery,
  typeFromQuery,
  inviteTokenFromQuery,
}: Props) {
  const router = useRouter();
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  /** Nach erfolgreichem `updateUser`: Serveraktion für Zielroute — eigene Phase statt langem „Wird gespeichert …“. */
  const [navigatingAfterSave, setNavigatingAfterSave] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(() =>
    sanitizeTeamInvitationTokenForAuth(inviteTokenFromQuery) || null
  );

  const runVerify = useCallback(async (token_hash: string, type: string, isCancelled: () => boolean) => {
    setVerifying(true);
    setVerifyError(null);
    const supabase = createClient();
    const typeNorm = type.trim().toLowerCase();
    if (typeNorm !== "recovery") {
      if (!isCancelled()) {
        setVerifyError("Ungültiger oder abgelaufener Link.");
        setVerifying(false);
      }
      return;
    }
    /** Bestehende lokale Session löschen, damit Recovery nicht mit einem anderen angemeldeten Konto kollidiert. */
    try {
      await supabase.auth.signOut();
      if (isCancelled()) return;
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: "recovery",
      });
      if (isCancelled()) return;
      if (error) {
        setVerifyError(userFacingPasswordRecoveryError(error.message));
        setVerified(false);
      } else {
        setVerified(true);
      }
    } catch {
      if (!isCancelled()) {
        setVerifyError(
          "Der Vorgang ist fehlgeschlagen. Bitte versuchen Sie es erneut oder fordern Sie einen neuen Link an."
        );
        setVerified(false);
      }
    }
    if (!isCancelled()) {
      setVerifying(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      let token_hash = tokenHashFromQuery;
      let type = typeFromQuery;
      let invite = inviteTokenFromQuery;

      if (!token_hash || !type) {
        const fromHash = parseHashParams();
        token_hash = token_hash || fromHash.token_hash;
        type = type || fromHash.type;
        invite = invite || fromHash.invite;
      }
      token_hash = token_hash?.trim() || null;
      type = type?.trim() || null;
      setInviteToken(sanitizeTeamInvitationTokenForAuth(invite ?? undefined) || null);

      if (!token_hash || !type) {
        if (!cancelled) {
          if (!token_hash && !type) {
            setVerifyError(
              "Kein Wiederherstellungs-Token in der URL. Bitte den Link aus der E-Mail erneut öffnen."
            );
          } else if (!token_hash) {
            setVerifyError(
              "Der Wiederherstellungslink ist unvollständig. Bitte den vollständigen Link aus der E-Mail öffnen oder einen neuen anfordern."
            );
          } else {
            setVerifyError(
              "Der Wiederherstellungslink ist unvollständig. Bitte den Link aus der E-Mail erneut öffnen oder einen neuen anfordern."
            );
          }
          setVerifying(false);
        }
        return;
      }

      if (token_hash.length > MAX_TOKEN_HASH_LEN) {
        if (!cancelled) {
          setVerifyError("Der Link aus der E-Mail ist ungültig. Bitte fordern Sie einen neuen Link an.");
          setVerifying(false);
        }
        return;
      }

      await runVerify(token_hash, type, () => cancelled);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [tokenHashFromQuery, typeFromQuery, inviteTokenFromQuery, runVerify]);

  const canSubmit = useMemo(() => {
    if (!verified || submitting) return false;
    if (password.length < 8) return false;
    return password === confirm;
  }, [verified, submitting, password, confirm]);

  const forgotPasswordHref = useMemo(
    () =>
      inviteToken
        ? `/forgot-password?invite=${encodeURIComponent(inviteToken)}`
        : "/forgot-password",
    [inviteToken]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);
    if (password.length < 8) {
      setSubmitError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    if (password !== confirm) {
      setSubmitError("Passwörter stimmen nicht überein.");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setSubmitError(userFacingPasswordRecoveryError(error.message));
        setSubmitting(false);
        return;
      }
      setNavigatingAfterSave(true);
      try {
        if (inviteToken) {
          router.push(`/accept-invite?token=${encodeURIComponent(inviteToken)}`);
        } else {
          const nextPath = await getAuthenticatedEntryPath();
          router.push(nextPath);
        }
        router.refresh();
      } catch {
        setNavigatingAfterSave(false);
        setSubmitting(false);
        setSubmitError(
          "Die Weiterleitung ist fehlgeschlagen. Bitte laden Sie die Seite neu oder melden Sie sich mit dem neuen Passwort an."
        );
      }
    } catch {
      setSubmitError(
        "Das Passwort konnte nicht gespeichert werden. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut."
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-0">
      <header className="mb-7 text-center sm:mb-8">
        <h1 className="font-serif text-[1.375rem] font-semibold leading-snug tracking-tight text-gray-900 sm:text-2xl">
          Neues Passwort setzen
        </h1>
        {(verifying || verified || (!verifying && verifyError)) && (
          <p className="mx-auto mt-3 max-w-sm text-[13px] font-normal leading-relaxed text-slate-600 sm:mt-3.5 sm:text-[14px]">
            {verifying
              ? "Wir prüfen den Link aus Ihrer E-Mail. Bei schlechter Verbindung kann das etwas länger dauern."
              : verified
                ? "Geben Sie Ihr neues Passwort zweimal ein (mindestens 8 Zeichen). Nach dem Speichern leiten wir Sie weiter."
                : "Nutzen Sie die Aktionen unter der Meldung, um fortzufahren."}
          </p>
        )}
      </header>

      {verifying ? <VerifySpinner /> : null}

      {!verifying && verifyError ? (
        <div className="space-y-4 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-center sm:text-left">
          <p className="max-w-full break-words text-[13px] font-normal leading-relaxed text-red-900 sm:text-sm">
            {verifyError}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <Link
              href={forgotPasswordHref}
              prefetch
              className="inline-flex min-h-[44px] items-center text-[13px] font-medium text-[#0284C7] underline-offset-2 hover:text-[#0369A1] hover:underline max-md:py-2 sm:text-sm md:min-h-0 md:py-0"
            >
              Neuen Link anfordern
            </Link>
            <Link
              href="/login"
              prefetch
              className="inline-flex min-h-[44px] items-center text-[13px] font-medium text-[#0284C7] underline-offset-2 hover:text-[#0369A1] hover:underline max-md:py-2 sm:text-sm md:min-h-0 md:py-0"
            >
              Zum Login
            </Link>
          </div>
        </div>
      ) : null}

      {!verifying && verified ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 sm:gap-6"
          aria-busy={submitting || navigatingAfterSave}
        >
          <fieldset
            disabled={submitting}
            className="m-0 flex min-w-0 flex-col gap-5 border-0 p-0 sm:gap-6 disabled:pointer-events-none disabled:opacity-[0.58]"
          >
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-[13px] font-medium text-slate-700">
                Neues Passwort
              </Label>
              <Input
                id="new-password"
                name="new_password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-lg border border-gray-200/90 bg-white px-3.5 text-[16px] text-gray-900 transition-colors focus-visible:border-[#0284C7] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0284C7]/10 sm:h-[52px] sm:rounded-xl sm:text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-[13px] font-medium text-slate-700">
                Bestätigung
              </Label>
              <Input
                id="confirm-password"
                name="new_password_confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-11 rounded-lg border border-gray-200/90 bg-white px-3.5 text-[16px] text-gray-900 transition-colors focus-visible:border-[#0284C7] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0284C7]/10 sm:h-[52px] sm:rounded-xl sm:text-[15px]"
              />
            </div>
          </fieldset>
          <div className="mt-2 flex flex-col gap-3 sm:mt-3 sm:gap-3.5">
            {submitError ? (
              <p className="max-w-full break-words rounded-xl border border-red-200/80 bg-red-50/90 px-3 py-2 text-[13px] text-red-900 sm:text-sm">
                {submitError}
              </p>
            ) : null}
            <Button
              type="submit"
              variant="primary"
              className="h-11 w-full rounded-lg text-[14px] font-semibold shadow-sm transition-shadow duration-200 hover:shadow-md sm:h-12 sm:rounded-xl sm:text-[15px]"
              disabled={!canSubmit}
              aria-busy={submitting || navigatingAfterSave}
            >
              {navigatingAfterSave
                ? "Weiterleitung …"
                : submitting
                  ? "Wird gespeichert …"
                  : "Passwort speichern"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
