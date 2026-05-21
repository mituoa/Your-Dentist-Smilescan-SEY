"use client";

import type { ReactNode } from "react";

import { YdAwakenStagger } from "@/components/ambient/yd-awaken-stagger";

export function DashboardAmbientHeader({ children }: { children: ReactNode }) {
  return <YdAwakenStagger index={0}>{children}</YdAwakenStagger>;
}

export function DashboardAmbientKpis({ children }: { children: ReactNode }) {
  return <YdAwakenStagger index={1}>{children}</YdAwakenStagger>;
}

export function DashboardAmbientOps({ children }: { children: ReactNode }) {
  return <YdAwakenStagger index={2}>{children}</YdAwakenStagger>;
}

export function DashboardAmbientCharts({ children }: { children: ReactNode }) {
  return <YdAwakenStagger index={3}>{children}</YdAwakenStagger>;
}

export function DashboardAmbientLower({ children }: { children: ReactNode }) {
  return <YdAwakenStagger index={4}>{children}</YdAwakenStagger>;
}
