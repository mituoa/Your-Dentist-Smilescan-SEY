import * as React from "react";
import { Menu, X, Sun, Moon, LogOut, ChevronDown, ChevronRight } from "lucide-react";

type UserRole = "doctor" | "staff";

interface User {
  name: string;
  email: string;
  role: UserRole;
}

interface Workspace {
  name: string;
}

interface AppShellProps {
  children: React.ReactNode;
  user: User;
  workspace: Workspace;
  currentPath: string;
}

export function AppShell({ children, user, workspace, currentPath }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [journalsExpanded, setJournalsExpanded] = React.useState(
    currentPath.startsWith("/journal")
  );

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const mainNavItems = [
    { label: "Atlas", path: "/atlas" },
    { label: "SmileScan", path: "/smilescan" },
    { label: "Relay", path: "/relay" },
    { label: "Portrait", path: "/portrait" },
  ];

  const journalSubItems = [
    { label: "Entwürfe", path: "/journal/drafts" },
    { label: "Veröffentlicht", path: "/journal/published" },
    { label: "Geplant", path: "/journal/scheduled" },
  ];

  const NavLinks = () => (
    <>
      {mainNavItems.map((item) => {
        const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
        return (
          <a
            key={item.path}
            href={item.path}
            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {item.label}
          </a>
        );
      })}

      {/* Journals with submenu */}
      <div>
        <button
          onClick={() => setJournalsExpanded(!journalsExpanded)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPath.startsWith("/journal")
              ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
          }`}
        >
          <span>Journals</span>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${
              journalsExpanded ? "rotate-90" : ""
            }`}
          />
        </button>

        {journalsExpanded && (
          <div className="mt-1 ml-3 space-y-1">
            {journalSubItems.map((item) => {
              const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "text-slate-900 bg-slate-50 dark:text-white dark:bg-slate-800/50"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-500 dark:hover:text-white dark:hover:bg-slate-800/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        )}
      </div>

      <a
        href="/settings"
        className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          currentPath === "/settings" || currentPath.startsWith("/settings/")
            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        Settings
      </a>
    </>
  );

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        {/* Desktop Sidebar */}
        <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex items-center px-4 mb-8">
                <span className="text-xl font-semibold text-slate-900 dark:text-white">SmileScan</span>
              </div>
              <nav className="mt-5 flex-1 space-y-1 px-2">
                <NavLinks />
              </nav>
            </div>
          </div>
        </aside>

        {/* Desktop Header */}
        <div className="hidden md:block md:pl-64">
          <div className="sticky top-0 z-10 flex h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
            <div className="flex flex-1 justify-end items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              <div className="flex items-center gap-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{workspace.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{user.name}</div>
                </div>
                <button className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/50 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Mobile Top Bar */}
        <div className="md:hidden sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 sm:gap-x-6 sm:px-6">
          <span className="text-lg font-semibold text-slate-900 dark:text-white">SmileScan</span>

          <div className="flex flex-1 justify-end items-center gap-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            <button
              type="button"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-slate-900">
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
              <span className="text-lg font-semibold text-slate-900 dark:text-white">SmileScan</span>
              <button
                type="button"
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="px-4 py-6 space-y-1">
              <NavLinks />

              <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="px-3 py-2 text-sm">
                  <div className="font-medium text-slate-900 dark:text-white">{workspace.name}</div>
                  <div className="text-slate-500 dark:text-slate-400">{user.name}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{user.email}</div>
                </div>

                <form action="/api/auth/logout" method="POST" className="mt-4">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Abmelden
                  </button>
                </form>
              </div>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="md:pl-64">
          {children}
        </main>
      </div>
    </div>
  );
}
