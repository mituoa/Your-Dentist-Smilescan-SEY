import type { ReactNode } from "react";

import { LoginShowcase } from "@/components/auth/login-showcase";

type LoginSplitShellProps = {
  children: ReactNode;
};

/** Zwei-Spalten-Login wie Referenz — Showcase + Formular. */
export function LoginSplitShell({ children }: LoginSplitShellProps) {
  return (
    <div className="yd-login-split">
      <div className="yd-login-split__ambient yd-login-split__ambient--mobile" aria-hidden />
      <aside className="yd-login-split__showcase-col">
        <LoginShowcase />
      </aside>
      <main className="yd-login-split__form-col">{children}</main>
    </div>
  );
}
