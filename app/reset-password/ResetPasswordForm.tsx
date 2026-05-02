"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { getAuthenticatedEntryPath } from "@/app/(auth)/actions";

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
      setVerifyError(error.message);
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
      setSubmitError(error.message);
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
    <div className="bg-surface-card border border-border rounded-lg p-8">
      <h2 className="font-serif text-2xl font-light mb-2 text-text-primary">
        Neues Passwort setzen
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        SmileScan — sichere Anmeldung.
      </p>

      {verifying && (
        <p className="text-sm text-text-secondary">Link wird geprüft…</p>
      )}

      {!verifying && verifyError && (
        <div className="space-y-4">
          <p className="text-sm text-danger">{verifyError}</p>
          <Link href="/login" className="text-sm text-brand hover:underline">
            Zum Login
          </Link>
        </div>
      )}

      {!verifying && verified && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="new-password">Neues Passwort</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Bestätigung</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {submitError && (
            <p className="text-sm text-danger">{submitError}</p>
          )}
          <Button type="submit" className="w-full" disabled={!canSubmit}>
            Passwort speichern
          </Button>
        </form>
      )}
    </div>
  );
}
