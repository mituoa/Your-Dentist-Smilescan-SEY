"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import { setLocalePreference } from "@/app/actions/locale";
import { getMessages, type Messages } from "@/lib/i18n/messages";
import { getLocaleMeta, type AppLocale } from "@/lib/locale";

type LocaleContextValue = {
  locale: AppLocale;
  messages: Messages;
  setLocale: (locale: AppLocale) => void;
  isPending: boolean;
  error: string | null;
  clearError: () => void;
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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inFlightRef = useRef(false);

  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  useEffect(() => {
    const meta = getLocaleMeta(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.direction;
  }, [locale]);

  const clearError = useCallback(() => setError(null), []);

  const setLocale = useCallback(
    (next: AppLocale) => {
      if (next === locale || inFlightRef.current) return;

      const previous = locale;
      setError(null);
      setLocaleState(next);
      inFlightRef.current = true;

      void (async () => {
        try {
          await setLocalePreference(next);
          startTransition(() => {
            router.refresh();
          });
        } catch {
          setLocaleState(previous);
          setError(
            previous === "de"
              ? "Die Sprache konnte nicht gespeichert werden. Bitte erneut versuchen."
              : "Could not save language. Please try again."
          );
        } finally {
          inFlightRef.current = false;
        }
      })();
    },
    [locale, router]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      messages: getMessages(locale),
      setLocale,
      isPending,
      error,
      clearError,
    }),
    [locale, setLocale, isPending, error, clearError]
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
