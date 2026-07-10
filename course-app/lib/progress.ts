import {
  COURSE,
  checkpointId,
  finalChecklistId,
} from "@/lib/course";
import type { Module, ProgressState } from "@/lib/types";

export const STORAGE_KEY = "agentic-memory-course-progress-v2";

export function getDefaultProgress(): ProgressState {
  return {
    checkpoints: {},
    modulesComplete: {},
    completionChecklist: {},
    lastModule: null,
    lastUpdated: null,
  };
}

export function getTotalCheckpoints(): number {
  const moduleCps = COURSE.modules.reduce(
    (sum, m) => sum + m.checkpoints.length,
    0
  );
  return moduleCps + COURSE.completionChecklist.length;
}

export function getCompletedCount(state: ProgressState): number {
  const moduleDone = Object.values(state.checkpoints).filter(Boolean).length;
  const finalDone = Object.values(state.completionChecklist).filter(
    Boolean
  ).length;
  return moduleDone + finalDone;
}

export function getOverallPercent(state: ProgressState): number {
  const total = getTotalCheckpoints();
  if (!total) return 0;
  return Math.round((getCompletedCount(state) / total) * 100);
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
  level: string,
  state: ProgressState
): number {
  const modules = COURSE.modules.filter((m) => m.level === level);
  if (!modules.length) return 0;
  const sum = modules.reduce(
    (acc, m) => acc + getModuleProgress(m, state),
    0
  );
  return Math.round(sum / modules.length);
}
