import {
  getCourse,
  checkpointId,
  finalChecklistId,
} from "@/lib/course";
import type { CourseId, Module, ProgressState } from "@/lib/types";

export const STORAGE_KEY = "course-platform-progress-v1";
export const LEGACY_STORAGE_KEY = "agentic-memory-course-progress-v2";

export function getDefaultProgress(): ProgressState {
  return {
    checkpoints: {},
    modulesComplete: {},
    completionChecklist: {},
    projects: {},
    lastModule: null,
    lastUpdated: null,
  };
}

export function getTotalCheckpoints(courseId: CourseId): number {
  const course = getCourse(courseId);
  const moduleCps = course.modules.reduce(
    (sum, m) => sum + m.checkpoints.length,
    0
  );
  return moduleCps + course.completionChecklist.length;
}

export function getCompletedCount(
  courseId: CourseId,
  state: ProgressState
): number {
  const moduleDone = Object.values(state.checkpoints).filter(Boolean).length;
  const finalDone = Object.values(state.completionChecklist).filter(
    Boolean
  ).length;
  return moduleDone + finalDone;
}

export function getOverallPercent(
  courseId: CourseId,
  state: ProgressState
): number {
  const total = getTotalCheckpoints(courseId);
  if (!total) return 0;
  return Math.round((getCompletedCount(courseId, state) / total) * 100);
}

export function getModuleProgress(
  module: Module,
  state: ProgressState
): number {
  if (state.modulesComplete[module.id]) return 100;
  if (!module.checkpoints.length) return 0;
  const done = module.checkpoints.filter((_, i) =>
    state.checkpoints[checkpointId(module.id, i)]
  ).length;
  return Math.round((done / module.checkpoints.length) * 100);
}

export function isModuleComplete(
  module: Module,
  state: ProgressState
): boolean {
  if (state.modulesComplete[module.id]) return true;
  if (!module.checkpoints.length) return false;
  return module.checkpoints.every((_, i) =>
    state.checkpoints[checkpointId(module.id, i)]
  );
}

export function markModuleComplete(
  module: Module,
  state: ProgressState
): ProgressState {
  const next: ProgressState = {
    ...state,
    modulesComplete: { ...state.modulesComplete, [module.id]: true },
    checkpoints: { ...state.checkpoints },
  };
  module.checkpoints.forEach((_, i) => {
    next.checkpoints[checkpointId(module.id, i)] = true;
  });
  return next;
}

export function getLevelProgress(
  courseId: CourseId,
  level: string,
  state: ProgressState
): number {
  const modules = getCourse(courseId).modules.filter((m) => m.level === level);
  if (!modules.length) return 0;
  const sum = modules.reduce(
    (acc, m) => acc + getModuleProgress(m, state),
    0
  );
  return Math.round(sum / modules.length);
}

export function getCompletedModuleCount(
  courseId: CourseId,
  state: ProgressState
): number {
  return getCourse(courseId).modules.filter((m) =>
    isModuleComplete(m, state)
  ).length;
}

export function getResumeModuleId(
  courseId: CourseId,
  state: ProgressState
): number {
  if (state.lastModule != null) return state.lastModule;
  const next = getCourse(courseId).modules.find(
    (m) => !isModuleComplete(m, state)
  );
  return next?.id ?? getCourse(courseId).modules[0]?.id ?? 0;
}
