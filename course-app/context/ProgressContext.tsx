"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useProgress } from "@/hooks/useProgress";
import type { CourseId, ProgressState } from "@/lib/types";

interface ProgressContextValue {
  getCourseProgress: (courseId: CourseId) => ProgressState;
  persistCourse: (courseId: CourseId, state: ProgressState) => void;
  resetCourse: (courseId: CourseId) => void;
  resetAll: () => void;
  hydrated: boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const value = useProgress();
  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgressContext() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgressContext must be used within ProgressProvider");
  }
  return ctx;
}

export function useCourseProgress(courseId: CourseId) {
  const { getCourseProgress, persistCourse, resetCourse, hydrated } =
    useProgressContext();
  const state = getCourseProgress(courseId);

  const persist = (next: ProgressState) => persistCourse(courseId, next);
  const reset = () => resetCourse(courseId);

  return { state, hydrated, persist, reset };
}
