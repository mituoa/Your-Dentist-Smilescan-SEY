import * as React from "react";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { ForgotPassword } from "./components/auth/ForgotPassword";
import { ResetPassword } from "./components/auth/ResetPassword";
import { AcceptInvite } from "./components/auth/AcceptInvite";
import { LoginThemeShowcase } from "./components/auth/LoginThemeVariants";
import { LoginStateReference } from "./components/auth/LoginStateReference";
import { RegisterStateReference } from "./components/auth/RegisterStateReference";
import { ForgotPasswordStateReference } from "./components/auth/ForgotPasswordStateReference";

type View = "login" | "register" | "forgot-password" | "reset-password" | "accept-invite" | "themes" | "states" | "register-states" | "forgot-states";

export default function App() {
  const [view, setView] = React.useState<View>("accept-invite");

  // Example: Parse params from URL (in real app, use router)
  const urlParams = new URLSearchParams(window.location.search);
  const inviteToken = urlParams.get("invite");
  const prefilledEmail = urlParams.get("email");
  const errorMessage = urlParams.get("error");
  const successSent = urlParams.get("sent") === "1";
  const resetToken = urlParams.get("token");
  const viewParam = urlParams.get("view") as View | null;

  React.useEffect(() => {
    if (viewParam && ["login", "register", "forgot-password", "reset-password", "accept-invite", "themes", "states", "register-states", "forgot-states"].includes(viewParam)) {
      setView(viewParam);
    }
  }, [viewParam]);

  // Navigation buttons - using Premium (Slate-Blue) theme colors
  const NavBar = () => (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200 px-4 py-2 flex gap-2 flex-wrap justify-center max-w-3xl">
      <button
        onClick={() => setView("login")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "login"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Login
      </button>
      <button
        onClick={() => setView("register")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "register"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Register
      </button>
      <button
        onClick={() => setView("forgot-password")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "forgot-password"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Forgot Password
      </button>
      <button
        onClick={() => setView("reset-password")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "reset-password"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Reset Password
      </button>
      <button
        onClick={() => setView("accept-invite")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "accept-invite"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Accept Invite
      </button>
      <button
        onClick={() => setView("themes")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "themes"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Themes
      </button>
      <button
        onClick={() => setView("states")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "states"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Login States
      </button>
      <button
        onClick={() => setView("register-states")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "register-states"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Register States
      </button>
      <button
        onClick={() => setView("forgot-states")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "forgot-states"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Forgot States
      </button>
    </div>
  );

  return (
    <>
      {view !== "login" && view !== "register" && view !== "forgot-password" && view !== "reset-password" && view !== "accept-invite" && <NavBar />}
      {view === "login" && (
        <>
          <NavBar />
          <Login inviteToken={inviteToken} />
        </>
      )}
      {view === "register" && (
        <>
          <NavBar />
          <Register
            inviteToken={inviteToken}
            inviteWorkspaceName={inviteToken ? "Praxis Dr. Müller" : null}
            prefilledEmail={prefilledEmail}
            errorMessage={errorMessage}
          />
        </>
      )}
      {view === "forgot-password" && (
        <>
          <NavBar />
          <ForgotPassword
            inviteToken={inviteToken}
            prefilledEmail={prefilledEmail}
            errorMessage={errorMessage}
            successSent={successSent}
          />
        </>
      )}
      {view === "reset-password" && (
        <>
          <NavBar />
          <ResetPassword
            resetToken={resetToken}
            inviteToken={inviteToken}
          />
        </>
      )}
      {view === "accept-invite" && (
        <>
          <NavBar />
          <AcceptInvite inviteToken={inviteToken || "test-invite-token"} />
        </>
      )}
      {view === "themes" && <LoginThemeShowcase />}
      {view === "states" && <LoginStateReference />}
      {view === "register-states" && <RegisterStateReference />}
      {view === "forgot-states" && <ForgotPasswordStateReference />}
    </>
  );
}