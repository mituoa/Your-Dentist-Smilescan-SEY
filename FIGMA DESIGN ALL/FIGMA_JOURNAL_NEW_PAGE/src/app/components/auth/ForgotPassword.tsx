/**
 * SmileScan Forgot Password Page
 *
 * Production-ready password reset request page with:
 * - Full-screen gradient background with decorative blurred blobs
 * - Centered glass-morphism auth card (max-width ~448px)
 * - Conditional success/error messaging
 * - Single email field with optional prefill
 * - Invite-aware back navigation
 *
 * INTEGRATION NOTES:
 * - Replace mock requestPasswordResetFromLogin with actual server action
 * - Ensure invite_token and email are passed from URL params
 * - Success state triggered by ?sent=1 query param
 * - Error state triggered by ?error=... query param
 * - Form submission calls existing requestPasswordResetFromLogin logic
 *
 * PRESERVED CONTRACTS:
 * - Title: "Passwort zurücksetzen"
 * - Body copy explains the process
 * - Success message: "Wenn die E-Mail existiert, wurde ein Link zum Zurücksetzen versendet."
 * - Email field: required, type=email, autocomplete=email
 * - Hidden invite_token field when invite present
 * - Back link: preserves invite + email query params
 * - No explicit loading/disabled state (handled by auth layout)
 */
"use client";

import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ForgotPasswordProps {
  inviteToken?: string | null;
  prefilledEmail?: string | null;
  errorMessage?: string | null;
  successSent?: boolean;
}

export function ForgotPassword({
  inviteToken = null,
  prefilledEmail = null,
  errorMessage = null,
  successSent = false,
}: ForgotPasswordProps) {
  const [email, setEmail] = React.useState(prefilledEmail || "");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock server action - replace with actual requestPasswordResetFromLogin
      await requestPasswordResetFromLogin({
        email,
        invite_token: inviteToken,
      });
      // On success, server action redirects to /forgot-password?sent=1
      // (and preserves invite/email params if present)
    } catch (err) {
      // On error, redirect to /forgot-password?error=...
      console.error("Password reset request failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Build login URL with invite and email params
  const loginUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    if (inviteToken) params.set("invite", inviteToken);
    if (email) params.set("email", email);
    return `/login${params.toString() ? `?${params.toString()}` : ""}`;
  }, [inviteToken, email]);

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background with gradient and decorative blobs - Premium (Slate-Blue) Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />

      {/* Decorative blurred blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-slate-300/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl" />

      {/* Auth Card */}
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/5 border border-white/20 p-8">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Passwort zurücksetzen
        </h1>

        {/* Body Copy */}
        <p className="text-sm text-gray-600 mb-6">
          Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum
          Zurücksetzen.
        </p>

        {/* Success Message */}
        {successSent && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Wenn die E-Mail existiert, wurde ein Link zum Zurücksetzen
              versendet.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hidden invite token field */}
          {inviteToken && (
            <input type="hidden" name="invite_token" value={inviteToken} />
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="doc@praxis.de"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white/70 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-slate-700 hover:bg-slate-800 text-white transition-colors mt-6"
            disabled={isLoading}
          >
            {isLoading ? "Wird gesendet..." : "Link zum Zurücksetzen senden"}
          </Button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 text-center text-sm">
          <a
            href={loginUrl}
            className="text-slate-700 hover:text-slate-900 transition-colors hover:underline"
          >
            Zurück zum Login
          </a>
        </div>
      </div>
    </div>
  );
}

// Mock requestPasswordResetFromLogin server action - replace with actual implementation
async function requestPasswordResetFromLogin(data: {
  email: string;
  invite_token: string | null;
}): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In production, this would:
  // 1. Check if email exists in database
  // 2. Generate password reset token
  // 3. Send email with reset link
  // 4. Redirect to /forgot-password?sent=1 (always, for security - don't reveal if email exists)
  // 5. Preserve invite/email params if present

  console.log("Password reset requested for:", {
    ...data,
    email: data.email,
  });

  // Success would redirect to /forgot-password?sent=1&invite=...&email=...
}
