"use client";

import { usePathname } from "next/navigation";

import { resolveWorkspacePageContext } from "@/lib/app-shell/workspace-page-context";

export function WorkspacePageContext() {
  const pathname = usePathname() || "";
  const ctx = resolveWorkspacePageContext(pathname);

  return (
    <div className="yd-workspace-context min-w-0">
      <p className="yd-workspace-context__title">{ctx.title}</p>
      {ctx.hint ? <p className="yd-workspace-context__hint">{ctx.hint}</p> : null}
    </div>
  );
}
