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
      className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[10px] border-2 border-slate-200 bg-white text-[15px] font-medium text-slate-900 shadow-none hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
