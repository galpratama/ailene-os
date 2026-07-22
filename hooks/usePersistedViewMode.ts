"use client";

import type { ViewModeOS } from "@/components/buttons/ViewModeToggleOS";
import { useEffect, useState } from "react";

// Always start on defaultMode so the client's first render matches the
// server's (which has no access to localStorage) — read the saved value
// after mount instead of during the initial render, same pattern as
// SidebarContext's isCollapsed persistence.
export function usePersistedViewMode<T extends ViewModeOS>(
  storageKey: string,
  allowed: readonly T[],
  defaultMode: T
) {
  const [viewMode, setViewMode] = useState<T>(defaultMode);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (allowed.includes(saved as T)) setViewMode(saved as T);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, viewMode);
  }, [storageKey, viewMode]);

  return [viewMode, setViewMode] as const;
}
