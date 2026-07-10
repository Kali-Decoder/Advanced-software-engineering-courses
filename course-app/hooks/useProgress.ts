"use client";

import { useCallback, useEffect, useState } from "react";
import { getDefaultProgress, STORAGE_KEY } from "@/lib/progress";
import type { ProgressState } from "@/lib/types";

export function useProgress() {
  const [state, setState] = useState<ProgressState>(getDefaultProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState({ ...getDefaultProgress(), ...JSON.parse(raw) });
      }
    } catch {
      setState(getDefaultProgress());
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: ProgressState) => {
    const withMeta = {
      ...next,
      lastUpdated: new Date().toISOString(),
    };
    setState(withMeta);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withMeta));
  }, []);

  const reset = useCallback(() => {
    const fresh = getDefaultProgress();
    setState(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  }, []);

  return { state, hydrated, persist, reset };
}
