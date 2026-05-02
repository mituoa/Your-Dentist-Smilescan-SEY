/**
 * SmileScan Accept Invite Page - Future 3001 Design
 *
 * Ultra-modern, futuristic design with Premium (Slate-Blue) theme.
 *
 * Features:
 * - Cream background with subtle gradient overlay
 * - Fixed animated logo
 * - Glassmorphism card with elevated shadows
 * - Premium typography with generous spacing
 * - 7 mutually exclusive states
 * - Smooth micro-animations
 * - Future-forward aesthetic
 *
 * INTEGRATION NOTES:
 * - If no token in URL, server redirects to /login (not handled client-side)
 * - Replace mock server actions with actual implementations
 * - States determined by server response
 * - Success redirects to /dashboard (doctor) or /my-tasks (other roles)
 *
 * SEVEN STATES:
 * 1. Invalid invitation
 * 2. Scenario A - No account exists
 * 3. Scenario B - Account exists (must login)
 * 4. Scenario C - Correct user, can accept
 * 5. Scenario D - Wrong logged-in account
 * 6. Scenario E - Already in another workspace
 * 7. Scenario F - Already a member
 */
"use client";

import * as React from "react";
import { Button } from "../ui/button";
import { AlertCircle, CheckCircle2, LogOut, ArrowRight } from "lucide-react";

interface AcceptInviteProps {
  inviteToken: string;
}

type InviteState =
  | "loading"
  | "invalid"
  | "no-account"
  | "account-exists"
  | "can-accept"
  | "wrong-account"
  | "other-workspace"
  | "already-member";

interface InviteData {
  state: InviteState;
  practiceName?: string;
  invitedEmail?: string;
  currentEmail?: string;
  currentWorkspace?: string;
  invalidReason?: string;
  userRole?: "doctor" | "staff";
}

export function AcceptInvite({ inviteToken }: AcceptInviteProps) {
  const [inviteData, setInviteData] = React.useState<InviteData | null>(null);
  const [isAccepting, setIsAccepting] = React.useState(false);
  const [acceptError, setAcceptError] = React.useState<string>("");

  // Load invite data
  React.useEffect(() => {
    const loadInvite = async () => {
      try {
        const data = await getInviteData(inviteToken);
        setInviteData(data);
      } catch (err) {
        setInviteData({
          state: "invalid",
          invalidReason: err instanceof Error ? err.message : "Unbekannter Fehler",
        });
      }
    };

    loadInvite();
  }, [inviteToken]);

  const handleAccept = async () => {
    setIsAccepting(true);
    setAcceptError("");

    try {
      const result = await acceptInvitation(inviteToken);

      // Success - redirect based on role
      if (inviteData?.userRole === "doctor") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/my-tasks";
      }
    } catch (err) {
      setAcceptError(err instanceof Error ? err.message : "Fehler beim Annehmen der Einladung");
    } finally {
      setIsAccepting(false);
    }
  };

  if (!inviteData) {
    return (
      <PageLayout>
        <FutureCard>
          <LoadingState />
        </FutureCard>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <FutureCard>
        {/* State 1: Invalid */}
        {inviteData.state === "invalid" && (
          <InvalidState reason={inviteData.invalidReason} />
        )}

        {/* State 2: No Account */}
        {inviteData.state === "no-account" && (
          <NoAccountState
            practiceName={inviteData.practiceName!}
            invitedEmail={inviteData.invitedEmail!}
            inviteToken={inviteToken}
          />
        )}

        {/* State 3: Account Exists */}
        {inviteData.state === "account-exists" && (
          <AccountExistsState
            practiceName={inviteData.practiceName!}
            invitedEmail={inviteData.invitedEmail!}
            inviteToken={inviteToken}
          />
        )}

        {/* State 4: Can Accept */}
        {inviteData.state === "can-accept" && (
          <CanAcceptState
            practiceName={inviteData.practiceName!}
            invitedEmail={inviteData.invitedEmail!}
            isAccepting={isAccepting}
            acceptError={acceptError}
            onAccept={handleAccept}
          />
        )}

        {/* State 5: Wrong Account */}
        {inviteData.state === "wrong-account" && (
          <WrongAccountState
            invitedEmail={inviteData.invitedEmail!}
            currentEmail={inviteData.currentEmail!}
            inviteToken={inviteToken}
          />
        )}

        {/* State 6: Other Workspace */}
        {inviteData.state === "other-workspace" && (
          <OtherWorkspaceState
            currentWorkspace={inviteData.currentWorkspace}
            inviteToken={inviteToken}
          />
        )}

        {/* State 7: Already Member */}
        {inviteData.state === "already-member" && <AlreadyMemberState />}
      </FutureCard>
    </PageLayout>
  );
}

// Page Layout Component
function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] relative overflow-hidden">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-blue-50/30 pointer-events-none" />

      {/* Fixed Logo */}
      <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50">
        <div className="animate-pulse-glow">
          <SmileScanLogo className="w-[156px] md:w-[186px]" />
        </div>
      </div>

      {/* Centered Content */}
      <div className="flex items-center justify-center min-h-screen p-4 pt-24 md:pt-4">
        <div className="w-full max-w-md px-4">{children}</div>
      </div>
    </div>
  );
}

// Future Card Component with glassmorphism
function FutureCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative group">
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600 to-blue-600 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur" />

      {/* Main card */}
      <div className="relative bg-white/95 backdrop-blur-sm border border-slate-200/50 rounded-3xl shadow-2xl shadow-slate-900/5 p-10 transition-all duration-300 hover:shadow-slate-900/10">
        {children}
      </div>
    </div>
  );
}

// State Components

function LoadingState() {
  return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-700 mb-6" />
      <p className="text-slate-600 text-lg">Einladung wird geladen…</p>
    </div>
  );
}

function InvalidState({ reason }: { reason?: string }) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-2">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight">
          Einladung ungültig
        </h1>
        <p className="text-red-600 text-base max-w-sm mx-auto leading-relaxed">
          {reason ||
            "Diese Einladung ist nicht mehr gültig. Bitte fordern Sie eine neue Einladung an."}
        </p>
      </div>

      <div className="pt-4">
        <a
          href="/login"
          className="block w-full text-center px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Zum Login
        </a>
      </div>
    </div>
  );
}

function NoAccountState({
  practiceName,
  invitedEmail,
  inviteToken,
}: {
  practiceName: string;
  invitedEmail: string;
  inviteToken: string;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight">
          Team-Einladung
        </h1>
        <div className="text-left space-y-3 text-slate-600 leading-relaxed">
          <p>
            Sie wurden zu <span className="font-semibold text-slate-900">{practiceName}</span>{" "}
            eingeladen.
          </p>
          <p>
            Für die E-Mail-Adresse <span className="font-mono text-sm text-slate-900">{invitedEmail}</span>{" "}
            existiert noch kein SmileScan-Konto.
          </p>
        </div>
      </div>

      <div className="pt-4">
        <a
          href={`/register?invite=${inviteToken}&email=${encodeURIComponent(invitedEmail)}`}
          className="group block w-full text-center px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-2xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20"
        >
          <span className="flex items-center justify-center gap-2">
            Account erstellen
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </a>
      </div>
    </div>
  );
}

function AccountExistsState({
  practiceName,
  invitedEmail,
  inviteToken,
}: {
  practiceName: string;
  invitedEmail: string;
  inviteToken: string;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight">
          Team-Einladung
        </h1>
        <div className="text-left space-y-3 text-slate-600 leading-relaxed">
          <p>
            Sie wurden zu <span className="font-semibold text-slate-900">{practiceName}</span>{" "}
            eingeladen.
          </p>
          <p>
            Für die E-Mail-Adresse <span className="font-mono text-sm text-slate-900">{invitedEmail}</span>{" "}
            existiert bereits ein SmileScan-Konto.
          </p>
          <p>Bitte melden Sie sich an, um die Einladung anzunehmen.</p>
        </div>
      </div>

      <div className="pt-4">
        <a
          href={`/login?invite=${inviteToken}&email=${encodeURIComponent(invitedEmail)}`}
          className="group block w-full text-center px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-2xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20"
        >
          <span className="flex items-center justify-center gap-2">
            Anmelden und beitreten
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </a>
      </div>
    </div>
  );
}

function CanAcceptState({
  practiceName,
  invitedEmail,
  isAccepting,
  acceptError,
  onAccept,
}: {
  practiceName: string;
  invitedEmail: string;
  isAccepting: boolean;
  acceptError: string;
  onAccept: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight">
          Einladung bestätigen
        </h1>
        <div className="text-left space-y-3 text-slate-600 leading-relaxed">
          <p>
            Sie wurden zu <span className="font-semibold text-slate-900">{practiceName}</span>{" "}
            eingeladen.
          </p>
          <p>
            E-Mail: <span className="font-mono text-sm text-slate-900">{invitedEmail}</span>
          </p>
        </div>
      </div>

      {acceptError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-sm text-red-600 text-left leading-relaxed">{acceptError}</p>
        </div>
      )}

      <div className="pt-4">
        <Button
          onClick={onAccept}
          disabled={isAccepting}
          className="w-full px-8 py-4 h-auto bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-2xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isAccepting ? (
            <span className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Wird bearbeitet…
            </span>
          ) : (
            "Einladung annehmen"
          )}
        </Button>
      </div>
    </div>
  );
}

function WrongAccountState({
  invitedEmail,
  currentEmail,
  inviteToken,
}: {
  invitedEmail: string;
  currentEmail: string;
  inviteToken: string;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 mb-2">
          <AlertCircle className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight">
          Falsches Konto
        </h1>
        <div className="text-left space-y-3 text-slate-600 leading-relaxed">
          <p>
            Diese Einladung ist für{" "}
            <span className="font-mono text-sm text-slate-900">{invitedEmail}</span>
          </p>
          <p>
            Sie sind angemeldet als{" "}
            <span className="font-mono text-sm text-slate-900">{currentEmail}</span>
          </p>
          <p>Bitte melden Sie sich ab, um mit dem richtigen Konto fortzufahren.</p>
        </div>
      </div>

      <div className="pt-4">
        <form action="/api/auth/logout" method="POST">
          <input type="hidden" name="return_to" value={`/accept-invite?token=${inviteToken}`} />
          <Button
            type="submit"
            variant="outline"
            className="w-full px-8 py-4 h-auto bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-2xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <LogOut className="w-5 h-5" />
              Abmelden
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}

function OtherWorkspaceState({
  currentWorkspace,
  inviteToken,
}: {
  currentWorkspace?: string;
  inviteToken: string;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 mb-2">
          <AlertCircle className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight">
          Bereits anderer Workspace
        </h1>
        <div className="text-left space-y-3 text-slate-600 leading-relaxed">
          <p>
            Sie sind bereits Mitglied von{" "}
            <span className="font-semibold text-slate-900">
              {currentWorkspace || "einer anderen Praxis"}
            </span>
            .
          </p>
          <p>Ein Benutzer kann nicht Mitglied von zwei Workspaces gleichzeitig sein.</p>
          <p>Bitte verlassen Sie zuerst Ihren aktuellen Workspace oder melden Sie sich ab.</p>
        </div>
      </div>

      <div className="pt-4">
        <form action="/api/auth/logout" method="POST">
          <input type="hidden" name="return_to" value={`/accept-invite?token=${inviteToken}`} />
          <Button
            type="submit"
            variant="outline"
            className="w-full px-8 py-4 h-auto bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-900 rounded-2xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <LogOut className="w-5 h-5" />
              Abmelden
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}

function AlreadyMemberState() {
  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 mb-2">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-light text-slate-900 tracking-tight">
          Bereits Mitglied
        </h1>
        <p className="text-slate-600 leading-relaxed">
          Sie sind bereits Mitglied dieses Workspaces.
        </p>
      </div>

      <div className="pt-4">
        <a
          href="/dashboard"
          className="group block w-full text-center px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-2xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20"
        >
          <span className="flex items-center justify-center gap-2">
            Zum Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </a>
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
        className="w-full h-auto filter drop-shadow-sm"
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

// Mock server functions - replace with actual implementation
async function getInviteData(token: string): Promise<InviteData> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock: return different states for testing
  // In production, call your API to get actual invite state

  return {
    state: "no-account",
    practiceName: "Praxis Dr. Müller",
    invitedEmail: "max.mustermann@beispiel.de",
  };
}

async function acceptInvitation(token: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // In production:
  // 1. Verify user is authenticated
  // 2. Verify email matches invite
  // 3. Add user to workspace
  // 4. Return user role for redirect
  console.log("Invitation accepted:", token);
}

// Animations
const styles = `
  @keyframes pulse-glow {
    0%, 100% {
      opacity: 1;
      filter: drop-shadow(0 0 0 rgba(51, 65, 85, 0));
    }
    50% {
      opacity: 0.95;
      filter: drop-shadow(0 0 8px rgba(51, 65, 85, 0.1));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-pulse-glow {
      animation: none;
    }
  }

  .animate-pulse-glow {
    animation: pulse-glow 3s ease-in-out infinite;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
