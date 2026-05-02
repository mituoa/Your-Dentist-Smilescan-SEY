/**
 * SmileScan Login Page
 *
 * Production-ready authentication page with:
 * - Full-screen gradient background with decorative blurred blobs
 * - Centered glass-morphism auth card (max-width 380px)
 * - Disabled Google OAuth placeholder button
 * - Email/password form with validation
 * - Conditional error banner
 * - Invite-aware navigation (forgot-password, register)
 * - All interaction states: loading, error, focus, hover
 * - Fully responsive (mobile/tablet/desktop)
 *
 * INTEGRATION NOTES:
 * - Replace mock signIn function with actual server action
 * - Ensure invite_token is passed from URL params or auth context
 * - Error handling preserves form state
 * - Navigation URLs include invite and email query params when available
 * - Form submission calls existing signIn backend logic
 *
 * PRESERVED CONTRACTS:
 * - Block order: title → Google button → divider → error → form → register link
 * - Required fields: email, password
 * - Optional hidden field: invite_token
 * - Forgot-password link: includes invite + email query params
 * - Register link: includes invite query param
 */
"use client";

import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";

interface LoginProps {
  inviteToken?: string | null;
}

export function Login({ inviteToken = null }: LoginProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Mock server action - replace with actual signIn implementation
      await signIn({ email, password, invite_token: inviteToken });
      // On success, user would be redirected by server action
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen");
    } finally {
      setIsLoading(false);
    }
  };

  // Build invite-aware URLs
  const forgotPasswordUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    if (inviteToken) params.set("invite", inviteToken);
    if (email) params.set("email", email);
    return `/forgot-password${params.toString() ? `?${params.toString()}` : ""}`;
  }, [inviteToken, email]);

  const registerUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    if (inviteToken) params.set("invite", inviteToken);
    return `/register${params.toString() ? `?${params.toString()}` : ""}`;
  }, [inviteToken]);

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background with gradient and decorative blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />

      {/* Decorative blurred blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-slate-300/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl" />

      {/* Auth Card */}
      <div className="relative w-full max-w-[380px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/5 border border-white/20 p-8">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Login
        </h1>

        {/* Disabled Google Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full mb-4 bg-white/50 border-gray-200 text-gray-400 cursor-not-allowed hover:bg-white/50"
          disabled
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Mit Google anmelden (bald)
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white/80 px-4 text-gray-500">
              Oder mit E-Mail anmelden
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
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
              type="email"
              placeholder="ihre@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white/70 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Passwort</Label>
              <a
                href={forgotPasswordUrl}
                className="text-sm text-slate-700 hover:text-slate-800 transition-colors hover:underline"
              >
                Vergessen?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {isLoading ? "Anmelden..." : "Anmelden"}
          </Button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Noch kein Konto?{" "}
          <a
            href={registerUrl}
            className="text-slate-700 hover:text-slate-800 font-medium transition-colors hover:underline"
          >
            Registrieren
          </a>
        </div>
      </div>
    </div>
  );
}

// Mock signIn server action - replace with actual implementation
async function signIn(data: {
  email: string;
  password: string;
  invite_token: string | null;
}): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock validation
  if (data.email === "error@test.com") {
    throw new Error("Ungültige Anmeldedaten");
  }

  // In production, this would call your actual auth service
  console.log("Sign in called with:", data);
}
