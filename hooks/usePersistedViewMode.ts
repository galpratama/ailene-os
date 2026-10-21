"use client";

import type { ViewModeOS } from "@/components/buttons/ViewModeToggleOS";
import { useCallback, useEffect, useState } from "react";

function readSaved(storageKey: string) {
  try {
    return sessionStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

// Starts on defaultMode so the first client render matches the server, then restores this tab's last pick after mount.
export function usePersistedViewMode<T extends ViewModeOS>(
  storageKey: string,
  allowed: readonly T[],
  defaultMode: T,
  legacyModes?: Partial<Record<ViewModeOS, T>>
) {
  const [viewMode, setViewModeState] = useState<T>(defaultMode);

  useEffect(() => {
    const saved = readSaved(storageKey);
    const restored = legacyModes?.[saved as ViewModeOS] ?? saved;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (allowed.includes(restored as T)) setViewModeState(restored as T);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Saved only on an explicit pick, so the default render can never overwrite the stored choice.
  const setViewMode = useCallback(
    (next: T) => {
      setViewModeState(next);
      try {
        sessionStorage.setItem(storageKey, next);
      } catch {}
    },
    [storageKey]
  );

  return [viewMode, setViewMode] as const;
}
