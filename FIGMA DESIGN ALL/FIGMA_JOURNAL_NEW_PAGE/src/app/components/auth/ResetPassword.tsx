/**
 * SmileScan Reset Password Page
 *
 * Production-ready password reset page with token verification and form.
 *
 * Layout: Full-height cream background with fixed logo top-left and centered card.
 * States: Verifying → Error/Verified
 *
 * INTEGRATION NOTES:
 * - Replace mock verifyResetToken and updatePassword with actual server actions
 * - Token comes from URL query param ?token=...
 * - Invite token may be present for redirect: ?invite=...
 * - Success redirects to /dashboard or /accept-invite?token=INVITE if invite present
 * - Verification errors show specific German messages
 *
 * PRESERVED CONTRACTS:
 * - State A (Verifying): "Link wird geprüft…"
 * - State B (Error): Shows error + "Zum Login" link
 * - State C (Verified): Two password fields, validation, submit
 * - Password requirements: min 8 chars, must match
 * - Disabled button until all valid
 * - No success state shown (redirects immediately)
 */
"use client";

import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ResetPasswordProps {
  resetToken?: string | null;
  inviteToken?: string | null;
}

type PageState = "verifying" | "error" | "verified";

export function ResetPassword({
  resetToken = null,
  inviteToken = null,
}: ResetPasswordProps) {
  const [pageState, setPageState] = React.useState<PageState>("verifying");
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string>("");

  // Verify token on mount
  React.useEffect(() => {
    const verifyToken = async () => {
      if (!resetToken) {
        setErrorMessage(
          "Kein Wiederherstellungstoken in der URL gefunden. Bitte fordern Sie einen neuen Link an."
        );
        setPageState("error");
        return;
      }

      try {
        await verifyResetToken(resetToken);
        setPageState("verified");
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes("invalid") || err.message.includes("expired")) {
            setErrorMessage(
              "Ungültiger oder abgelaufener Link. Bitte fordern Sie einen neuen Link an."
            );
          } else {
            setErrorMessage(err.message);
          }
        }
        setPageState("error");
      }
    };

    verifyToken();
  }, [resetToken]);

  // Validate passwords
  const validate = (): boolean => {
    setValidationError("");

    if (newPassword.length < 8) {
      setValidationError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return false;
    }

    if (newPassword !== confirmPassword) {
      setValidationError("Die Passwörter stimmen nicht überein.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setValidationError("");

    try {
      await updatePassword({
        reset_token: resetToken!,
        new_password: newPassword,
      });

      // Success: redirect to dashboard or accept-invite
      if (inviteToken) {
        window.location.href = `/accept-invite?token=${inviteToken}`;
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      if (err instanceof Error) {
        setValidationError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Button should be disabled if:
  // - Page not verified
  // - Currently submitting
  // - Password < 8 chars
  // - Passwords don't match
  const isButtonDisabled =
    pageState !== "verified" ||
    isSubmitting ||
    newPassword.length < 8 ||
    newPassword !== confirmPassword;

  return (
    <div className="min-h-screen bg-[#FAFAF8] relative">
      {/* Fixed Logo Top-Left */}
      <div className="fixed top-4 left-4 md:top-6 md:left-6 z-10">
        <div className="animate-pulse-subtle">
          <SmileScanLogo className="w-[156px] md:w-[186px]" />
        </div>
      </div>

      {/* Centered Content */}
      <div className="flex items-center justify-center min-h-screen p-4 pt-24 md:pt-4">
        <div className="w-full max-w-md px-4">
          {/* Main Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            {/* Title */}
            <h2 className="font-serif text-3xl font-light text-gray-900 mb-2">
              Neues Passwort setzen
            </h2>

            {/* Subtitle */}
            <p className="text-sm text-gray-500 mb-6">
              SmileScan — sichere Anmeldung.
            </p>

            {/* State A: Verifying */}
            {pageState === "verifying" && (
              <p className="text-sm text-gray-500">Link wird geprüft…</p>
            )}

            {/* State B: Error */}
            {pageState === "error" && (
              <div className="space-y-4">
                <p className="text-sm text-destructive">{errorMessage}</p>
                <a
                  href="/login"
                  className="inline-block text-sm text-slate-700 hover:text-slate-900 hover:underline transition-colors"
                >
                  Zum Login
                </a>
              </div>
            )}

            {/* State C: Verified - Form */}
            {pageState === "verified" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="new_password">Neues Passwort</Label>
                  <Input
                    id="new_password"
                    name="new_password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSubmitting}
                    className={`bg-white border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all ${
                      validationError && newPassword.length > 0 && newPassword.length < 8
                        ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                        : ""
                    }`}
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Bestätigung</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    className={`bg-white border-gray-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 transition-all ${
                      validationError && confirmPassword.length > 0 && newPassword !== confirmPassword
                        ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                        : ""
                    }`}
                  />
                </div>

                {/* Validation Error */}
                {validationError && (
                  <p className="text-sm text-destructive">{validationError}</p>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isButtonDisabled}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-700 mt-6"
                >
                  {isSubmitting ? "Wird gespeichert…" : "Passwort speichern"}
                </Button>
              </form>
            )}
          </div>

          {/* Bottom Link */}
          <div className="text-center mt-6">
            <a
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-900 hover:underline transition-colors"
            >
              Zurück zum Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Logo Component
function SmileScanLogo({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        viewBox="0 0 186 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        <text
          x="0"
          y="30"
          fontFamily="serif"
          fontSize="32"
          fontWeight="600"
          fill="#0f172a"
          letterSpacing="-0.02em"
        >
          SmileScan
        </text>
      </svg>
    </div>
  );
}

// Mock server actions - replace with actual implementation
async function verifyResetToken(token: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock validation
  if (token === "invalid" || token === "expired") {
    throw new Error("invalid or expired");
  }

  // In production, call server to verify token:
  // - Check token exists in database
  // - Check token not expired (usually 1 hour)
  // - Check token not already used
  console.log("Token verified:", token);
}

async function updatePassword(data: {
  reset_token: string;
  new_password: string;
}): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In production:
  // 1. Verify token again (double-check)
  // 2. Hash new password
  // 3. Update user password in database
  // 4. Mark reset token as used
  // 5. Optionally: invalidate all sessions
  // 6. Redirect handled by component
  console.log("Password updated for token:", data.reset_token);
}

// Subtle pulse animation for logo
const styles = `
  @keyframes pulse-subtle {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.95;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-pulse-subtle {
      animation: none;
    }
  }

  .animate-pulse-subtle {
    animation: pulse-subtle 3s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
