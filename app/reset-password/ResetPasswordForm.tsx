"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedEntryPath } from "@/app/(auth)/actions";
import { userFacingAuthError } from "@/lib/auth-user-facing-errors";
import { sanitizeTeamInvitationTokenForAuth } from "@/lib/team-invitations/sanitize-invite-token-for-auth";
import { YdAuthAlert, YdAuthLabel, YdAuthLoadingState } from "@/components/auth/yd-auth-ui";

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
  if (
    /session.*expir|not authenticated|jwt expired|invalid grant|refresh.*invalid|session not found|auth session missing|invalid_grant|token not found|invalid jwt|session revoked|access_denied|unauthorized request/i.test(
      m
    )
  ) {
    return "Die Wiederherstellung ist abgelaufen oder ungültig. Bitte fordern Sie einen neuen Link an.";
  }

  const base = userFacingAuthError(raw);
  if (/die anmeldung ist fehlgeschlagen/i.test(base)) {
    return "Der Vorgang ist fehlgeschlagen. Bitte versuchen Sie es erneut oder fordern Sie einen neuen Link an.";
  }
  if (/e-mail oder passwort ist ungültig/i.test(base)) {
    return "Das neue Passwort wurde nicht akzeptiert. Bitte prüfen Sie die Anforderungen und versuchen Sie es erneut.";
  }

  if (/\b(supabase|postgres|invalid_grant|auth session|token_hash|refresh_token|jwt\b|https?:\/\/)\b/i.test(base)) {
    return "Der Vorgang ist fehlgeschlagen. Bitte versuchen Sie es erneut oder fordern Sie einen neuen Link an.";
  }
  return base;
}

/** Nur interne Ziele nach Server-Action — keine offenen Redirects aus fremden Strings. */
function safePostAuthRedirectPath(path: string): string {
  const fallback = "/login";
  const t = path.trim();
  if (!t.startsWith("/") || t.startsWith("//") || /[\r\n\0]/.test(t)) return fallback;
  if (t === "/dashboard" || t.startsWith("/dashboard/") || t.startsWith("/dashboard?")) return t;
  if (t === "/my-tasks" || t.startsWith("/my-tasks/") || t.startsWith("/my-tasks?")) return t;
  if (t === "/login" || t.startsWith("/login?") || t.startsWith("/login#") || t.startsWith("/login/")) return t;
  if (!t.startsWith("/accept-invite?")) return fallback;
  try {
    const u = new URL(t, "https://invalid.invalid");
    const tok = u.searchParams.get("token");
    if (tok && /^[a-f0-9]{64}$/i.test(tok)) {
      return `/accept-invite?token=${encodeURIComponent(tok.toLowerCase())}`;
    }
  } catch {
    /* ignore */
  }
  return fallback;
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
  return <YdAuthLoadingState label="Link wird geprüft …" className="py-4" />;
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
  const submitInFlightRef = useRef(false);

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
    if (!verified || submitting || navigatingAfterSave) return false;
    if (password.length < 8) return false;
    return password === confirm;
  }, [verified, submitting, navigatingAfterSave, password, confirm]);

  const forgotPasswordHref = useMemo(
    () =>
      inviteToken
        ? `/forgot-password?invite=${encodeURIComponent(inviteToken)}`
        : "/forgot-password",
    [inviteToken]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || navigatingAfterSave || submitInFlightRef.current) return;
    setSubmitError(null);
    if (password.length < 8) {
      setSubmitError("Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    if (password !== confirm) {
      setSubmitError("Passwörter stimmen nicht überein.");
      return;
    }
    submitInFlightRef.current = true;
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
          router.replace(`/accept-invite?token=${encodeURIComponent(inviteToken)}`);
        } else {
          const nextPath = safePostAuthRedirectPath(await getAuthenticatedEntryPath());
          router.replace(nextPath);
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
    } finally {
      submitInFlightRef.current = false;
    }
  }

  return (
    <div className="min-w-0">
      {verifying ? (
        <>
          <p className="yd-auth-subtitle mb-4 text-center">
            Wir prüfen den Link aus Ihrer E-Mail. Bei schlechter Verbindung kann das etwas länger dauern.
          </p>
          <VerifySpinner />
        </>
      ) : null}

      {!verifying && verifyError ? (
        <YdAuthAlert tone="warning" title="Link nicht verwendbar" className="mb-6">
          <p className="mb-4">{verifyError}</p>
          <div className="flex flex-col gap-2 text-left">
            <Link href={forgotPasswordHref} prefetch className="yd-auth-link inline-flex min-h-[44px] items-center">
              Neuen Link anfordern
            </Link>
            <Link href="/login" prefetch className="yd-auth-link inline-flex min-h-[44px] items-center">
              Zum Login
            </Link>
          </div>
        </YdAuthAlert>
      ) : null}

      {!verifying && verified ? (
        <>
          <p className="yd-auth-subtitle mb-6 text-center">
            Mindestens 8 Zeichen. Nach dem Speichern leiten wir Sie in Ihren Praxisbereich weiter.
          </p>
          <form
            onSubmit={handleSubmit}
            className="yd-auth-form-stack"
            aria-busy={submitting || navigatingAfterSave}
          >
            <fieldset
              disabled={submitting || navigatingAfterSave}
              className="m-0 flex min-w-0 flex-col gap-4 border-0 p-0 disabled:pointer-events-none disabled:opacity-[0.58]"
            >
              <div className="min-w-0">
                <YdAuthLabel htmlFor="new-password">Neues Passwort</YdAuthLabel>
                <input
                  id="new-password"
                  name="new_password"
                  type="password"
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="yd-auth-input"
                />
              </div>
              <div className="min-w-0">
                <YdAuthLabel htmlFor="confirm-password">Bestätigung</YdAuthLabel>
                <input
                  id="confirm-password"
                  name="new_password_confirm"
                  type="password"
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="yd-auth-input"
                />
              </div>
            </fieldset>
            {submitError ? (
              <YdAuthAlert tone="danger" title="Speichern nicht möglich">
                {submitError}
              </YdAuthAlert>
            ) : null}
            <button
              type="submit"
              className="yd-auth-btn-primary"
              disabled={!canSubmit}
              aria-busy={submitting || navigatingAfterSave}
            >
              {navigatingAfterSave
                ? "Weiterleitung …"
                : submitting
                  ? "Wird gespeichert …"
                  : "Passwort speichern"}
            </button>
          </form>
        </>
      ) : null}
    </div>
  );
}
