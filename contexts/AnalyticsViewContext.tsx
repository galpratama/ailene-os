"use client";

import type { WarehouseAnalytics } from "@/apis/analytics";
import { createContext, useContext, type ReactNode } from "react";

export type AnalyticsFilterKey = "host" | "channel" | "campaign";

type AnalyticsView = {
  data: WarehouseAnalytics;
  activeFilters: Record<AnalyticsFilterKey, boolean>;
  today: string;
};

const AnalyticsViewContext = createContext<AnalyticsView | null>(null);

export function AnalyticsViewProvider({ value, children }: { value: AnalyticsView; children: ReactNode }) {
  return <AnalyticsViewContext.Provider value={value}>{children}</AnalyticsViewContext.Provider>;
}

export function useAnalyticsView() {
  const view = useContext(AnalyticsViewContext);
  if (!view) throw new Error("useAnalyticsView must be used inside AnalyticsViewProvider");
  return view;
}
