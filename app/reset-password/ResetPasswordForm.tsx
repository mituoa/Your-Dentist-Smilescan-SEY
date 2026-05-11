"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getAuthenticatedEntryPath } from "@/app/(auth)/actions";
import { userFacingAuthError } from "@/lib/auth-user-facing-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  tokenHashFromQuery: string | null;
  typeFromQuery: string | null;
  inviteTokenFromQuery?: string | null;
};

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

function AuthInlineSpinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-2 text-center" role="status" aria-live="polite">
      <svg
        className="h-5 w-5 shrink-0 animate-spin text-[#0284C7]/70 motion-reduce:animate-none motion-reduce:opacity-70"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="text-[13px] font-normal leading-relaxed text-slate-600 sm:text-sm">{label}</p>
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
  const [inviteToken, setInviteToken] = useState<string | null>(
    inviteTokenFromQuery || null
  );

  const runVerify = useCallback(async (token_hash: string, type: string) => {
    setVerifying(true);
    setVerifyError(null);
    const supabase = createClient();
    if (type !== "recovery") {
      setVerifyError("Ungültiger oder abgelaufener Link.");
      setVerifying(false);
      return;
    }
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: "recovery",
    });
    if (error) {
      setVerifyError(userFacingAuthError(error.message));
      setVerified(false);
    } else {
      setVerified(true);
    }
    setVerifying(false);
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
      setInviteToken(invite || null);

      if (!token_hash || !type) {
        if (!cancelled) {
          setVerifyError(
            "Kein Wiederherstellungs-Token in der URL. Bitte den Link aus der E-Mail erneut öffnen."
          );
          setVerifying(false);
        }
        return;
      }

      await runVerify(token_hash, type);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setSubmitError(userFacingAuthError(error.message));
      setSubmitting(false);
      return;
    }
    if (inviteToken) {
      router.push(`/accept-invite?token=${encodeURIComponent(inviteToken)}`);
    } else {
      const nextPath = await getAuthenticatedEntryPath();
      router.push(nextPath);
    }
    router.refresh();
  }

  return (
    <div className="space-y-0">
      <header className="mb-6 text-center sm:mb-7">
        <h1 className="font-serif text-[1.375rem] font-semibold leading-snug tracking-tight text-gray-900 sm:text-2xl">
          Neues Passwort setzen
        </h1>
        <p className="mx-auto mt-2.5 max-w-sm text-[13px] font-normal leading-relaxed text-slate-600 sm:text-[14px]">
          Your Dentist — sicheres Passwort für Ihr Konto.
        </p>
      </header>

      {verifying ? <AuthInlineSpinner label="Link wird geprüft …" /> : null}

      {!verifying && verifyError ? (
        <div className="space-y-4 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-center sm:text-left">
          <p className="text-[13px] font-normal leading-relaxed text-red-900 sm:text-sm">{verifyError}</p>
          <Link
            href="/login"
            className="inline-block text-[13px] font-medium text-[#0284C7] underline-offset-2 hover:text-[#0369A1] hover:underline sm:text-sm"
          >
            Zum Login
          </Link>
        </div>
      ) : null}

      {!verifying && verified ? (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-[13px] font-medium text-slate-700">
              Neues Passwort
            </Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg border border-gray-200/90 bg-white px-3.5 text-[16px] text-gray-900 transition-colors focus-visible:border-[#0284C7] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0284C7]/10 sm:h-[52px] sm:rounded-xl sm:text-[15px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-[13px] font-medium text-slate-700">
              Bestätigung
            </Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-11 rounded-lg border border-gray-200/90 bg-white px-3.5 text-[16px] text-gray-900 transition-colors focus-visible:border-[#0284C7] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0284C7]/10 sm:h-[52px] sm:rounded-xl sm:text-[15px]"
            />
          </div>
          {submitError ? (
            <p className="rounded-xl border border-red-200/80 bg-red-50/90 px-3 py-2 text-[13px] text-red-900 sm:text-sm">
              {submitError}
            </p>
          ) : null}
          <Button
            type="submit"
            variant="primary"
            className="h-11 w-full rounded-lg text-[14px] font-semibold shadow-sm transition-shadow duration-200 hover:shadow-md sm:h-12 sm:rounded-xl sm:text-[15px]"
            disabled={!canSubmit}
          >
            Passwort speichern
          </Button>
        </form>
      ) : null}
    </div>
  );
}
