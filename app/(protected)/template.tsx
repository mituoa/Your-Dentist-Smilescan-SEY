"use client";

import { usePathname } from "next/navigation";

/**
 * Soft content enter on route change — shell (sidebar/topbar) stays in layout.tsx.
 */
export default function ProtectedTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="protected-workspace-enter flex min-h-0 flex-1 flex-col">
      {children}
    </div>
  );
}
