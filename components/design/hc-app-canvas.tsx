import type { ReactNode } from "react";

import { YdWorkspaceCanvas } from "@/components/design-system/yd-workspace-canvas";

type HcAppCanvasProps = {
  children: ReactNode;
  className?: string;
};

/** @deprecated Prefer YdWorkspaceCanvas. */
export function HcAppCanvas({ children, className }: HcAppCanvasProps) {
  return <YdWorkspaceCanvas className={className}>{children}</YdWorkspaceCanvas>;
}
