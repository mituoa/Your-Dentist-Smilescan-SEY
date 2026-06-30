"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { setLocalePreference } from "@/app/actions/locale";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import { type AppLocale } from "@/lib/locale";

type LocaleContextValue = {
  locale: AppLocale;
  messages: Messages;
  setLocale: (locale: AppLocale) => void;
  isPending: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: AppLocale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  const setLocale = useCallback(
    (next: AppLocale) => {
      if (next === locale) return;
      setLocaleState(next);
      startTransition(async () => {
        await setLocalePreference(next);
        router.refresh();
      });
    },
    [locale, router]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      messages: getMessages(locale),
      setLocale,
      isPending,
    }),
    [locale, setLocale, isPending]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function useOptionalLocale() {
  return useContext(LocaleContext);
}
