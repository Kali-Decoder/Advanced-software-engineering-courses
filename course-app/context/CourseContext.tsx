"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CourseId, CourseMeta } from "@/lib/types";
import { getCourse, getCourseMeta } from "@/lib/course";

interface CourseContextValue {
  courseId: CourseId;
  meta: CourseMeta;
  course: ReturnType<typeof getCourse>;
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({
  courseId,
  children,
}: {
  courseId: CourseId;
  children: ReactNode;
}) {
  const value: CourseContextValue = {
    courseId,
    meta: getCourseMeta(courseId),
    course: getCourse(courseId),
  };
  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
}

export function useCourseContext() {
  const ctx = useContext(CourseContext);
  if (!ctx) {
    throw new Error("useCourseContext must be used within CourseProvider");
  }
  return ctx;
}
