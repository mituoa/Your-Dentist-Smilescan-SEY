/**
 * SmileScan Register Page
 *
 * Production-ready registration page with:
 * - Full-screen gradient background with decorative blurred blobs
 * - Centered glass-morphism auth card (max-width ~500px for extra fields)
 * - Brand heading "SmileScan"
 * - Conditional invite-aware layout (hides workspace field when invite present)
 * - Optional error banner from URL query param
 * - Form with exact field requirements and validation
 * - Proper navigation with invite/email propagation
 *
 * INTEGRATION NOTES:
 * - Replace mock signUp function with actual server action
 * - Ensure invite_token and email are passed from URL params
 * - Error handling preserves form state
 * - Navigation URLs include invite and email query params when available
 * - Form submission calls existing signUp backend logic
 *
 * PRESERVED CONTRACTS:
 * - Field order: name → workspace (if no invite) → email → password
 * - Invite box appears above form when invite token present
 * - Workspace field hidden when invite token present
 * - Required fields: all except workspace_name is conditional
 * - Password min length: 8 characters
 * - Login link: includes invite + email query params
 * - Success redirect: /dashboard
 * - Error redirect: /register?error=... (with invite propagation)
 */
"use client";

import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle, Info } from "lucide-react";

interface RegisterProps {
  inviteToken?: string | null;
  inviteWorkspaceName?: string | null;
  prefilledEmail?: string | null;
  errorMessage?: string | null;
}

export function Register({
  inviteToken = null,
  inviteWorkspaceName = null,
  prefilledEmail = null,
  errorMessage = null,
}: RegisterProps) {
  const [displayName, setDisplayName] = React.useState("");
  const [workspaceName, setWorkspaceName] = React.useState("");
  const [email, setEmail] = React.useState(prefilledEmail || "");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock server action - replace with actual signUp implementation
      await signUp({
        display_name: displayName,
        workspace_name: inviteToken ? undefined : workspaceName,
        email,
        password,
        invite_token: inviteToken,
      });
      // On success, user would be redirected to /dashboard by server action
    } catch (err) {
      // On error, redirect to /register?error=...&invite=... handled by server
      console.error("Registration failed:", err);
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
      <div className="relative w-full max-w-[500px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/5 border border-white/20 p-8">
        {/* Brand Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            SmileScan
          </h1>
        </div>

        {/* Card Title & Subtitle */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Konto anlegen
          </h2>
          <p className="text-sm text-gray-600">
            Für Zahnärzte in geschlossener Beta.
          </p>
        </div>

        {/* Error Banner from URL param */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Invite Info Box */}
        {inviteToken && (
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-slate-700">
                  Sie treten einem bestehenden Workspace bei.
                </p>
                {inviteWorkspaceName && (
                  <p className="mt-1 font-medium text-slate-900">
                    {inviteWorkspaceName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hidden invite token field */}
          {inviteToken && (
            <input type="hidden" name="invite_token" value={inviteToken} />
          )}

          {/* Vollständiger Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name">Vollständiger Name</Label>
            <Input
              id="display_name"
              name="display_name"
              type="text"
              placeholder="Dr. med. dent. Jane Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white/70 border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          {/* Praxis-Name (only when no invite) */}
          {!inviteToken && (
            <div className="space-y-2">
              <Label htmlFor="workspace_name">Praxis-Name</Label>
              <Input
                id="workspace_name"
                name="workspace_name"
                type="text"
                placeholder="Zahnarztpraxis am Rathausplatz"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/70 border-gray-200 focus:bg-white transition-colors"
              />
            </div>
          )}

          {/* E-Mail */}
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

          {/* Passwort */}
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white/70 border-gray-200 focus:bg-white transition-colors"
            />
            <p className="text-xs text-gray-500">Mindestens 8 Zeichen.</p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-slate-700 hover:bg-slate-800 text-white transition-colors mt-6"
            disabled={isLoading}
          >
            {isLoading ? "Konto wird erstellt..." : "Konto anlegen"}
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Schon ein Konto?{" "}
          <a
            href={loginUrl}
            className="text-slate-700 hover:text-slate-900 font-medium transition-colors hover:underline"
          >
            Anmelden
          </a>
        </div>
      </div>
    </div>
  );
}

// Mock signUp server action - replace with actual implementation
async function signUp(data: {
  display_name: string;
  workspace_name?: string;
  email: string;
  password: string;
  invite_token: string | null;
}): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock validation
  if (data.email === "error@test.com") {
    throw new Error("Diese E-Mail ist bereits registriert");
  }

  if (data.password.length < 8) {
    throw new Error("Passwort muss mindestens 8 Zeichen lang sein");
  }

  // In production, this would call your actual auth service
  console.log("Sign up called with:", {
    ...data,
    password: "[REDACTED]",
  });

  // Success would redirect to /dashboard via server action
}
