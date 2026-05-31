"use client";

import { useFormStatus } from "react-dom";

import { AuthLoadingSpinner } from "@/components/auth/auth-loading-spinner";
import { Button } from "@/components/ui/button";
import { AUTH_SIGN_OUT_PATH } from "@/lib/auth/sign-out-constants";
import { LogOut } from "lucide-react";

function SignOutIconSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Abmeldung läuft" : "Abmelden"}
      title="Abmelden"
      className="flex h-9 w-9 items-center justify-center rounded border border-white/70 bg-white/75 text-text-secondary shadow-[0px_6px_14px_rgba(15,23,42,0.08)] transition-colors hover:bg-white hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <AuthLoadingSpinner className="h-4 w-4 shrink-0 animate-spin text-text-secondary motion-reduce:animate-none motion-reduce:opacity-80" />
      ) : (
        <LogOut className="w-4 h-4" strokeWidth={1.75} />
      )}
    </button>
  );
}

function SignOutSidebarSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="flex w-full min-h-[44px] touch-manipulation items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#64748B] transition-colors hover:bg-[rgba(15,23,42,0.04)] hover:text-[#334155] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,23,42,0.12)] disabled:cursor-not-allowed disabled:opacity-60 md:min-h-0 md:py-2"
    >
      {pending ? (
        <span className="text-[#94A3B8]">Wird abgemeldet…</span>
      ) : (
        <>
          <LogOut className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.75} aria-hidden />
          <span>Abmelden</span>
        </>
      )}
    </button>
  );
}

function SignOutRailSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      aria-label={pending ? "Abmeldung läuft" : "Abmelden"}
      title="Abmelden"
      className="flex h-9 w-9 items-center justify-center rounded-full text-[#94a8b8] transition hover:bg-white/45 hover:text-[#5a6f84] disabled:cursor-not-allowed disabled:opacity-60 md:h-10 md:w-10"
    >
      {pending ? (
        <AuthLoadingSpinner className="h-4 w-4 shrink-0 animate-spin motion-reduce:animate-none" />
      ) : (
        <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
      )}
    </button>
  );
}

type SignOutSidebarFormProps = {
  /** Schmale Icon-Rail (Referenz-Dashboard). */
  variant?: "drawer" | "rail";
};

/** Ruhiger Logout unten in der Sidebar (Desktop & Mobile-Drawer). */
export function SignOutSidebarForm({ variant = "drawer" }: SignOutSidebarFormProps) {
  return (
    <form
      action={AUTH_SIGN_OUT_PATH}
      method="post"
      className={variant === "rail" ? "flex justify-center" : "w-full"}
    >
      {variant === "rail" ? <SignOutRailSubmit /> : <SignOutSidebarSubmit />}
    </form>
  );
}

/** Kompakter Logout in der Topbar — kein Doppel-POST, Pending sichtbar. */
export function SignOutIconForm() {
  return (
    <form action={AUTH_SIGN_OUT_PATH} method="post">
      <SignOutIconSubmit />
    </form>
  );
}

function SignOutWideSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      variant="secondary"
      className="flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-[10px] border-2 border-slate-200 bg-white text-[16px] font-medium leading-snug text-slate-900 shadow-none hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-3">
          <AuthLoadingSpinner className="h-5 w-5 shrink-0 animate-spin text-slate-700 motion-reduce:animate-none motion-reduce:opacity-80" />
          Wird abgemeldet…
        </span>
      ) : (
        <>
          <LogOut className="h-5 w-5 shrink-0" aria-hidden />
          Abmelden
        </>
      )}
    </Button>
  );
}

/** Logout mit optionalem `return_to` (z. B. Invite-Flow zurück zur Accept-Seite). */
export function SignOutReturnForm(props: { returnTo: string; className?: string }) {
  return (
    <form action={AUTH_SIGN_OUT_PATH} method="post" className={props.className ?? "w-full"}>
      <input type="hidden" name="return_to" value={props.returnTo} />
      <SignOutWideSubmit />
    </form>
  );
}
