"use client";

import { HeatProvider } from "@/lib/heat-context";

export default function HeatIndexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HeatProvider>{children}</HeatProvider>;
}
