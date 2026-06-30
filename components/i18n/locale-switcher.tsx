"use client";

import { APP_LOCALES, localeDisplayName, type AppLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

import { useLocale } from "./locale-provider";

type LocaleSwitcherProps = {
  className?: string;
  variant?: "compact" | "labeled";
  showLabel?: boolean;
};

export function LocaleSwitcher({
  className,
  variant = "compact",
  showLabel = true,
}: LocaleSwitcherProps) {
  const { locale, setLocale, isPending, messages } = useLocale();

  return (
    <div
      className={cn(
        "yd-locale-switcher",
        variant === "labeled" && "yd-locale-switcher--labeled",
        className
      )}
    >
      {showLabel ? (
        <span className="yd-locale-switcher__label" id="yd-locale-switcher-label">
          {messages.common.language}
        </span>
      ) : null}
      <div
        className="yd-locale-switcher__options"
        role="group"
        aria-labelledby={showLabel ? "yd-locale-switcher-label" : undefined}
        aria-label={showLabel ? undefined : messages.common.language}
      >
        {APP_LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            className={cn(
              "yd-locale-switcher__btn",
              locale === code && "yd-locale-switcher__btn--active"
            )}
            aria-pressed={locale === code}
            disabled={isPending}
            onClick={() => setLocale(code as AppLocale)}
          >
            {localeDisplayName(code, locale)}
          </button>
        ))}
      </div>
    </div>
  );
}
