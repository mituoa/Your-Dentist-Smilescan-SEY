import type { ReactNode } from "react";

type AtlasWorkspaceShellProps = {
  children: ReactNode;
};

/** Floating cockpit canvas — layered cards inside, blue atmosphere outside. */
export function AtlasWorkspaceShell({ children }: AtlasWorkspaceShellProps) {
  return (
    <div className="yd-cockpit-canvas" aria-label="Praxis-Arbeitsbereich">
      <div className="yd-cockpit-canvas__inner">{children}</div>
    </div>
  );
}
