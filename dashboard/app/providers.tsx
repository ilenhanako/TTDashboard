"use client";

import { DashboardProvider } from "@/lib/context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <DashboardProvider>{children}</DashboardProvider>;
}
