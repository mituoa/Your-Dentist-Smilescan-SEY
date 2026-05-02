"use client";

import { Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { setThemePreference } from "@/app/actions/theme";
import type { ThemePreference } from "@/lib/theme";

interface ThemeToggleProps {
  initialTheme: ThemePreference;
  /** compact = icon-only for header */
  variant?: "compact" | "labeled";
}

export function ThemeToggle({
  initialTheme,
  variant = "compact",
}: ThemeToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);

  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  const isDark = theme === "dark";
  const nextMode: ThemePreference = isDark ? "light" : "dark";

  const handleClick = () => {
    setTheme(nextMode);
    startTransition(async () => {
      await setThemePreference(nextMode);
      router.refresh();
    });
  };

  const label = isDark ? "Zu hellem Modus wechseln (Sonne)" : "Zu dunklem Modus wechseln (Mond)";

  if (variant === "labeled") {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-surface-card/90 px-4 py-3 backdrop-blur-sm">
        <div>
          <p className="text-sm font-medium text-text-primary">Darstellung</p>
          <p className="text-xs text-text-tertiary">
            Sonne (hell) oder Mond (dunkel). Gilt nur auf diesem Gerät.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          aria-label={label}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-surface-page px-3 py-2 text-sm text-text-primary transition-colors hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50"
        >
          {isDark ? (
            <>
              <Sun className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Sonne
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Mond
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title={label}
      aria-label={label}
      aria-pressed={isDark}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border text-text-secondary transition-colors hover:bg-surface-sunken hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-50"
    >
      {isDark ? (
        <Sun className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
