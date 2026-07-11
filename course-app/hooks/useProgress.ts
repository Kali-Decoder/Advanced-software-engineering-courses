"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getDefaultProgress,
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
} from "@/lib/progress";
import type { AllCoursesProgress, CourseId, ProgressState } from "@/lib/types";

function migrateLegacyProgress(): AllCoursesProgress | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const legacy = JSON.parse(raw) as ProgressState;
    return {
      courses: {
        "agentic-memory": { ...getDefaultProgress(), ...legacy },
      },
    };
  } catch {
    return null;
  }
}

function loadAllProgress(): AllCoursesProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AllCoursesProgress;
    }
    const migrated = migrateLegacyProgress();
    if (migrated) return migrated;
  } catch {
    // fall through
  }
  return { courses: {} };
}

export function useProgress() {
  const [allProgress, setAllProgress] = useState<AllCoursesProgress>({
    courses: {},
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAllProgress(loadAllProgress());
    setHydrated(true);
  }, []);

  const getCourseProgress = useCallback(
    (courseId: CourseId): ProgressState => {
      return allProgress.courses[courseId] ?? getDefaultProgress();
    },
    [allProgress]
  );

  const persistCourse = useCallback(
    (courseId: CourseId, next: ProgressState) => {
      const withMeta = {
        ...next,
        lastUpdated: new Date().toISOString(),
      };
      setAllProgress((prev) => {
        const updated: AllCoursesProgress = {
          courses: { ...prev.courses, [courseId]: withMeta },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const resetCourse = useCallback((courseId: CourseId) => {
    const fresh = getDefaultProgress();
    setAllProgress((prev) => {
      const updated: AllCoursesProgress = {
        courses: { ...prev.courses, [courseId]: fresh },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetAll = useCallback(() => {
    const empty: AllCoursesProgress = { courses: {} };
    setAllProgress(empty);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(empty));
  }, []);

  return {
    allProgress,
    hydrated,
    getCourseProgress,
    persistCourse,
    resetCourse,
    resetAll,
  };
}
