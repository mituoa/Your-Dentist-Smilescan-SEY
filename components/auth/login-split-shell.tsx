import type { ReactNode } from "react";

type LoginSplitShellProps = {
  children: ReactNode;
};

/** Login shell — aligns with existing YD surfaces (no split showcase). */
export function LoginSplitShell({ children }: LoginSplitShellProps) {
  return (
    <div className="yd-login-split">
      <div className="yd-login-split__ambient yd-login-split__ambient--mobile" aria-hidden />
      <main className="yd-login-split__form-col">{children}</main>
    </div>
  );
}
