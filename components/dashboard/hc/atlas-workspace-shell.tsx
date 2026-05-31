import type { ReactNode } from "react";

type AtlasWorkspaceShellProps = {
  children: ReactNode;
};

/** Single glass workspace surface — cards live inside, not on page background. */
export function AtlasWorkspaceShell({ children }: AtlasWorkspaceShellProps) {
  return (
    <div className="yd-med-workspace" aria-label="Praxis-Arbeitsbereich">
      <div className="yd-med-workspace__inner">{children}</div>
    </div>
  );
}
