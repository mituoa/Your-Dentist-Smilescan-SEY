"use client";

import { Check } from "lucide-react";

import {
  APP_LOCALES,
  getLocaleMeta,
  localeUsesEnglishUiFallback,
} from "@/lib/locale";
import { cn } from "@/lib/utils";

import { useLocale } from "./locale-provider";

type LocaleSwitcherProps = {
  className?: string;
  variant?: "compact" | "labeled" | "grid";
  showLabel?: boolean;
};

export function LocaleSwitcher({
  className,
  variant = "compact",
  showLabel = true,
}: LocaleSwitcherProps) {
  const { locale, setLocale, isPending, messages, error } = useLocale();

  if (variant === "grid") {
    return (
      <div className={cn("yd-locale-grid", className)}>
        {error ? (
          <p className="yd-locale-grid__error" role="alert">
            {error}
          </p>
        ) : null}
        <div
          className="yd-locale-grid__list"
          role="listbox"
          aria-label={messages.settings.language.title}
          aria-busy={isPending}
        >
          {APP_LOCALES.map((code) => {
            const meta = getLocaleMeta(code);
            const active = locale === code;
            const fallback = localeUsesEnglishUiFallback(code);
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={active}
                disabled={isPending}
                className={cn("yd-locale-grid__card", active && "yd-locale-grid__card--active")}
                onClick={() => setLocale(code)}
              >
                <span className="yd-locale-grid__card-top">
                  <span className="yd-locale-grid__code" aria-hidden>
                    {code.toUpperCase()}
                  </span>
                  {active ? (
                    <span className="yd-locale-grid__check" aria-hidden>
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                  ) : null}
                </span>
                <span className="yd-locale-grid__native">{meta.nativeName}</span>
                <span className="yd-locale-grid__region">{meta.regionLabel}</span>
                {fallback ? (
                  <span className="yd-locale-grid__badge">{messages.settings.language.uiEnglish}</span>
                ) : null}
              </button>
            );
          })}
        </div>
        <p className="yd-locale-grid__note">{messages.settings.language.note}</p>
      </div>
    );
  }

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
      {error ? (
        <p className="yd-locale-switcher__error" role="alert">
          {error}
        </p>
      ) : null}
      <div
        className="yd-locale-switcher__options"
        role="group"
        aria-labelledby={showLabel ? "yd-locale-switcher-label" : undefined}
        aria-label={showLabel ? undefined : messages.common.language}
        aria-busy={isPending}
      >
        {APP_LOCALES.filter((code) => !localeUsesEnglishUiFallback(code)).map((code) => (
          <button
            key={code}
            type="button"
            className={cn(
              "yd-locale-switcher__btn",
              locale === code && "yd-locale-switcher__btn--active"
            )}
            aria-pressed={locale === code}
            disabled={isPending}
            onClick={() => setLocale(code)}
          >
            {getLocaleMeta(code).nativeName}
          </button>
        ))}
      </div>
    </div>
  );
}
