import * as React from "react";
import { Login } from "./components/auth/Login";
import { LoginThemeShowcase } from "./components/auth/LoginThemeVariants";
import { LoginStateReference } from "./components/auth/LoginStateReference";

type View = "login" | "themes" | "states";

export default function App() {
  const [view, setView] = React.useState<View>("login");

  // Example: Parse invite token from URL (in real app, use router)
  const urlParams = new URLSearchParams(window.location.search);
  const inviteToken = urlParams.get("invite");
  const viewParam = urlParams.get("view") as View | null;

  React.useEffect(() => {
    if (viewParam && ["login", "themes", "states"].includes(viewParam)) {
      setView(viewParam);
    }
  }, [viewParam]);

  // Navigation buttons
  const NavBar = () => (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200 px-4 py-2 flex gap-2">
      <button
        onClick={() => setView("login")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "login"
            ? "bg-blue-600 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Login Page
      </button>
      <button
        onClick={() => setView("themes")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "themes"
            ? "bg-blue-600 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Theme Variants
      </button>
      <button
        onClick={() => setView("states")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "states"
            ? "bg-blue-600 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        State Reference
      </button>
    </div>
  );

  return (
    <>
      {view !== "login" && <NavBar />}
      {view === "login" && (
        <>
          <NavBar />
          <Login inviteToken={inviteToken} />
        </>
      )}
      {view === "themes" && <LoginThemeShowcase />}
      {view === "states" && <LoginStateReference />}
    </>
  );
}