import * as React from "react";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { LoginThemeShowcase } from "./components/auth/LoginThemeVariants";
import { LoginStateReference } from "./components/auth/LoginStateReference";
import { RegisterStateReference } from "./components/auth/RegisterStateReference";

type View = "login" | "register" | "themes" | "states" | "register-states";

export default function App() {
  const [view, setView] = React.useState<View>("register");

  // Example: Parse params from URL (in real app, use router)
  const urlParams = new URLSearchParams(window.location.search);
  const inviteToken = urlParams.get("invite");
  const prefilledEmail = urlParams.get("email");
  const errorMessage = urlParams.get("error");
  const viewParam = urlParams.get("view") as View | null;

  React.useEffect(() => {
    if (viewParam && ["login", "register", "themes", "states", "register-states"].includes(viewParam)) {
      setView(viewParam);
    }
  }, [viewParam]);

  // Navigation buttons - using Premium (Slate-Blue) theme colors
  const NavBar = () => (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200 px-4 py-2 flex gap-2 flex-wrap justify-center max-w-2xl">
      <button
        onClick={() => setView("login")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "login"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Login
      </button>
      <button
        onClick={() => setView("register")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "register"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Register
      </button>
      <button
        onClick={() => setView("themes")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "themes"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Themes
      </button>
      <button
        onClick={() => setView("states")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "states"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Login States
      </button>
      <button
        onClick={() => setView("register-states")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "register-states"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Register States
      </button>
    </div>
  );

  return (
    <>
      {view !== "login" && view !== "register" && <NavBar />}
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
      {view === "themes" && <LoginThemeShowcase />}
      {view === "states" && <LoginStateReference />}
      {view === "register-states" && <RegisterStateReference />}
    </>
  );
}