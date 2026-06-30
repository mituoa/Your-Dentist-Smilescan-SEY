export const en = {
  common: {
    language: "Language",
    or: "or",
    signOut: "Sign out",
    doctor: "Doctor",
    team: "Team",
  },
  login: {
    title: "Sign in",
    lead: "Sign in with your practice account.",
    emailPlaceholder: "Email address",
    forgotPassword: "Forgot password?",
    submit: "Sign in",
    submitPending: "Signing in…",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    google: "Continue with Google",
    googlePending: "Redirecting to Google…",
    resendTitle: "Didn't receive a confirmation email?",
    resent: "Confirmation email sent again. Please check your spam folder.",
    privacy: "Privacy",
    imprint: "Imprint",
    errors: {
      accountPendingTitle: "Practice under review",
      accountPendingBody:
        "Your registration and documents are being validated. You can sign in once your access is approved.",
      workspaceMissingTitle: "No practice access found",
      workspaceMissingBody:
        "No practice is linked to your account yet, or a team invitation is still pending. Check your email or contact your practice.",
      emailNotConfirmedTitle: "Email not confirmed yet",
      emailNotConfirmedBody:
        "Please confirm your email first. If you can't find the message, you can resend it.",
      authCallbackTitle: "Link invalid or expired",
      authCallbackBody: "Please try again or request a new confirmation email.",
      providerTitle: "Sign-in provider unavailable",
      providerBody:
        "This sign-in provider is not enabled in your environment. Please use email and password.",
      generic: "Sign-in could not be completed. Please try again.",
      invalidCredentials: "Email or password is invalid.",
    },
  },
  settings: {
    language: {
      title: "Language",
      description: "Choose the language for menus, settings and system messages in this browser.",
      saved: "Language updated.",
    },
    security: {
      title: "Security",
      description: "Password, appearance and session for your account.",
      appearance: "Appearance",
      light: "Light",
      dark: "Dark",
      changePassword: "Change password",
      email: "Email",
    },
    nav: {
      sprache: "Language",
      spracheHint: "Interface language",
    },
  },
  nav: {
    atlas: "Atlas",
    atlasDesc: "Practice overview",
    tracker: "Tracker",
    trackerDesc: "Patient cases",
    relay: "Relay",
    relayDesc: "Tasks & messages",
    profile: "Profile",
    profileDesc: "User",
    careCenter: "Care Center",
    careCenterDesc: "Patient knowledge",
    admin: "Admin",
    adminDesc: "Settings",
    closeNav: "Close navigation",
  },
} ;

export type Messages = typeof en;
